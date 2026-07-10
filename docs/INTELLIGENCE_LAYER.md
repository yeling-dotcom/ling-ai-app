# Intelligence Layer — ling-ai-app

## What raw input looks like
Owner writes a post body — unstructured prose, variable length, no tags, no summary.

## What the system produces automatically
```json
{
  "ai_summary": "A reflection on how AI tools speed up writing and content workflows.",
  "ai_summary_source": "openai/gpt-4o",
  "ai_summary_confidence": 0.91,
  "ai_summary_review_status": "unreviewed",
  "ai_tags": ["AI", "writing", "productivity"],
  "ai_tags_source": "openai/gpt-4o",
  "ai_tags_confidence": 0.87,
  "ai_tags_review_status": "unreviewed"
}
```

## Events tracked
- Post saved → trigger AI pipeline (server-side, async)
- Owner reviews AI output → review_status updated
- Visitor loads a page → visitor_event row inserted

## Scoring rules (v1 — rule-based)
- `ai_summary_confidence` = returned by model, clamped 0–1
- If confidence < 0.7 → admin sees a warning badge; AI value not shown publicly
- Tags with < 0.75 confidence are hidden from public view until accepted

## What gets ranked (v1)
- Posts on homepage: ordered by `published_at DESC` (no ML ranking yet)

## v1 vs later
- **v1:** AI summary + tags generated on save, stored, surfaced in admin for review.
- **Later:** auto-tag confidence improves via owner feedback loop; related-post suggestions; visitor-behaviour-based ranking.
