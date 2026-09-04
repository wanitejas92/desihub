-- Promo banners: the rotating artwork strip at the top of the homepage.
--
-- Files live in a public storage bucket; this table carries the metadata a
-- bare file listing can't: where the banner links to, what order it sits in,
-- and the window it should appear for. The window matters — without it,
-- last month's event poster stays on the homepage until someone remembers
-- to remove it.

create table banners (
  id uuid primary key default gen_random_uuid(),
  -- Public storage URL (or any absolute URL) of the artwork.
  image_url text not null,
  -- Where clicking goes. Null renders the banner as a non-interactive slide.
  link_url text,
  -- Also the alt text, so it is required: a banner with no text alternative
  -- is invisible to screen readers and to search.
  title text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  -- Null start = live immediately; null end = lives until deactivated.
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  constraint banner_window check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create index banners_running_idx on banners (active, sort_order);

alter table banners enable row level security;

-- Anyone may read a banner that is switched on and inside its window; the
-- date filtering lives in the policy so an expired banner cannot leak even
-- if a query forgets to filter.
create policy banners_public_read on banners
  for select using (
    (active
     and (starts_at is null or starts_at <= now())
     and (ends_at is null or ends_at >= now()))
    or is_admin()
  );

create policy banners_admin_write on banners
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket for the artwork
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

create policy banner_files_public_read on storage.objects
  for select using (bucket_id = 'banners');

create policy banner_files_admin_write on storage.objects
  for all using (bucket_id = 'banners' and is_admin())
  with check (bucket_id = 'banners' and is_admin());
