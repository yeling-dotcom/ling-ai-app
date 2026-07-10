# Tasks — ling-ai-app

## Sprint 1 — Database & public content feed
**Goal:** The site renders real content for anonymous visitors. No login required.

- [ ] Run migration SQL (posts, images, videos, contact_messages, visitor_events + RLS + seed data)
- [ ] Scaffold Next.js 14 project with Tailwind, connect Supabase client
- [ ] Homepage (`/`): fetch published posts, render title + excerpt + cover image + date
- [ ] Single post page (`/posts/[slug]`): fetch by slug, render full body
- [ ] Gallery page (`/gallery`): fetch images, render grid with alt text
- [ ] Videos page (`/videos`): fetch videos, render embed + title + description
- [ ] All pages: loading skeleton, empty state, error state
- [ ] Confirm all 3 seeded posts, 3 images, 2 videos render correctly

**Definition of Done:** Opening `/`, `/posts/welcome-to-my-site`, `/gallery`, and `/videos` in an incognito browser shows real content from the database — no blank screens, no errors in console.

---

## Sprint 2 — Contact form & visitor tracking ✅ v1 functional milestone
**Goal:** The full visitor workflow works end-to-end and every action writes to the DB.

- [ ] Contact page (`/contact`): form with name, email, message fields
- [ ] POST `/api/contact` → insert into contact_messages; return success/error JSON
- [ ] Form shows inline validation errors (empty fields, invalid email)
- [ ] Form shows success message after submit; shows error message if API fails
- [ ] Server-side visitor event logging on each public page load (path + referrer)
- [ ] Smoke test: submit contact form → verify row in Supabase dashboard

**Definition of Done:** Visitor opens site, reads a post, submits a contact message. The contact_messages table has the new row. visitor_events has page-view rows. Hard reload shows no data loss.

---

## Sprint 3 — Owner admin CRUD
**Goal:** Owner can manage all content without touching the database directly.

- [ ] `/admin/posts`: list all posts (draft + published), create button, edit link, delete (soft)
- [ ] `/admin/posts/new` and `/admin/posts/[id]/edit`: form with all post fields; save as draft or publish
- [ ] `/admin/images`: list images, upload form (Supabase Storage), delete (soft)
- [ ] `/admin/videos`: list videos, add form (URL + title + description), delete (soft)
- [ ] `/admin/messages`: list contact_messages, mark as read toggle
- [ ] Every button triggers a real DB write; UI updates without full page reload
- [ ] Empty states on each admin list

**Definition of Done:** Owner creates a post in /admin, publishes it, and it appears on the public homepage. Owner uploads an image and it appears in /gallery. Deleting a post removes it from the public feed.

---

## Sprint 4 — AI content layer
**Goal:** AI generates summaries and tags for posts; owner reviews before publishing.

- [ ] On post save, call `generate_post_summary` and `generate_post_tags` (server-side, async)
- [ ] Store ai_summary, ai_summary_source, ai_summary_confidence, ai_summary_review_status in posts row
- [ ] Store ai_tags, ai_tags_source, ai_tags_confidence, ai_tags_review_status in posts row
- [ ] Admin post editor shows AI fields with Accept / Edit / Reject controls
- [ ] Accepted ai_summary used as meta description on public post page
- [ ] Accepted ai_tags shown as chips on public post page
- [ ] If AI call fails: log error, leave ai fields null, site continues working
- [ ] Items with confidence < 0.7 flagged with warning badge in admin

**Definition of Done:** Save a post → AI fields populated in DB within 5 seconds → admin sees summary + tags with review controls → accepting them → public post shows tags. Killing the OpenAI key leaves the site fully functional.

---

## Sprint 5 — Lock it down (auth + RLS)
**Goal:** Only the authenticated owner can write content. Visitors still read freely.

- [ ] Enable Supabase Auth (email/password); owner creates one account
- [ ] Replace permissive write policies with `auth.uid() = user_id` on posts, images, videos
- [ ] Keep public SELECT policy on posts, images, videos
- [ ] Keep open INSERT on contact_messages (visitor form) and visitor_events (logging)
- [ ] Protect all `/admin/*` routes: middleware redirects unauthenticated requests to `/login`
- [ ] `/login` page with email/password form
- [ ] Assign existing rows' user_id to owner's UUID
- [ ] Test: logged-out browser cannot POST to /api/admin/* endpoints

**Definition of Done:** Incognito browser reads posts freely. Unauthenticated POST to /api/admin/posts returns 401. Owner logs in, creates a post — it appears publicly.

---

## Sprint 6 — Analytics & launch polish
**Goal:** Owner sees traffic data; site is production-ready on a custom domain.

- [ ] `/admin/analytics`: aggregate visitor_events by page and date; show top pages table
- [ ] Post page shows view count (count of visitor_events for that path)
- [ ] Dynamic `<title>` and `<meta description>` on every public page (AI summary if accepted)
- [ ] Open Graph tags for social sharing
- [ ] Next.js Image component for all images (optimisation + lazy load)
- [ ] Vercel custom domain configuration + DNS checklist doc
- [ ] Final smoke test: all public routes, admin routes, contact form, analytics

**Definition of Done:** Site live on custom domain. Lighthouse performance score ≥ 80. Analytics page shows page-view counts. Contact form works on production.

---

## Gantt (sprint → feature)
```
Sprint 1: DB schema · seed data · homepage · post page · gallery · videos
Sprint 2: Contact form · visitor logging · empty/error/loading states  ← v1 functional
Sprint 3: Admin CRUD for posts/images/videos/messages
Sprint 4: AI summary + tags · review UI · confidence filtering
Sprint 5: Auth · RLS lock-down · admin route protection
Sprint 6: Analytics · SEO · image optimisation · custom domain launch
```
