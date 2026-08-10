drop policy if exists "owner_upload_images" on storage.objects;
create policy "owner_upload_images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'images'
  and owner_id = auth.uid()::text
);

drop policy if exists "owner_update_images" on storage.objects;
create policy "owner_update_images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'images'
  and owner_id = auth.uid()::text
)
with check (
  bucket_id = 'images'
  and owner_id = auth.uid()::text
);

drop policy if exists "owner_delete_images" on storage.objects;
create policy "owner_delete_images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'images'
  and owner_id = auth.uid()::text
);
