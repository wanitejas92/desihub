-- Popular Cities cover photos.
--
-- Cities themselves and their event counts are computed live from real
-- event data — nothing to manage there. Only the cover *photo* per city
-- needs somewhere to live, since there is no way to derive a photograph
-- from event rows. One row per city, upserted from the admin UI; a city
-- with no row here renders the designed gradient tile instead.

create table city_images (
  city text primary key,
  image_url text not null,
  updated_at timestamptz not null default now()
);

alter table city_images enable row level security;

create policy city_images_public_read on city_images
  for select using (true);

create policy city_images_admin_write on city_images
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket for the cover photos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('city-images', 'city-images', true)
on conflict (id) do nothing;

create policy city_image_files_public_read on storage.objects
  for select using (bucket_id = 'city-images');

create policy city_image_files_admin_write on storage.objects
  for all using (bucket_id = 'city-images' and is_admin())
  with check (bucket_id = 'city-images' and is_admin());
