# PRD — ling-ai-app

## Problem
The owner has no central place to publish articles, images, and AI-generated content. Visitors have nowhere to read it.

## Target user
- **Owner:** publishes and manages all content.
- **Visitor:** reads posts, browses media, sends a contact message — no account needed.

## Core objects
| Object | Purpose |
|---|---|
| Post | Article with title, slug, body, cover image, draft/published status |
| Image | Uploaded photo with alt text and caption |
| Video | Embedded video URL with title and description |
| Contact message | Inbound name + email + message from a visitor |
| Visitor event | Page-view log entry (path, referrer, session) |

## MVP must-haves (v1)
- [ ] Public homepage lists all published posts with cover image and excerpt
- [ ] Single post page renders full body content
- [ ] Gallery page displays uploaded images
- [ ] Videos page displays embedded videos
- [ ] Contact form submits and persists to the database
- [ ] Admin can create, edit, publish, and delete posts/images/videos
- [ ] Site is deployable to a custom domain via Vercel

## Non-goals (v1)
User accounts for visitors · online payments · store · forum · mobile app · multilingual · comments · scheduled publishing

## Definition of Done
**Pass:** A visitor opens the live URL, reads a published post, views the gallery, and submits a contact message — all without logging in. The owner logs in to /admin, publishes a new post, and it appears on the homepage within one page refresh. Every interaction writes to the database and survives a hard reload.
