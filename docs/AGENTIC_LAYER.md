# Agentic Layer — ling-ai-app

## Risk levels & actions

### Low risk — auto-execute, log only
- Generate post summary (≤120 chars) from body text
- Generate up to 5 tags from post body
- Log visitor page-view event

### Medium risk — owner sees draft, one-click approve
- Suggest a slug from the post title
- Suggest a cover image alt-text from image filename + caption

### High risk — always requires owner approval before execution
- Send a reply email to a contact message
- Publish a post (status draft → published)

### Critical / human-only — no agent execution
- Permanently delete any content
- Modify RLS policies or security settings

## Named tools (approved list)
| Tool | Description |
|---|---|
| `generate_post_summary` | Calls OpenAI, returns summary string + confidence |
| `generate_post_tags` | Calls OpenAI, returns string[] + confidence |
| `suggest_slug` | Derives slug from title, no external call |
| `log_visitor_event` | Inserts row into visitor_events |

No `run_any`, `exec_sql`, or `send_any` tools are ever exposed.

## Audit log fields (on every meaningful action)
`action` · `table_name` · `row_id` · `actor_user_id` · `old_value` · `new_value` · `created_at`

## v1 vs later
- **v1:** auto-generate summary + tags on post save; log visitor events.
- **Later:** agent drafts reply to contact messages (high risk, owner approves before send); scheduled-publish queue.
