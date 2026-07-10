# Data Model — ling-ai-app

## posts
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | nullable; owner-scoped at lock-down |
| created_at | timestamptz | default now() |
| title | text | required |
| slug | text | unique, URL-safe |
| body | text | full article content |
| excerpt | text | short teaser, manual or AI-derived |
| cover_image_url | text | public URL |
| status | text | 'draft' \| 'published' |
| published_at | timestamptz | set on publish |
| deleted_at | timestamptz | soft delete |
| ai_summary | text | AI-generated |
| ai_summary_source | text | e.g. 'openai/gpt-4o' |
| ai_summary_confidence | numeric | 0–1 |
| ai_summary_review_status | text | 'unreviewed'\|'accepted'\|'rejected' |
| ai_tags | text[] | AI-generated |
| ai_tags_source | text | |
| ai_tags_confidence | numeric | |
| ai_tags_review_status | text | |

## images
| Field | Type |
|---|---|
| id | uuid PK |
| user_id | uuid |
| created_at | timestamptz |
| url | text |
| alt_text | text |
| caption | text |
| deleted_at | timestamptz |

## videos
| Field | Type |
|---|---|
| id | uuid PK |
| user_id | uuid |
| created_at | timestamptz |
| title | text |
| embed_url | text |
| description | text |
| thumbnail_url | text |
| deleted_at | timestamptz |

## contact_messages
| Field | Type |
|---|---|
| id | uuid PK |
| user_id | uuid |
| created_at | timestamptz |
| sender_name | text |
| sender_email | text |
| message | text |
| is_read | boolean |

## visitor_events
| Field | Type |
|---|---|
| id | uuid PK |
| user_id | uuid |
| created_at | timestamptz |
| page_path | text |
| referrer | text |
| user_agent | text |
| session_id | text |

## RLS
- v1: permissive SELECT + ALL policies on every table (demo-first).
- Lock-down sprint: writes restricted to `auth.uid() = user_id`; SELECT stays open for public tables.
