# Security — ling-ai-app

## Secret handling
- `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` live in Vercel environment variables only — never in client bundles, never in `.env` committed to git.
- All AI calls made from Next.js API routes (server-side), never from the browser.
- Only the anon Supabase key is exposed to the frontend.

## Permission model
- **v1 (demo):** permissive RLS — all tables allow public SELECT; all tables allow INSERT/UPDATE (needed for contact form and visitor logging).
- **Lock-down sprint:** owner writes scoped to `auth.uid() = user_id`. Public SELECT stays open. Contact form insert remains open (no auth required for visitors). Visitor event insert remains open.
- The owner is the only authenticated user. No visitor accounts.

## Approved tools rule
The AI agent may only call the four named tools in AGENTIC_LAYER.md. It cannot run arbitrary SQL, call external APIs not listed, or execute shell commands.

## Audit principle
Every meaningful write action (publish, delete, update status, send message) logs: who, what, when, before/after value. Logs are append-only; no row in the audit log is ever deleted via the app.

## Before real users or sensitive data
- Complete the Lock-down sprint (Sprint 5) before sharing the admin URL publicly.
- Review Supabase RLS policies manually — do not assume code is correct; test with a logged-out browser session.
- If in doubt about a security change: stop and consult a human.
