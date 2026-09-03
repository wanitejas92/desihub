-- Storage buckets for the image pipeline.
--  event-images   public  — event hero/card/thumb/gallery (WebP, EXIF stripped)
--  organiser-logos public  — organiser logos
--  user-avatars   private — RLS-protected, owner-only

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('event-images', 'event-images', true, 5242880,
   array['image/webp', 'image/jpeg', 'image/png']),
  ('organiser-logos', 'organiser-logos', true, 5242880,
   array['image/webp', 'image/jpeg', 'image/png']),
  ('user-avatars', 'user-avatars', false, 5242880,
   array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Public buckets: world-readable; authenticated users may write.
create policy event_images_read on storage.objects
  for select using (bucket_id = 'event-images');
create policy event_images_write on storage.objects
  for insert with check (bucket_id = 'event-images' and auth.uid() is not null);
create policy event_images_update on storage.objects
  for update using (bucket_id = 'event-images' and auth.uid() is not null);
create policy event_images_delete on storage.objects
  for delete using (bucket_id = 'event-images' and auth.uid() is not null);

create policy organiser_logos_read on storage.objects
  for select using (bucket_id = 'organiser-logos');
create policy organiser_logos_write on storage.objects
  for insert with check (bucket_id = 'organiser-logos' and auth.uid() is not null);

-- Private avatars: each user may only touch files under their own uid prefix
-- (path convention: `<uid>/<filename>`).
create policy user_avatars_read on storage.objects
  for select using (
    bucket_id = 'user-avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy user_avatars_write on storage.objects
  for insert with check (
    bucket_id = 'user-avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy user_avatars_update on storage.objects
  for update using (
    bucket_id = 'user-avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy user_avatars_delete on storage.objects
  for delete using (
    bucket_id = 'user-avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
