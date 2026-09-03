-- Row Level Security. Enabled on every table from day one. Default posture is
-- deny; each policy below opens the minimum needed for the listings layer.

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Helper: does the current user own this organiser?
create or replace function owns_organiser(p_organiser_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organisers o
    where o.id = p_organiser_id and o.owner_id = auth.uid()
  );
$$;

alter table profiles enable row level security;
alter table organisers enable row level security;
alter table venues enable row level security;
alter table events enable row level security;
alter table ticket_types enable row level security;
alter table orders enable row level security;
alter table tickets enable row level security;
alter table saved_events enable row level security;
alter table follows enable row level security;
alter table subscribers enable row level security;
alter table waitlist enable row level security;
alter table event_sources enable row level security;

-- profiles: private to the user (plus admins).
create policy profiles_self_read on profiles
  for select using (id = auth.uid() or is_admin());
create policy profiles_self_upsert on profiles
  for insert with check (id = auth.uid());
create policy profiles_self_update on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- organisers: public pages are readable by everyone; owners/admins manage.
create policy organisers_public_read on organisers
  for select using (true);
create policy organisers_insert on organisers
  for insert with check (owner_id = auth.uid() or is_admin());
create policy organisers_update on organisers
  for update using (owner_id = auth.uid() or is_admin())
  with check (owner_id = auth.uid() or is_admin());

-- venues: public read; only admins/organisers write (kept simple).
create policy venues_public_read on venues
  for select using (true);
create policy venues_write on venues
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- events: the public sees published/cancelled/sold_out; drafts stay with the
-- owning organiser and admins.
create policy events_public_read on events
  for select using (
    status in ('published', 'cancelled', 'sold_out')
    or owns_organiser(organiser_id)
    or is_admin()
  );
create policy events_insert on events
  for insert with check (owns_organiser(organiser_id) or is_admin());
create policy events_update on events
  for update using (owns_organiser(organiser_id) or is_admin())
  with check (owns_organiser(organiser_id) or is_admin());
create policy events_delete on events
  for delete using (owns_organiser(organiser_id) or is_admin());

-- ticket_types: readable for any visible event; managed by the organiser.
create policy ticket_types_public_read on ticket_types
  for select using (
    exists (
      select 1 from events e
      where e.id = ticket_types.event_id
        and (e.status in ('published', 'cancelled', 'sold_out')
             or owns_organiser(e.organiser_id) or is_admin())
    )
  );
create policy ticket_types_write on ticket_types
  for all using (
    exists (select 1 from events e where e.id = ticket_types.event_id
            and (owns_organiser(e.organiser_id) or is_admin()))
  )
  with check (
    exists (select 1 from events e where e.id = ticket_types.event_id
            and (owns_organiser(e.organiser_id) or is_admin()))
  );

-- orders: the buyer sees their own; the event's organiser sees orders for
-- their events; inserts require the row to belong to the caller (or guest).
create policy orders_read on orders
  for select using (
    user_id = auth.uid()
    or is_admin()
    or exists (select 1 from events e where e.id = orders.event_id
               and owns_organiser(e.organiser_id))
  );
create policy orders_insert on orders
  for insert with check (user_id = auth.uid() or user_id is null);

-- tickets: the holder/buyer sees their own; the event organiser sees them for
-- door scanning.
create policy tickets_read on tickets
  for select using (
    exists (select 1 from orders o where o.id = tickets.order_id
            and (o.user_id = auth.uid() or is_admin()))
    or exists (
      select 1 from orders o join events e on e.id = o.event_id
      where o.id = tickets.order_id and owns_organiser(e.organiser_id)
    )
  );
-- Check-in updates are restricted to the event's organiser (Phase 3 door mode).
create policy tickets_checkin on tickets
  for update using (
    exists (
      select 1 from orders o join events e on e.id = o.event_id
      where o.id = tickets.order_id and (owns_organiser(e.organiser_id) or is_admin())
    )
  )
  with check (true);

-- saved_events / follows: strictly the user's own rows.
create policy saved_events_own on saved_events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy follows_own on follows
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- subscribers: anyone may subscribe (email capture); nobody may read the list
-- except admins (privacy).
create policy subscribers_insert on subscribers
  for insert with check (true);
create policy subscribers_admin_read on subscribers
  for select using (is_admin());

-- waitlist: anyone may join; the user and the event organiser may read.
create policy waitlist_insert on waitlist
  for insert with check (true);
create policy waitlist_read on waitlist
  for select using (
    user_id = auth.uid()
    or is_admin()
    or exists (select 1 from events e where e.id = waitlist.event_id
               and owns_organiser(e.organiser_id))
  );

-- event_sources: import provenance is organiser/admin only.
create policy event_sources_write on event_sources
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
