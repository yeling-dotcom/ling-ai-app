# Architecture — ling-ai-app

## Stack
- **Frontend:** Next.js 14 (App Router) on Vercel
- **Database + Storage:** Supabase (Postgres + Storage bucket for images)
- **AI:** OpenAI API (summaries + tags) — called server-side only
- **Styling:** Tailwind CSS

## What to build now vs later

**Now:** public post feed, single post page, gallery, videos, contact form, basic admin CRUD, seed data visible without login.

**Later:** owner auth + RLS lock-down, AI summary/tag pipeline, visitor analytics dashboard, rich-text editor, newsletter, custom domain checklist.

## Key user action — flow: visitor reads a post
1. Browser hits `/posts/[slug]` — Next.js server component queries `posts` table (status = published, deleted_at is null).
2. Post row returned → rendered as HTML with cover image, body, published date.
3. Server logs a row to `visitor_events` (path, referrer, session id).
4. No login required at any step.

## Key owner action — flow: publish a post
1. Owner opens `/admin/posts/new`, fills title/body/cover image.
2. Form POSTs to a Next.js API route → inserts row into `posts` (status = draft).
3. Owner clicks Publish → API route sets `status = published`, `published_at = now()`.
4. Homepage re-fetches; new post appears.

## Layer plan
1. **Data first** — tables + RLS policies + seed rows.
2. **App logic** — CRUD API routes + public pages + admin screens.
3. **Smart features** — AI summary/tag on post save (Sprint 4, after core works).

## AI-off guarantee
All pages render from Postgres. AI fields are optional display enhancements. Removing the AI call leaves the site fully functional.
