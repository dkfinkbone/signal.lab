# CODEX_HANDOFF.md

Updated: 2026-05-16

This file is the current Codex handoff for Claude Code after the hosted
Supabase onboarding/config pass, public/admin separation, and live redeploy.

Read this after:
- `CLAUDE.md`
- `SIGNAL_LAB_PLAN.md`

## Branch state

- Repo: `https://github.com/dkfinkbone/signal.lab.git`
- Active branch: `feature/claude-build-001`
- Recent branch history includes:
  - `ea02473` - `docs: add proof of reach roadmap`
  - `cbb6c13` - `docs: add market proof graph roadmap`
  - `074959e` - `feat: add returning member workspace`
  - `36088bb` - `feat: add access request and token entry flow`
  - `2cdd921` - `feat: add profile json database webhooks`
  - `30e23a3` - `docs: refresh Claude and Codex handoffs`

## What Codex completed

### 1. Base onboarding/schema foundation

Codex implemented the missing base onboarding/schema foundation for:
- `members`
- `orgs`
- `accounts`
- `member_domains`

Key migration:
- `supabase/migrations/20260509234923_onboarding_member_graph_foundation.sql`

This migration creates:
- `public.orgs`
- `public.members`
- `public.accounts`
- `public.member_domains`

It also adds:
- FK indexes
- check constraints for picklist fields
- `updated_at` trigger function
- RLS enabled on the new tables

### 2. Onboarding flow

Implemented routes:
- `/join/[token]`
- `/join/[token]/signup`
- `/join/verify`
- `/onboarding/contribute`
- `/onboarding/profile`
- `/api/join/request-magic-link`
- `/api/onboarding/contribute`

Implemented components/helpers:
- `src/components/JoinSignupForm.tsx`
- `src/components/OnboardingContributionForm.tsx`
- `src/lib/onboarding.ts`
- `src/lib/onboarding-store.ts`
- `src/lib/onboarding-cookie.ts`
- `src/lib/supabase-auth-server.ts`
- `src/lib/profile-json.ts`
- `src/lib/invite-tokens.ts`

### 3. Public graph updates

Codex also updated:
- `src/lib/member-graph.ts`
  - now uses server-side service role reads
- `src/app/p/[slug]/page.tsx`
  - renders sectors/regions from stored profile JSON
- `src/app/org/[slug]/page.tsx`
  - shared domains link to real category pages
- `src/app/project/page.tsx`
  - uses the shared invite-token helper and server auth helper
- `src/app/join/page.tsx`
  - acts as the invalid/expired invite fallback page

### 4. Hosted Supabase/Auth hardening

Codex completed the hosted Supabase steps that were previously still open:

- applied:
  - `20260509234923_onboarding_member_graph_foundation.sql`
  - `20260510123000_add_profile_json.sql`
- deployed:
  - `supabase/functions/generate-profile-json/index.ts`
- persisted Edge Function config in:
  - `supabase/config.toml`
  - `[functions.generate-profile-json]`
  - `verify_jwt = false`
- updated hosted Supabase Auth:
  - `site_url = https://signal-lab.connxr.com`
  - redirect allow-list for local, preview, and live domains
  - magic-link email template for `/join/verify` with `token_hash`
- hardened:
  - `src/app/api/join/request-magic-link/route.ts`
  - now uses the incoming request origin for `emailRedirectTo`

### 5. Migration history sync

The hosted project already had older migrations that were missing from the repo.
Codex fetched and committed them so local and remote history match:

- `20260503124538_create_articles_and_request_events.sql`
- `20260503125453_rls_policies_and_indexes.sql`
- `20260503125655_attribution_rpc_functions.sql`
- `20260507230140_create_football_stats_tables.sql`

### 6. Database webhooks are now configured

Codex created and applied:
- `supabase/migrations/20260510165945_add_profile_json_webhooks.sql`

This migration adds:
- `members_generate_profile_json_webhook`
- `accounts_generate_profile_json_webhook`
- `member_domains_generate_profile_json_webhook`

These now POST to:
- `https://imeppcpuwibvvyxmhiwo.supabase.co/functions/v1/generate-profile-json`

### 7. Join/access UX is now usable

Codex also added a real token-entry and access-request layer:

- `/join` now includes:
  - token input that routes to `/join/[token]`
  - token input that can open `/project?token=...`
  - a real access-request form
- `/project` gated view now includes:
  - token input so the user does not have to hand-edit the URL
- new API route:
  - `/api/access-request`
- new Supabase table:
  - `access_requests`
- new migration:
  - `20260510204031_add_access_requests.sql`

### 8. Returning-member workspace is now live

Codex added a real returning-member surface:

- `/me`
  - resend sign-in link flow
  - profile edit form
  - contribution edit entry point
- `/api/auth/request-sign-in-link`
- `/api/account/profile`

The verify flow now returns existing members to `/me` instead of always forcing
them back through first-time onboarding.

### 9. Homepage discoverability remediation is now on the branch

Codex hardened the landing page against the LLM discoverability scan findings:

- `src/lib/canonical.ts`
  - default canonical fallback is now `https://signal-lab.connxr.com`
  - site URL is read dynamically from `NEXT_PUBLIC_SITE_URL`
- `src/lib/metadata.ts`
  - shared page/article metadata now adds:
    - Open Graph
    - Twitter card
    - author / creator / publisher fields
- `src/lib/json-ld.ts`
  - homepage now emits:
    - `WebSite`
    - `Organization`
    - `FAQPage`
- `src/app/page.tsx`
  - landing page now includes visible extractable content using:
    - `<dl>`
    - `<table>`
    - `<details>/<summary>`

### 10. Public/admin separation and live deploy are now complete

Codex removed admin awareness from the public UI and redeployed the app:

- removed public links to `/admin` and `/admin/dashboard` from:
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
- public homepage CTAs now point to:
  - `/insights`
  - `/join`
  - `/me`
- public/member copy no longer tells users to contact "an admin"; it now refers to
  the Signal.lab team in:
  - `src/components/AccessRequestForm.tsx`
  - `src/components/JoinSignupForm.tsx`
- updated editorial/upload workflow doc:
  - `.agents/skills/content-management/publish-article.md`
  - now requires:
    - UTF-8 handling
    - `{ "articles": [...] }` request body for bulk upload
    - removal of em/en dashes from prose
    - anti-LLM editorial cleanup before upload
- deployed to production on `2026-05-16`:
  - `https://signal-lab.connxr.com`

## Current behavior

### Minimal invite model

The join flow still does **not** implement Stage 01 invite infrastructure.

For now:
- `/join/[token]` uses `PROJECT_INVITE_TOKENS`
- if `PROJECT_INVITE_TOKENS` is empty, any non-empty token is accepted

This is still the pilot/testing bridge and should later be replaced by:
- `invite_tokens`
- `invite_events`
- invite APIs
- invite analytics/dashboard wiring

Separate from the invite-token bridge:
- `/join` now records access requests into `access_requests`
- `/admin/dashboard` now shows the latest access requests

### Admin access

Current admin behavior:
- public users can browse content, request access, and use `/me` without seeing
  admin links in the shared site UI
- admin is entered by direct URL only:
  - `https://signal-lab.connxr.com/admin`
  - `https://signal-lab.connxr.com/admin/dashboard`
- the browser then shows the HTTP Basic Auth challenge from `src/proxy.ts`
- the credentials are still:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
- there is still no in-app admin login screen

Important:
- if future public pages reintroduce links to `/admin*`, browser auth prompts can
  resurface because those routes are protected by Basic Auth

### Auth flow

Current auth flow:
1. user opens `/join/[token]`
2. user fills `/join/[token]/signup`
3. `POST /api/join/request-magic-link`
4. Supabase sends magic link
5. user lands on `/join/verify`
6. app upserts `members` row
7. user goes to `/onboarding/contribute`
8. app writes `accounts` + `member_domains`
9. app recalculates `profile_score`
10. app refreshes `profile_json`
11. user lands on `/onboarding/profile`

### Org logic

Current org logic:
- `org_domain` is inferred from work email
- `orgs` row is auto-created once there are at least 2 verified members with the
  same domain
- members with that domain are linked to the org

## Verification already completed

These currently pass on the branch:

```bash
npm test
npm run lint
npm run build
```

Current branch test count after the public/admin separation and deploy pass:
- `90/90` Jest tests passing

Supabase state verified:
- local and remote migration history are aligned
- onboarding/profile migrations are applied
- `generate-profile-json` is deployed
- hosted auth config is updated for the onboarding callback flow
- database webhook triggers exist on:
  - `members`
  - `accounts`
  - `member_domains`

The webhook payload assumptions currently expect:
- `type`
- `table`
- `schema`
- `record`
- `old_record`

Discoverability state verified locally:
- homepage metadata now includes social and attribution fields
- homepage JSON-LD now exists
- homepage extractable FAQ/table/definition-list structure now exists

Deploy state verified:
- production Vercel env contains the required Supabase public and service-role vars
- the live site was redeployed on `2026-05-16`
- preview deployments without preview Supabase env parity can still show empty
  `/insights` results even when production is healthy

## Important implementation caveats

### Service-role reads

The member/org graph reads with `getServiceClient()` on the server.

Reason:
- avoids reliance on anon/Data API grants for the new tables
- keeps public SSR pages working immediately once the DB schema exists

Risk:
- do not move these reads into client components
- do not expose service-role logic through public client code

### Supabase SSR session refresh

Current state:
- `src/proxy.ts` still handles Basic Auth for `/admin` and `/api/admin/*`
- it does **not** implement a Supabase session refresh proxy pattern

This is acceptable for the current pilot flow, but if auth consistency becomes
flaky across requests, the next hardening step is:
- add Supabase SSR session refresh handling into `src/proxy.ts`

### RLS and API exposure

The current public profile/org code path avoids anon Data API exposure concerns by
using the service role server-side.

If Claude later wants anon/public REST access to these tables, it will need:
- explicit grants if Data API exposure is disabled by default
- proper RLS policies

### Unrelated remote migration contamination

`20260507230140_create_football_stats_tables.sql` exists in the hosted migration
history but is not part of Signal.lab product scope.

Do not build Signal.lab features on top of:
- `matches`
- `match_stats`
- `match_lineups`

Treat that migration as legacy cross-project contamination only.

### Canonical host caveat

If Vercel preview scans still report `https://signal.lab`, the issue is no longer
the code helper. It means:
- `NEXT_PUBLIC_SITE_URL` is still stale in Vercel, or
- the scan is hitting an older deployment

## Recommended next sequence for Claude

### Immediate next step

Do **not** redo the already-finished Supabase work, homepage discoverability pass,
or the public/admin separation change.

Instead:
1. decide whether preview deployments need full Supabase env parity for article/content review
2. keep admin as direct-URL-only access; do not reintroduce public admin links
3. start Stage 04B market-proof graph work from `SIGNAL_LAB_PLAN.md`

### After that

Claude should then choose between:

Option A - finish Stage 01 properly
- build `invite_tokens`
- build `invite_events`
- replace env-token fallback with real token validation
- add invite analytics to admin dashboard

Option B - build Stage 04B / Stage 04C
- extend `/me` and `/onboarding/contribute` with vendor expertise and anonymised account evidence
- build `/proof/[slug]` and `/proof/[slug]/data.json`
- add proof-of-reach/contact workflow surfaces such as `/me/reach`

Recommended order:
- do Option B first if the priority is contributor value and LLM-attributable market proof
- do Option A first if the priority is the real invite loop and viral network growth

## What Claude should not assume

- Do not assume the football migration is product scope.
- Do not assume `PROJECT_INVITE_TOKENS` is the long-term model.
- Do not assume the invite system tables already exist.
- Do not assume Vercel `NEXT_PUBLIC_SITE_URL` is already corrected unless verified.
- Do not assume preview deployments have the same Supabase env coverage as production.
- Do not assume public users should see admin links.
- Do not assume admin uses an in-app login form.
