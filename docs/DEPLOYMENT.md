# Deployment and custom domain checklist

The application deploys from GitHub `main` through the linked Vercel project. Do not deploy local files with `vercel deploy`.

## Required environment variables

- `NEXT_PUBLIC_APP_URL` — canonical production URL, including `https://`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` — optional; publishing remains functional when absent
- `OPENAI_MODEL` — optional, defaults to `gpt-5-mini`

## Database and owner setup

1. Apply every file in `supabase/migrations` in filename order.
2. In Supabase Authentication, create the single owner email/password account.
3. Sign in at `/login`; the first edit of each seeded row assigns it to that owner.
4. Confirm an anonymous request to `/api/admin/posts` returns `401`.

## Custom domain

1. Add the domain in Vercel Project → Settings → Domains.
2. Add the DNS records Vercel displays at the DNS provider.
3. Wait for Vercel to show **Valid Configuration** and issue HTTPS.
4. Set `NEXT_PUBLIC_APP_URL` to the final `https://` URL for Production and redeploy from Git.
5. Add the final URL to Supabase Authentication → URL Configuration as the Site URL and allowed redirect URL.
6. Verify `/robots.txt`, `/sitemap.xml`, a post’s social preview, and every route in `docs/TEST_PLAN.md`.
