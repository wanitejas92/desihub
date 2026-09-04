-- ---------------------------------------------------------------------------
-- Booking configuration
--
-- Booking is modelled as its own table rather than columns on `events`, for
-- one reason: the channel changes independently of the event. An organiser who
-- sells on their own site this season and through DesiHub the next should be a
-- one-row UPDATE here, with no schema change, no event rewrite, and no change
-- to the event detail page — which reads a resolved booking option, never
-- these columns.
--
-- `events.external_ticket_url` is superseded by `booking_configurations`; it is
-- kept (and backfilled from) so nothing that still reads it breaks.
-- ---------------------------------------------------------------------------

-- How you get in: about admission and money, not about which site handles it.
do $$ begin
  create type entry_type as enum ('free', 'registration', 'paid', 'door');
exception when duplicate_object then null; end $$;

-- Where booking happens. 'desihub' and 'external_api' exist in the enum but
-- are not enabled in the application yet (see enabledBookingTypes()); having
-- them here means switching one on is config, not a migration.
do $$ begin
  create type booking_type as enum (
    'none', 'free_registration', 'external_url', 'desihub', 'external_api'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('available', 'sold_out', 'closed', 'not_open_yet');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- events: entry economics + the presentational fields the detail page needs
-- ---------------------------------------------------------------------------
alter table events
  add column if not exists entry_type entry_type not null default 'paid',
  add column if not exists dress_code text,
  -- The performers, as an embedded list. DesiHub has no artist entity yet and
  -- a table we cannot populate would give every event page dead links; when
  -- artist profiles arrive, only what fills this array changes.
  add column if not exists lineup jsonb not null default '[]'::jsonb;

alter table events
  add constraint events_lineup_is_array check (jsonb_typeof(lineup) = 'array')
  not valid;

-- Backfill from the flag that already exists.
update events set entry_type = 'free' where is_free and entry_type = 'paid';

-- ---------------------------------------------------------------------------
-- booking_configurations: one row per event
-- ---------------------------------------------------------------------------
create table if not exists booking_configurations (
  event_id uuid primary key references events(id) on delete cascade,
  booking_type booking_type not null default 'none',
  -- Human-readable destination ("Eventbrite", the organiser's name). Shown in
  -- the leaving-DesiHub confirmation, so it is never optional in the UI copy.
  provider text,
  booking_url text,
  -- The partner's own id for this event, once API providers exist.
  external_event_id text,
  status booking_status not null default 'available',
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),

  -- A channel that sends people somewhere must say where. Enforced here so a
  -- half-configured row can never render as a dead "Book now".
  constraint booking_url_required_for_redirects check (
    booking_type not in ('external_url', 'free_registration') or booking_url is not null
  )
);

create index if not exists booking_configurations_type_idx
  on booking_configurations (booking_type);

-- Carry across whatever the old column holds, so no event loses its link.
insert into booking_configurations (event_id, booking_type, provider, booking_url)
select e.id, 'external_url'::booking_type, o.name, e.external_ticket_url
from events e
join organisers o on o.id = e.organiser_id
where e.external_ticket_url is not null
on conflict (event_id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS: readable wherever the event is, writable by the organiser
-- ---------------------------------------------------------------------------
alter table booking_configurations enable row level security;

create policy booking_configurations_public_read on booking_configurations
  for select using (
    exists (
      select 1 from events e
      where e.id = booking_configurations.event_id
        and (e.status in ('published', 'cancelled', 'sold_out')
             or owns_organiser(e.organiser_id) or is_admin())
    )
  );

create policy booking_configurations_write on booking_configurations
  for all using (
    exists (select 1 from events e where e.id = booking_configurations.event_id
            and (owns_organiser(e.organiser_id) or is_admin()))
  )
  with check (
    exists (select 1 from events e where e.id = booking_configurations.event_id
            and (owns_organiser(e.organiser_id) or is_admin()))
  );

-- ---------------------------------------------------------------------------
-- Keep entry_type and is_free from ever disagreeing
--
-- `is_free` is the denormalised flag every filter, card and query already
-- reads; `entry_type` is the richer truth. A column default cannot know about
-- the other column, so a free event inserted by any writer that predates this
-- migration (the seed, the admin importer, a manual INSERT) would land as
-- `paid` while `is_free` said otherwise — and the booking service would offer
-- a ticket CTA for a free event.
--
-- So derive rather than default: a writer that knows only the old flag gets a
-- correct entry_type, and `is_free` always follows entry_type afterwards.
-- ---------------------------------------------------------------------------
create or replace function sync_event_entry_type()
returns trigger language plpgsql as $$
begin
  -- Insert-only: a free row that never set entry_type is sitting on the
  -- default, not on an intentional 'paid'.
  if tg_op = 'INSERT' and new.entry_type = 'paid' and new.is_free then
    new.entry_type := 'free';
  end if;

  -- entry_type is authoritative from here on, for inserts and updates alike.
  new.is_free := new.entry_type in ('free', 'registration');
  return new;
end $$;

drop trigger if exists events_sync_entry_type on events;
create trigger events_sync_entry_type
  before insert or update of entry_type, is_free on events
  for each row execute function sync_event_entry_type();

-- Re-run the backfill through the same rule so existing rows agree too.
update events set entry_type = 'free' where is_free and entry_type = 'paid';
update events set is_free = (entry_type in ('free', 'registration'));
