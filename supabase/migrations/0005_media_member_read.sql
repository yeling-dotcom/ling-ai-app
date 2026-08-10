drop policy if exists "images_member_read" on images;
create policy "images_member_read" on images for select to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists "videos_member_read" on videos;
create policy "videos_member_read" on videos for select to authenticated
  using (public.is_org_member(organization_id));
