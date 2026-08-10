# SaaS Upgrades — Multi-design, Multi-app, Multi-tenant, Multi-tier, Multi-team

## Confirmed product definition

1. **Multi-design** — each organization chooses one of three public-site themes: Editorial, Garden, or Minimal.
2. **Multi-app** — each organization can enable or disable Gallery, Videos, Contact, and Analytics while Posts remains the core app.
3. **Multi-tenant** — organizations own content and settings; members can access only organizations they belong to. The existing Ling content is backfilled into the first owner's organization.
4. **Multi-tier** — Free and Pro plans. Free supports one member and core publishing; Pro unlocks additional members, all optional apps, and AI review automation. Stripe Checkout and the billing portal manage Pro subscriptions.
5. **Multi-team** — owners invite members by email, members accept while signed in, and AI suggestions enter a review queue before public use.

## Main workflow

An authenticated owner opens Studio settings, selects a theme and enabled apps, invites collaborators, and optionally upgrades to Pro. Every content row is scoped to the active organization. AI-generated summaries and tags create review tasks that an organization member accepts or rejects before the values appear publicly.

## Compatibility

- The existing `/` public site remains the canonical Ling site.
- Existing content is assigned to the first authenticated owner's organization by migration.
- Additive columns are nullable during migration and then backfilled; existing URLs and content IDs do not change.
- Stripe is optional. Without Stripe environment variables, the Free plan and all existing publishing features remain operational.

## Plan limits

| Capability | Free | Pro |
|---|---:|---:|
| Members | 1 | 10 |
| Themes | Editorial | All 3 |
| Posts | Unlimited | Unlimited |
| Gallery / Videos / Contact | Enabled for legacy organization | Configurable |
| Analytics | Basic | Enabled |
| AI review queue | Manual fields | Automated queue |

## Security invariants

- Organization-scoped writes require an active membership.
- Owner-only actions: billing, organization settings, invitations, and member removal.
- Public reads remain limited to published/non-deleted content.
- Stripe webhooks use the service role only after signature verification.
- Invitation acceptance requires the signed-in user's email to match the invitation email.
