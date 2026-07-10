create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  body text,
  excerpt text,
  cover_image_url text,
  status text not null default 'draft',
  published_at timestamptz,
  deleted_at timestamptz,
  ai_summary text,
  ai_summary_source text,
  ai_summary_confidence numeric,
  ai_summary_review_status text default 'unreviewed',
  ai_tags text[],
  ai_tags_source text,
  ai_tags_confidence numeric,
  ai_tags_review_status text default 'unreviewed'
);

alter table posts enable row level security;
drop policy if exists "posts_v1_read" on posts;
create policy "posts_v1_read" on posts for select using (true);
drop policy if exists "posts_v1_write" on posts;
create policy "posts_v1_write" on posts for all using (true) with check (true);

create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  url text not null,
  alt_text text,
  caption text,
  deleted_at timestamptz
);

alter table images enable row level security;
drop policy if exists "images_v1_read" on images;
create policy "images_v1_read" on images for select using (true);
drop policy if exists "images_v1_write" on images;
create policy "images_v1_write" on images for all using (true) with check (true);

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  title text not null,
  embed_url text not null,
  description text,
  thumbnail_url text,
  deleted_at timestamptz
);

alter table videos enable row level security;
drop policy if exists "videos_v1_read" on videos;
create policy "videos_v1_read" on videos for select using (true);
drop policy if exists "videos_v1_write" on videos;
create policy "videos_v1_write" on videos for all using (true) with check (true);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  sender_name text not null,
  sender_email text not null,
  message text not null,
  is_read boolean not null default false
);

alter table contact_messages enable row level security;
drop policy if exists "contact_messages_v1_read" on contact_messages;
create policy "contact_messages_v1_read" on contact_messages for select using (true);
drop policy if exists "contact_messages_v1_write" on contact_messages;
create policy "contact_messages_v1_write" on contact_messages for all using (true) with check (true);

create table if not exists visitor_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  page_path text not null,
  referrer text,
  user_agent text,
  session_id text
);

alter table visitor_events enable row level security;
drop policy if exists "visitor_events_v1_read" on visitor_events;
create policy "visitor_events_v1_read" on visitor_events for select using (true);
drop policy if exists "visitor_events_v1_write" on visitor_events;
create policy "visitor_events_v1_write" on visitor_events for all using (true) with check (true);

insert into posts (title, slug, body, excerpt, cover_image_url, status, published_at) values
(
  'Welcome to My Site',
  'welcome-to-my-site',
  'This is my first post. I built this site to share my writing, images, and ideas with the world. Expect more soon.',
  'I built this site to share my writing, images, and ideas with the world.',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
  'published',
  now() - interval '3 days'
),
(
  'Exploring AI in Everyday Life',
  'exploring-ai-in-everyday-life',
  'Artificial intelligence is quietly reshaping how we work, create, and communicate. Here are my observations from the past six months.',
  'My observations on how AI is reshaping work and creativity.',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
  'published',
  now() - interval '1 day'
),
(
  'Draft: Thoughts on Deep Work',
  'thoughts-on-deep-work',
  'Cal Newport''s concept of deep work changed how I structure my mornings. Still drafting this one.',
  'How deep work principles changed my morning routine.',
  null,
  'draft',
  null
);

insert into images (url, alt_text, caption) values
(
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
  'Mountain landscape at sunrise',
  'Sunrise over the Rockies, July 2024'
),
(
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800',
  'Field of wildflowers',
  'Wildflower season in full bloom'
),
(
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
  'Starry night sky over mountains',
  'Milky Way from a dark-sky site'
);

insert into videos (title, embed_url, description, thumbnail_url) values
(
  'My Workspace Tour 2024',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'A quick walkthrough of my home office setup — monitors, lighting, and the gear I use daily.',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800'
),
(
  'How I Use AI to Write Faster',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'Practical techniques I use to draft, edit, and publish content with AI assistance.',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800'
);