# Test Plan — ling-ai-app

## Core scenario (manual, v1 functional)

### Visitor reads a post and contacts the owner
1. Open site root (`/`) in incognito. **Expect:** published posts listed with cover image, title, excerpt.
2. Click a post title. **Expect:** full post body renders; published date shown; no login prompt.
3. Navigate to `/gallery`. **Expect:** image grid with alt text; no broken images.
4. Navigate to `/videos`. **Expect:** at least one embedded video visible.
5. Navigate to `/contact`. Fill name, email, message. Click Send. **Expect:** success message appears.
6. Open Supabase dashboard → contact_messages table. **Expect:** new row with correct values.
7. Open visitor_events table. **Expect:** rows for each page visited in steps 1–5.

### Owner publishes a post via admin
1. Open `/admin/posts/new`. Fill title, body, excerpt. Save as draft.
2. Open `/admin/posts`. **Expect:** new post listed with status = draft.
3. Click Publish. **Expect:** status changes to published in the list.
4. Open `/` in incognito. **Expect:** new post appears at the top of the feed.
5. Open `/admin/posts`, click Delete on the new post. **Expect:** post removed from public feed; row has deleted_at set (not hard-deleted).

## Empty states
- Delete all seeded posts. Open `/`. **Expect:** 'No posts yet' message — not a blank or broken page.
- Open `/gallery` with no images. **Expect:** 'No images yet' message.

## Error states
- Submit contact form with empty fields. **Expect:** inline validation errors on each empty field; no DB write.
- Submit contact form with invalid email. **Expect:** email field error; no DB write.
- Simulate API error (disconnect Supabase URL in env). **Expect:** error message on page — not a blank white screen.

## Loading states
- Throttle network to Slow 3G in DevTools. Open `/`. **Expect:** skeleton loaders visible before content appears.

## Security checks (after Sprint 5)
- Logged-out browser: POST to `/api/admin/posts`. **Expect:** 401 response.
- Logged-out browser: open `/admin/posts`. **Expect:** redirect to `/login`.
- Logged-out browser: GET `/posts/[slug]`. **Expect:** 200, full post visible.
- Check Vercel build output: no `OPENAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` visible in client JS bundle.
