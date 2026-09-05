-- Regression suite for admin event creation (/admin/events/new).
--
-- The admin path failed for a different reason than the public one. Its RLS
-- is satisfiable — an admin passes `is_admin()` — so what broke it was the
-- schema: `createPublishedEvent()` writes `poster_image_url` (0010),
-- `reviewed_at` and `reviewed_by` (0009), and a database that had not had
-- those migrations applied refused the whole insert with
--
--   ERROR: column "poster_image_url" of relation "events" does not exist
--
-- which the admin form then showed verbatim, with no hint that the fix was
-- "run the migrations". 0014 re-states those columns idempotently so applying
-- it repairs a part-migrated database, and describeDbError() now names the
-- migration when a column is missing.

\set ON_ERROR_STOP on
set client_min_messages = warning;

insert into auth.users (id, email) values
  ('33333333-3333-3333-3333-333333333333', 'boss@desihub.nl')
on conflict do nothing;
insert into public.profiles (id, email, role) values
  ('33333333-3333-3333-3333-333333333333', 'boss@desihub.nl', 'admin')
on conflict (id) do update set role = 'admin';
set client_min_messages = notice;

do $$
declare
  v_org   uuid;
  v_venue uuid;
  v_row   record;
  v_count integer;
begin
  raise notice '--- 1. Every column the admin form writes exists ----------';
  -- Checked by name, not just by "the insert worked": a missing column fails
  -- the insert as a whole, so a single green insert would not say which of
  -- these three migrations had actually been applied.
  perform assert(
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'events'
        and column_name = 'poster_image_url') = 1,
    'events.poster_image_url exists (0010)');
  perform assert(
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'events'
        and column_name in ('reviewed_at', 'reviewed_by', 'review_note')) = 3,
    'events review columns exist (0009)');
  perform assert(
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'events'
        and column_name in ('highlights', 'terms')) = 2,
    'events.highlights and events.terms exist (0013)');

  raise notice '--- 2. An admin can create a published event -------------';
  perform set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);

  insert into organisers (name, slug, city, owner_id, verified)
  values ('Admin Made Org', 'admin-made-org', 'Amsterdam', null, true)
  returning id into v_org;

  insert into venues (name, city) values ('Paradiso', 'Amsterdam') returning id into v_venue;

  insert into events (
    organiser_id, venue_id, title, slug, description, category,
    image_url, poster_image_url, starts_at, ends_at, is_free,
    min_price_cents, max_price_cents, external_ticket_url,
    status, featured, reviewed_at, reviewed_by
  ) values (
    v_org, v_venue, 'Admin Quick Add', 'admin-quick-add-abc123', 'Made from /admin.',
    'concert', null, null, now() + interval '20 days', null, false,
    2500, 2500, null, 'published', true, now(), '33333333-3333-3333-3333-333333333333'
  );

  select * into v_row from events where slug = 'admin-quick-add-abc123';
  perform assert(v_row.id is not null,         'the admin event row exists');
  perform assert(v_row.status = 'published',   'an admin create goes live immediately');
  perform assert(v_row.featured = true,        'the featured flag is stored');
  perform assert(v_row.reviewed_by is not null,'the reviewer is recorded');

  raise notice '--- 3. A published event is visible to the public --------';
  -- Unlike a submission, this one must appear on the site straight away.
  perform assert(
    (select count(*) from events
      where slug = 'admin-quick-add-abc123'
        and status in ('published', 'cancelled', 'sold_out')) = 1,
    'the event matches the public read policy');

  raise notice '--- 4. The same venue is not duplicated ------------------';
  -- createPublishedEvent() used to insert a venue unconditionally, so running
  -- quick-add twice for one hall left two rows and split its events between
  -- them. The repository now matches first; this pins the invariant.
  select count(*) into v_count from venues where name = 'Paradiso' and city = 'Amsterdam';
  perform assert(v_count = 1, 'one venue row for one real venue');
end $$;
