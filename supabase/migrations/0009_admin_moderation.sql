-- Admin moderation: the review queue behind the draft → published transition.
--
-- Publishing is an admin capability, never an organiser one. An organiser
-- creates drafts; an admin decides what goes live. That is the anti-spam
-- boundary, and 0003_rls.sql already enforces it (`events_update` requires
-- `owns_organiser() or is_admin()`, and only an admin can flip an event they
-- do not own). What is added here is the vocabulary a review needs: a way to
-- say no, and a note explaining why.

-- 'rejected' joins the status enum. Postgres allows ADD VALUE inside a
-- transaction (PG 12+) as long as the new value is not *used* in the same
-- transaction — nothing below references it, so this file is safe to run as
-- one script in the SQL editor.
alter type event_status add value if not exists 'rejected';

-- Review metadata. `review_note` is what the organiser is shown when their
-- submission is turned down, so it is written for them, not for us.
alter table events add column if not exists review_note text;
alter table events add column if not exists reviewed_at timestamptz;
alter table events add column if not exists reviewed_by uuid references auth.users (id) on delete set null;

-- Drafts are queued oldest-first; this keeps that scan off a seq scan once
-- the catalogue grows.
create index if not exists events_status_created_idx on events (status, created_at);

-- Admins manage roles. `profiles_self_update` in 0003 is deliberately narrow
-- (`id = auth.uid()`), which also locked admins out of every profile but their
-- own — so promoting or demoting a user was impossible through RLS. This adds
-- the missing capability without widening what a normal user can touch.
drop policy if exists profiles_admin_update on profiles;
create policy profiles_admin_update on profiles
  for update using (is_admin()) with check (is_admin());

-- The public read policy in 0003 lists visible statuses explicitly
-- (`published`, `cancelled`, `sold_out`), so `rejected` — like `draft` —
-- stays visible only to the owning organiser and to admins. No policy change
-- is needed for that; this comment records why none appears here.

-- ---------------------------------------------------------------------------
-- Bootstrapping the first admin
--
-- Every profile starts as 'attendee', and only an admin can promote anyone —
-- so out of the box there is nobody who can reach /admin. Break the cycle
-- once, by hand, with your own address. Run this separately after signing in
-- at least once (the profile row is created on first sign-in):
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- After that, promote everyone else from /admin/users.
-- ---------------------------------------------------------------------------
