-- Functions and triggers: profile bootstrap, sold-count integrity, and a
-- helper for reserving inventory atomically (used by Phase 3 checkout).

-- Create a profile row automatically when a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Atomically reserve inventory for a ticket type. Returns true on success,
-- false when there is not enough left. The no_oversell CHECK is the final
-- backstop; this function makes the failure graceful instead of a constraint
-- violation. Used by the checkout path in Phase 3.
create or replace function reserve_tickets(p_ticket_type_id uuid, p_qty integer)
returns boolean
language plpgsql
as $$
declare
  updated integer;
begin
  if p_qty <= 0 then
    raise exception 'quantity must be positive';
  end if;

  update ticket_types
    set sold = sold + p_qty
  where id = p_ticket_type_id
    and sold + p_qty <= quantity
  returning 1 into updated;

  return updated is not null;
end;
$$;

-- Release previously reserved inventory (e.g. on a failed/expired order).
create or replace function release_tickets(p_ticket_type_id uuid, p_qty integer)
returns void
language plpgsql
as $$
begin
  update ticket_types
    set sold = greatest(0, sold - p_qty)
  where id = p_ticket_type_id;
end;
$$;

-- Flip an event to sold_out when every ticket type is exhausted, and back to
-- published when inventory frees up. Keeps the badge honest without a cron.
create or replace function refresh_event_sold_out()
returns trigger
language plpgsql
as $$
declare
  v_event_id uuid := coalesce(new.event_id, old.event_id);
  v_remaining integer;
begin
  select coalesce(sum(quantity - sold), 0) into v_remaining
  from ticket_types
  where event_id = v_event_id;

  if v_remaining <= 0 then
    update events set status = 'sold_out'
    where id = v_event_id and status = 'published';
  else
    update events set status = 'published'
    where id = v_event_id and status = 'sold_out';
  end if;

  return null;
end;
$$;

create trigger ticket_types_sold_out
  after insert or update of sold, quantity on ticket_types
  for each row execute function refresh_event_sold_out();
