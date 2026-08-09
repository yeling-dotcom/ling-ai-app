create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  table_name text not null,
  row_id uuid,
  actor_user_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
drop policy if exists "audit_owner_read" on audit_logs;
create policy "audit_owner_read" on audit_logs for select to authenticated using (true);
drop policy if exists "audit_owner_insert" on audit_logs;
create policy "audit_owner_insert" on audit_logs for insert to authenticated with check (actor_user_id = auth.uid());

drop policy if exists "posts_v1_write" on posts;
drop policy if exists "posts_v1_read" on posts;
create policy "posts_public_read" on posts for select to anon using (status = 'published' and deleted_at is null);
create policy "posts_owner_read" on posts for select to authenticated using (true);
create policy "posts_owner_insert" on posts for insert to authenticated with check (user_id = auth.uid());
create policy "posts_owner_update" on posts for update to authenticated
  using (user_id = auth.uid() or user_id is null)
  with check (user_id = auth.uid());

drop policy if exists "images_v1_write" on images;
drop policy if exists "images_v1_read" on images;
create policy "images_public_read" on images for select using (deleted_at is null);
create policy "images_owner_insert" on images for insert to authenticated with check (user_id = auth.uid());
create policy "images_owner_update" on images for update to authenticated
  using (user_id = auth.uid() or user_id is null)
  with check (user_id = auth.uid());

drop policy if exists "videos_v1_write" on videos;
drop policy if exists "videos_v1_read" on videos;
create policy "videos_public_read" on videos for select using (deleted_at is null);
create policy "videos_owner_insert" on videos for insert to authenticated with check (user_id = auth.uid());
create policy "videos_owner_update" on videos for update to authenticated
  using (user_id = auth.uid() or user_id is null)
  with check (user_id = auth.uid());

drop policy if exists "contact_messages_v1_write" on contact_messages;
drop policy if exists "contact_messages_v1_read" on contact_messages;
create policy "contact_public_insert" on contact_messages for insert to anon, authenticated with check (true);
create policy "contact_owner_read" on contact_messages for select to authenticated using (true);
create policy "contact_owner_update" on contact_messages for update to authenticated using (true) with check (true);
create policy "contact_owner_delete" on contact_messages for delete to authenticated using (true);

drop policy if exists "visitor_events_v1_write" on visitor_events;
drop policy if exists "visitor_events_v1_read" on visitor_events;
create policy "visitor_public_insert" on visitor_events for insert to anon, authenticated with check (true);
create policy "visitor_owner_read" on visitor_events for select to authenticated using (true);

create or replace function public.post_view_count(requested_path text)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*) from visitor_events where page_path = requested_path;
$$;
revoke all on function public.post_view_count(text) from public;
grant execute on function public.post_view_count(text) to anon, authenticated;
