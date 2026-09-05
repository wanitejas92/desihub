-- Regression suite for public event submission.
--
-- Run with supabase/tests/run.sh, which builds a throwaway Postgres, applies
-- every migration in order and then runs this file. Each check raises on
-- failure, so the script's exit code is the result — there is nothing to
-- eyeball.
--
-- What is being pinned down is the bug that made `/submit` fail for every
-- logged-out visitor: `event_sources_write` and `events_insert` both require
-- `auth.uid() is not null`, so the four statements the old repository ran as
-- the caller could never succeed for the audience the form is built for.

\set ON_ERROR_STOP on
set client_min_messages = warning;

-- Two identities to submit as.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'admin@desihub.nl'),
  ('22222222-2222-2222-2222-222222222222', 'organiser@example.com')
on conflict do nothing;
insert into public.profiles (id, email, role) values
  ('11111111-1111-1111-1111-111111111111', 'admin@desihub.nl', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'organiser@example.com', 'attendee')
on conflict (id) do update set role = excluded.role;

set client_min_messages = notice;

do $$
declare
  v_slug  text;
  v_slug2 text;
  v_row   record;
  v_count integer;
  v_msg   text;
begin
  raise notice '--- 1. An anonymous visitor can submit ---------------------';
  perform set_config('request.jwt.claim.sub', '', true);

  v_slug := submit_public_event(
    p_title => 'Diwali Night Amsterdam',
    p_starts_at => now() + interval '30 days',
    p_city => 'Amsterdam',
    p_organiser_name => 'Desi Events NL',
    p_description => 'A big Diwali celebration.',
    p_highlights => 'Live music, food stalls',
    p_terms => 'No refunds.',
    p_category => 'diwali',
    p_venue_name => 'Ziggo Dome',
    p_contact_email => 'hi@example.com',
    p_entry_type => 'paid',
    p_min_price_cents => 1500,
    p_max_price_cents => 4500,
    p_booking_url => 'https://example.com/tickets'
  );
  perform assert(v_slug like 'diwali-night-amsterdam-%', 'returns a slug built from the title');

  select * into v_row from events where slug = v_slug;
  perform assert(v_row.id is not null,               'the event row exists');
  perform assert(v_row.status = 'draft',             'it is a draft, never published');
  perform assert(v_row.title = 'Diwali Night Amsterdam', 'the title is stored');
  perform assert(v_row.category = 'diwali',          'the category is stored');
  perform assert(v_row.highlights is not null,       'highlights are stored (0013 column)');
  perform assert(v_row.terms is not null,            'terms are stored (0013 column)');
  perform assert(v_row.venue_id is not null,         'the venue was created and linked');
  perform assert(v_row.is_free = false,              'a paid event is not marked free');
  perform assert(v_row.entry_type = 'paid',          'entry_type is stored');
  perform assert(v_row.min_price_cents = 1500 and v_row.max_price_cents = 4500,
                                                     'both ends of the price range are stored');

  select count(*) into v_count from event_sources where event_id = v_row.id;
  perform assert(v_count = 1, 'provenance is linked to the event it produced');

  raise notice '--- 2. Submitting is atomic ------------------------------';
  -- The old code wrote event_sources first and threw before the event, so a
  -- failure left provenance with no event. Nothing may be orphaned now.
  select count(*) into v_count from event_sources where event_id is null;
  perform assert(v_count = 0, 'no provenance row exists without an event');

  raise notice '--- 3. Free events do not carry prices --------------------';
  v_slug2 := submit_public_event(
    'Free Community Iftar', now() + interval '10 days', 'Rotterdam', 'Masjid Rotterdam',
    'Everyone welcome.', 'Food', 'Be respectful.', 'cultural', null, null, null,
    'free', 9999, 9999, null
  );
  select * into v_row from events where slug = v_slug2;
  perform assert(v_row.is_free = true,               'a free event is marked free');
  perform assert(v_row.min_price_cents is null and v_row.max_price_cents is null,
                                                     'prices are dropped for a free event');

  raise notice '--- 4. Bad input gets a readable message ------------------';
  begin
    perform submit_public_event('', now(), 'Amsterdam', 'X', 'd', 'h', 't');
    perform assert(false, 'an empty title should have been refused');
  exception when check_violation then
    get stacked diagnostics v_msg = message_text;
    perform assert(v_msg = 'Give your event a title', 'the message is written for the submitter');
  end;

  raise notice '--- 5. An unknown category does not lose the submission ---';
  -- 'community' is not a member of event_category; the old repository used it
  -- as its default and killed every uncategorised submission.
  v_slug2 := submit_public_event(
    'Uncategorised Thing', now() + interval '4 days', 'Utrecht', 'Someone',
    'd', 'h', 't', 'community'
  );
  select * into v_row from events where slug = v_slug2;
  perform assert(v_row.category = 'cultural', 'an unknown category falls back to cultural');

  raise notice '--- 6. Slugs stay unique ---------------------------------';
  v_slug2 := submit_public_event(
    'Diwali Night Amsterdam', now() + interval '31 days', 'Amsterdam', 'Desi Events NL',
    'Another one.', 'h', 't', 'diwali', 'Ziggo Dome'
  );
  perform assert(v_slug2 <> v_slug, 'a repeated title gets a different slug');

  select count(*) into v_count from venues where name = 'Ziggo Dome';
  perform assert(v_count = 1, 'the same venue is reused, not duplicated');

  select count(*) into v_count from organisers where slug = 'desi-events-nl';
  perform assert(v_count = 1, 'the same organiser is reused, not duplicated');
end $$;

-- The checks below need a role change, which cannot happen inside the DO
-- block above (set local role does not survive into a SECURITY DEFINER call
-- the way these assertions need).
do $$
declare v_count integer;
begin
  raise notice '--- 7. RLS is still closed -------------------------------';
  select count(*) into v_count from pg_policies
   where tablename = 'events' and policyname = 'events_insert';
  perform assert(v_count = 1, 'events_insert policy is still in place');

  select count(*) into v_count from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname in ('events','event_sources','organisers','venues')
     and c.relrowsecurity;
  perform assert(v_count = 4, 'RLS is still enabled on all four write targets');

  select count(*) into v_count from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'submit_public_event' and p.prosecdef;
  perform assert(v_count = 1, 'submit_public_event exists and is SECURITY DEFINER');
end $$;
