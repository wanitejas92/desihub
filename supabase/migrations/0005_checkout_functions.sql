-- reserve_tickets/release_tickets (0002_functions_triggers.sql) run as the
-- calling role by default, so under RLS a regular buyer's UPDATE against
-- ticket_types is filtered out by ticket_types_write (organiser/admin only)
-- and the function returns false for every buyer who isn't the organiser —
-- Phase 3 checkout could never actually sell a ticket. Making both
-- functions SECURITY DEFINER (the same fix already applied to
-- handle_new_user, is_admin and owns_organiser) lets them do the one thing
-- they're already scoped to: the quantity/capacity check inside the
-- function body is the real guard, not row ownership — anyone should be
-- able to buy a ticket, not just the organiser.

create or replace function reserve_tickets(p_ticket_type_id uuid, p_qty integer)
returns boolean
language plpgsql
security definer
set search_path = public
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

create or replace function release_tickets(p_ticket_type_id uuid, p_qty integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update ticket_types
    set sold = greatest(0, sold - p_qty)
  where id = p_ticket_type_id;
end;
$$;
