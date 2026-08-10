create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor', 'reviewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists organization_settings (
  organization_id uuid primary key references organizations(id) on delete cascade,
  theme text not null default 'editorial' check (theme in ('editorial', 'garden', 'minimal')),
  gallery_enabled boolean not null default true,
  videos_enabled boolean not null default true,
  contact_enabled boolean not null default true,
  analytics_enabled boolean not null default true,
  ai_review_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('editor', 'reviewer')),
  token uuid not null default gen_random_uuid() unique,
  invited_by uuid not null references auth.users(id) on delete restrict,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create unique index if not exists organization_invitations_pending_email
  on organization_invitations (organization_id, lower(email))
  where accepted_at is null;

create table if not exists subscriptions (
  id text primary key,
  organization_id uuid not null references organizations(id) on delete cascade,
  stripe_customer_id text not null,
  status text not null,
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists review_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  kind text not null check (kind in ('summary', 'tags')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  proposed_value jsonb not null,
  confidence numeric,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists review_tasks_one_pending_kind
  on review_tasks (post_id, kind) where status = 'pending';

alter table posts add column if not exists organization_id uuid references organizations(id);
alter table images add column if not exists organization_id uuid references organizations(id);
alter table videos add column if not exists organization_id uuid references organizations(id);
alter table contact_messages add column if not exists organization_id uuid references organizations(id);
alter table visitor_events add column if not exists organization_id uuid references organizations(id);
alter table audit_logs add column if not exists organization_id uuid references organizations(id);

do $$
declare
  first_user uuid;
  legacy_org uuid;
begin
  select id into first_user from auth.users order by created_at asc limit 1;
  if first_user is null then return; end if;

  select id into legacy_org from organizations where slug = 'ling';
  if legacy_org is null then
    insert into organizations (owner_user_id, name, slug, plan)
    values (first_user, 'Ling', 'ling', 'free')
    returning id into legacy_org;
  end if;

  insert into organization_members (organization_id, user_id, role)
  values (legacy_org, first_user, 'owner')
  on conflict (organization_id, user_id) do update set role = 'owner';

  insert into organization_settings (organization_id)
  values (legacy_org)
  on conflict (organization_id) do nothing;

  update posts set organization_id = legacy_org where organization_id is null;
  update images set organization_id = legacy_org where organization_id is null;
  update videos set organization_id = legacy_org where organization_id is null;
  update contact_messages set organization_id = legacy_org where organization_id is null;
  update visitor_events set organization_id = legacy_org where organization_id is null;
  update audit_logs set organization_id = legacy_org where organization_id is null;
end $$;

create or replace function public.is_org_member(requested_org uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from organization_members
    where organization_id = requested_org and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_owner(requested_org uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from organization_members
    where organization_id = requested_org and user_id = auth.uid() and role = 'owner'
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.is_org_owner(uuid) from public;
grant execute on function public.is_org_member(uuid) to anon, authenticated;
grant execute on function public.is_org_owner(uuid) to authenticated;

create or replace function public.accept_organization_invitation(invitation_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation organization_invitations%rowtype;
begin
  select * into invitation from organization_invitations
  where token = invitation_token and accepted_at is null and expires_at > now();
  if invitation.id is null then raise exception 'Invitation is invalid or expired'; end if;
  if lower(invitation.email) <> lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'Invitation email does not match the signed-in user';
  end if;
  insert into organization_members (organization_id, user_id, role)
  values (invitation.organization_id, auth.uid(), invitation.role)
  on conflict (organization_id, user_id) do update set role = excluded.role;
  update organization_invitations set accepted_at = now() where id = invitation.id;
  return invitation.organization_id;
end;
$$;

revoke all on function public.accept_organization_invitation(uuid) from public;
grant execute on function public.accept_organization_invitation(uuid) to authenticated;

create or replace function public.create_organization(organization_name text, organization_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if length(trim(organization_name)) < 2 or organization_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Invalid organization name or slug';
  end if;
  insert into organizations (owner_user_id, name, slug) values (auth.uid(), trim(organization_name), organization_slug) returning id into new_id;
  insert into organization_members (organization_id, user_id, role) values (new_id, auth.uid(), 'owner');
  insert into organization_settings (organization_id, gallery_enabled, videos_enabled, contact_enabled, analytics_enabled, ai_review_enabled)
  values (new_id, false, false, true, false, false);
  return new_id;
end;
$$;

revoke all on function public.create_organization(text, text) from public;
grant execute on function public.create_organization(text, text) to authenticated;

create or replace function public.public_organization_by_slug(requested_slug text)
returns table (id uuid, name text, slug text)
language sql
security definer
set search_path = public
stable
as $$
  select organizations.id, organizations.name, organizations.slug
  from organizations where organizations.slug = requested_slug limit 1;
$$;

revoke all on function public.public_organization_by_slug(text) from public;
grant execute on function public.public_organization_by_slug(text) to anon, authenticated;

alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table organization_settings enable row level security;
alter table organization_invitations enable row level security;
alter table subscriptions enable row level security;
alter table review_tasks enable row level security;

create policy "organizations_member_read" on organizations for select to authenticated using (public.is_org_member(id));
create policy "organizations_owner_update" on organizations for update to authenticated
  using (public.is_org_owner(id)) with check (public.is_org_owner(id));

create policy "members_member_read" on organization_members for select to authenticated
  using (public.is_org_member(organization_id));
create policy "members_owner_insert" on organization_members for insert to authenticated
  with check (public.is_org_owner(organization_id));
create policy "members_owner_update" on organization_members for update to authenticated
  using (public.is_org_owner(organization_id)) with check (public.is_org_owner(organization_id));
create policy "members_owner_delete" on organization_members for delete to authenticated
  using (public.is_org_owner(organization_id) and user_id <> auth.uid());

create policy "settings_public_read" on organization_settings for select using (true);
create policy "settings_owner_insert" on organization_settings for insert to authenticated
  with check (public.is_org_owner(organization_id));
create policy "settings_owner_update" on organization_settings for update to authenticated
  using (public.is_org_owner(organization_id)) with check (public.is_org_owner(organization_id));

create policy "invitations_owner_all" on organization_invitations for all to authenticated
  using (public.is_org_owner(organization_id)) with check (public.is_org_owner(organization_id));
create policy "invitations_recipient_read" on organization_invitations for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy "invitations_recipient_update" on organization_invitations for update to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy "subscriptions_member_read" on subscriptions for select to authenticated
  using (public.is_org_member(organization_id));

create policy "review_tasks_member_read" on review_tasks for select to authenticated
  using (public.is_org_member(organization_id));
create policy "review_tasks_member_insert" on review_tasks for insert to authenticated
  with check (public.is_org_member(organization_id));
create policy "review_tasks_member_update" on review_tasks for update to authenticated
  using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

drop policy if exists "posts_owner_read" on posts;
drop policy if exists "posts_owner_insert" on posts;
drop policy if exists "posts_owner_update" on posts;
create policy "posts_member_read" on posts for select to authenticated
  using (public.is_org_member(organization_id));
create policy "posts_member_insert" on posts for insert to authenticated
  with check (public.is_org_member(organization_id) and user_id = auth.uid());
create policy "posts_member_update" on posts for update to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists "images_owner_insert" on images;
drop policy if exists "images_owner_update" on images;
create policy "images_member_insert" on images for insert to authenticated
  with check (public.is_org_member(organization_id) and user_id = auth.uid());
create policy "images_member_update" on images for update to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists "videos_owner_insert" on videos;
drop policy if exists "videos_owner_update" on videos;
create policy "videos_member_insert" on videos for insert to authenticated
  with check (public.is_org_member(organization_id) and user_id = auth.uid());
create policy "videos_member_update" on videos for update to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

drop policy if exists "contact_owner_read" on contact_messages;
drop policy if exists "contact_owner_update" on contact_messages;
drop policy if exists "contact_owner_delete" on contact_messages;
create policy "contact_member_read" on contact_messages for select to authenticated
  using (public.is_org_member(organization_id));
create policy "contact_member_update" on contact_messages for update to authenticated
  using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "contact_member_delete" on contact_messages for delete to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists "visitor_owner_read" on visitor_events;
create policy "visitor_member_read" on visitor_events for select to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists "audit_owner_read" on audit_logs;
drop policy if exists "audit_owner_insert" on audit_logs;
create policy "audit_member_read" on audit_logs for select to authenticated
  using (public.is_org_member(organization_id));
create policy "audit_member_insert" on audit_logs for insert to authenticated
  with check (public.is_org_member(organization_id) and actor_user_id = auth.uid());
