-- Public event submission — the fix for "submitting an event does nothing".
--
-- THE BUG
-- -------
-- `/submit` advertises itself as "free, no account needed", but every
-- anonymous submission was refused by Postgres and shown as a generic
-- "Something went wrong."  Two policies from 0003_rls.sql made it impossible:
--
--   event_sources_write : for all using (auth.uid() is not null)
--   events_insert       : for insert with check (owns_organiser(...) or is_admin())
--
-- `SupabaseEventRepository.submitEvent()` writes `event_sources` first, so a
-- logged-out visitor never got past the very first statement:
--
--   ERROR: new row violates row-level security policy for table "event_sources"
--
-- Even past that, `events.organiser_id` is NOT NULL and `events_insert`
-- demands an organiser the caller owns — which an anonymous submitter, by
-- definition, does not have.  So the public form could never work.
--
-- THE FIX
-- -------
-- Not "disable RLS", and not "let anon insert into events" — that would let
-- anyone write arbitrary rows, including `status = 'published'`.  Instead we
-- keep deny-by-default everywhere and open exactly one audited door: a
-- SECURITY DEFINER function that is the *only* way a public submission
-- enters, and which decides every field that matters (status, ownership,
-- verification) rather than trusting its caller.
--
-- Submissions land as `draft` — the status the admin review queue already
-- reads, and one `events_public_read` already hides from the public.  A new
-- `pending_review` value would have meant the same thing under a new name,
-- with the queue, the stats tiles and `returnToQueue()` all needing edits.

-- ---------------------------------------------------------------------------
-- 1. Heal schema drift.
--
-- 0010 and 0013 use bare `add column`, which errors on a second run, so a
-- database part-way through the sequence is easy to end up with and awkward
-- to repair.  Re-stating them idempotently means this file brings any
-- database to the shape the application actually expects.  On a fully
-- migrated database every line here is a no-op.
--
-- These are exactly the columns the two insert paths reference, and a missing
-- one fails the whole insert:
--   admin  → ERROR: column "poster_image_url" of relation "events" does not exist
--   public → ERROR: column "highlights" of relation "events" does not exist
-- ---------------------------------------------------------------------------
alter table events add column if not exists poster_image_url text;   -- 0010
alter table events add column if not exists highlights       text;   -- 0013
alter table events add column if not exists terms            text;   -- 0013
alter table events add column if not exists review_note      text;   -- 0009
alter table events add column if not exists reviewed_at      timestamptz;            -- 0009
alter table events add column if not exists reviewed_by      uuid references auth.users (id) on delete set null; -- 0009

-- ---------------------------------------------------------------------------
-- 2. `slugify`, in SQL.
--
-- It existed only in TypeScript (packages/shared/src/slug.ts), so the
-- function below — which has to build slugs inside the database — had
-- nothing to call. This mirrors that implementation exactly: strip
-- diacritics, lowercase, non-alphanumerics to hyphens, trim leading and
-- trailing hyphens, cap at 80 characters. `unaccent` is not used because it
-- is an extension that may not be enabled; `translate` covers the Latin-1
-- range that Dutch and transliterated Desi event titles actually contain.
-- ---------------------------------------------------------------------------
create or replace function public.slugify(p_input text)
returns text
language sql
immutable
strict
set search_path = pg_catalog, pg_temp
as $$
  select left(
    trim(both '-' from
      regexp_replace(
        lower(translate(
          p_input,
          'àáâãäåāăąçćĉċčďđèéêëēĕėęěĝğġģĥħìíîïĩīĭįıĵķĺļľłñńņňòóôõöøōŏőŕŗřśŝşšţťŧùúûüũūŭůűųŵýÿŷźżžÀÁÂÃÄÅĀĂĄÇĆĈĊČĎĐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽŁÑŃŅŇÒÓÔÕÖØŌŎŐŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴÝŸŶŹŻŽ',
          'aaaaaaaaacccccddeeeeeeeeegggghhiiiiiiiiijkllllnnnnooooooooorrrsssstttuuuuuuuuuuwyyyzzzAAAAAAAAACCCCCDDEEEEEEEEEGGGGHHIIIIIIIIIJKLLLLNNNNOOOOOOOOORRRSSSSTTTUUUUUUUUUUWYYYZZZ'
        )),
        '[^a-z0-9]+', '-', 'g'
      )
    ),
    80
  );
$$;

comment on function public.slugify is
  'SQL twin of slugify() in packages/shared/src/slug.ts. Keep the two in step.';

-- ---------------------------------------------------------------------------
-- 3. The one door.
--
-- SECURITY DEFINER runs as the function's owner, so it is not subject to the
-- policies above.  That makes the function itself the security boundary, so:
--
--   * `search_path` is pinned — without it a caller could shadow `events`
--     with their own table and have this function write there instead.
--   * `status` is hard-coded to 'draft'.  It is never a parameter, so no
--     caller can self-publish.
--   * organiser ownership and `verified` are decided here, never passed in.
--   * inputs are length-checked, so this cannot be used to write unbounded
--     rows through a public endpoint.
-- ---------------------------------------------------------------------------
create or replace function public.submit_public_event(
  p_title           text,
  p_starts_at       timestamptz,
  p_city            text,
  p_organiser_name  text,
  p_description     text,
  p_highlights      text,
  p_terms           text,
  p_category        text default 'cultural',
  p_venue_name      text default null,
  p_contact_email   text default null,
  p_image_url       text default null,
  p_entry_type      text default 'free',
  p_min_price_cents integer default null,
  p_max_price_cents integer default null,
  p_booking_url     text default null
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid            uuid := auth.uid();
  v_organiser_slug text;
  v_organiser_id   uuid;
  v_venue_id       uuid;
  v_slug           text;
  v_category       event_category;
  v_entry_type     entry_type;
  v_is_free        boolean;
  v_event_id       uuid;
  v_existing       record;
begin
  -- ---- validate ----------------------------------------------------------
  -- These mirror `submitEventSchema`.  The form checks them too; this is the
  -- backstop for anything that reaches the RPC without going through it.
  if coalesce(btrim(p_title), '') = '' then
    raise exception 'Give your event a title' using errcode = 'check_violation';
  end if;
  if length(p_title) > 200 then
    raise exception 'Title is too long (max 200 characters)' using errcode = 'check_violation';
  end if;
  if p_starts_at is null then
    raise exception 'Pick a date and time for the event' using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_city), '') = '' then
    raise exception 'City is required' using errcode = 'check_violation';
  end if;
  if coalesce(btrim(p_organiser_name), '') = '' then
    raise exception 'Organiser name is required' using errcode = 'check_violation';
  end if;
  if length(coalesce(p_description, '')) > 8000
     or length(coalesce(p_highlights, '')) > 2000
     or length(coalesce(p_terms, '')) > 4000 then
    raise exception 'One of the description fields is too long' using errcode = 'check_violation';
  end if;

  -- An unknown category should not lose the submission; the review queue can
  -- retag it. Same for entry type.
  --
  -- 'cultural' is the fallback because it is the broadest real member of the
  -- enum. Note there is NO 'community' member — which is exactly what
  -- SupabaseEventRepository.submitEvent() defaulted to, so every submission
  -- that left the category blank died on:
  --   ERROR: invalid input value for enum event_category: "community"
  begin
    v_category := coalesce(nullif(btrim(p_category), ''), 'cultural')::event_category;
  exception when invalid_text_representation then
    v_category := 'cultural';
  end;

  begin
    v_entry_type := coalesce(nullif(btrim(p_entry_type), ''), 'free')::entry_type;
  exception when invalid_text_representation then
    v_entry_type := 'free';
  end;

  v_is_free := v_entry_type in ('free', 'registration');

  -- ---- organiser ---------------------------------------------------------
  v_organiser_slug := slugify(p_organiser_name);

  select id, owner_id, verified into v_existing
  from organisers where slug = v_organiser_slug;

  if v_existing.id is null then
    insert into organisers (name, slug, city, contact_email, owner_id, verified)
    values (btrim(p_organiser_name), v_organiser_slug, btrim(p_city),
            nullif(btrim(coalesce(p_contact_email, '')), ''), v_uid, false)
    returning id into v_organiser_id;

  elsif v_existing.verified
        and (v_uid is null or v_existing.owner_id is distinct from v_uid) then
    -- Someone submitting as "Big Promoter" must not have their event appear
    -- under the real, verified Big Promoter's name. Give this submission its
    -- own unverified organiser and let review sort out the identity.
    --
    -- The `v_uid is null` arm matters on its own: an anonymous caller has a
    -- NULL uid, and a verified organiser can also have a NULL owner_id, so
    -- `owner_id is distinct from v_uid` is FALSE for anon-vs-unowned and
    -- would hand any anonymous submitter the verified organiser's identity.
    -- Anonymous callers therefore never reuse a verified organiser at all.
    insert into organisers (name, slug, city, contact_email, owner_id, verified)
    values (btrim(p_organiser_name),
            v_organiser_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
            btrim(p_city), nullif(btrim(coalesce(p_contact_email, '')), ''), v_uid, false)
    returning id into v_organiser_id;

  else
    v_organiser_id := v_existing.id;
  end if;

  -- ---- venue -------------------------------------------------------------
  -- Matched before inserting: the old code created a fresh row per
  -- submission, so one venue accumulated a duplicate for every event held
  -- there.
  if nullif(btrim(coalesce(p_venue_name, '')), '') is not null then
    select id into v_venue_id
    from venues
    where lower(name) = lower(btrim(p_venue_name)) and lower(coalesce(city, '')) = lower(btrim(p_city))
    limit 1;

    if v_venue_id is null then
      insert into venues (name, city) values (btrim(p_venue_name), btrim(p_city))
      returning id into v_venue_id;
    end if;
  end if;

  -- ---- slug --------------------------------------------------------------
  -- `slug` is unique across the table, so two "Diwali Night"s collide. Retry
  -- with a fresh suffix rather than failing the submission.
  for i in 1..5 loop
    v_slug := slugify(p_title) || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
    exit when not exists (select 1 from events where slug = v_slug);
    v_slug := null;
  end loop;
  if v_slug is null then
    raise exception 'Could not generate a unique link for this event, please try again'
      using errcode = 'unique_violation';
  end if;

  -- ---- the event ---------------------------------------------------------
  insert into events (
    organiser_id, venue_id, title, slug, description, highlights, terms,
    category, image_url, starts_at, is_free, entry_type,
    min_price_cents, max_price_cents, external_ticket_url, status
  ) values (
    v_organiser_id, v_venue_id, btrim(p_title), v_slug,
    nullif(btrim(coalesce(p_description, '')), ''),
    nullif(btrim(coalesce(p_highlights, '')), ''),
    nullif(btrim(coalesce(p_terms, '')), ''),
    v_category,
    nullif(btrim(coalesce(p_image_url, '')), ''),
    p_starts_at,
    v_is_free,
    v_entry_type,
    case when v_is_free then null else p_min_price_cents end,
    case when v_is_free then null else p_max_price_cents end,
    nullif(btrim(coalesce(p_booking_url, '')), ''),
    -- Hard-coded. The review queue is the only route to 'published'.
    'draft'
  )
  returning id into v_event_id;

  -- ---- provenance --------------------------------------------------------
  -- Now linked to the event it produced, and last rather than first: this is
  -- a record *about* a submission, so it must never be what prevents one.
  insert into event_sources (event_id, kind, url, raw_text, imported_by)
  values (v_event_id, 'manual', nullif(btrim(coalesce(p_booking_url, '')), ''),
          jsonb_pretty(jsonb_build_object(
            'title', p_title, 'city', p_city, 'organiser_name', p_organiser_name,
            'contact_email', p_contact_email, 'submitted_at', now()
          )), v_uid);

  return v_slug;
end;
$$;

-- The whole point: a logged-out visitor can call this, and nothing else.
revoke all on function public.submit_public_event(
  text, timestamptz, text, text, text, text, text, text, text, text, text, text, integer, integer, text
) from public;
grant execute on function public.submit_public_event(
  text, timestamptz, text, text, text, text, text, text, text, text, text, text, integer, integer, text
) to anon, authenticated;

comment on function public.submit_public_event is
  'Public /submit entry point. Creates a draft event for admin review. '
  'SECURITY DEFINER by necessity: anonymous submitters own no organiser and '
  'so cannot satisfy events_insert. Status is hard-coded to draft.';
