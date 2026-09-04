-- Auto-promote users to organiser when their first event is published.
--
-- When an event transitions to 'published' status, if the organiser's owner
-- is still an 'attendee', promote them to 'organiser' role. This happens once
-- per organiser — later events don't re-promote.

create or replace function promote_organiser_on_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and old.status != 'published' then
    -- Event just became published. Promote the organiser's owner to organiser role.
    update profiles
    set role = 'organiser'
    where id = (
      select owner_id from organisers
      where id = new.organiser_id
    )
    and role = 'attendee';
  end if;
  return new;
end;
$$;

drop trigger if exists events_promote_organiser on events;
create trigger events_promote_organiser
  after update on events
  for each row execute function promote_organiser_on_publish();

-- Also handle the case where an event is inserted already published.
create or replace function promote_organiser_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' then
    update profiles
    set role = 'organiser'
    where id = (
      select owner_id from organisers
      where id = new.organiser_id
    )
    and role = 'attendee';
  end if;
  return new;
end;
$$;

drop trigger if exists events_promote_organiser_insert on events;
create trigger events_promote_organiser_insert
  after insert on events
  for each row execute function promote_organiser_on_insert();
