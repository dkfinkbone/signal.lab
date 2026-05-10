# CODEX_HANDOFF.md

Updated: 2026-05-10

This file is the current Codex handoff for Claude Code after the hosted
Supabase onboarding/config pass.

Read this after:
- `CLAUDE.md`
- `SIGNAL_LAB_PLAN.md`

## Branch state

- Repo: `https://github.com/dkfinkbone/signal.lab.git`
- Active branch: `feature/claude-build-001`
- Current branch head:
  - `4930488` - `chore: sync remote Supabase migrations`
  - `e7668c6` - `chore: harden Supabase onboarding config`
  - `2004380` - `docs: add Codex onboarding handoff`
  - `562afd7` - `feat: add onboarding member graph foundation`
  - `b55e9d7` - `feat: add dynamic llms and structured profile endpoints`

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

Supabase state verified:
- local and remote migration history are aligned
- onboarding/profile migrations are applied
- `generate-profile-json` is deployed
- hosted auth config is updated for the onboarding callback flow

## Immediate Supabase gap

### Manual database webhooks are still not configured

This is now the main remaining hosted Supabase task.

Manual Supabase dashboard work is still required for:
- `members`
- `accounts`
- `member_domains`

These should target:
- `generate-profile-json`

The function payload assumptions currently expect:
- `type`
- `table`
- `schema`
- `record`
- `old_record`

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

## Recommended next sequence for Claude

### Immediate next step

Do **not** redo the already-finished Supabase work.

Instead:
1. create the three database webhooks in the Supabase dashboard
2. run a real hosted smoke test:
   - `/join/[token]`
   - `/join/[token]/signup`
   - magic-link click
   - `/onboarding/contribute`
   - `/onboarding/profile`
   - `/p/[slug]`
   - `/org/[slug]` after second member from same domain
3. confirm `profile_json` regeneration actually fires after writes

### After that

Claude should then choose between:

Option A - finish Stage 01 properly
- build `invite_tokens`
- build `invite_events`
- replace env-token fallback with real token validation
- add invite analytics to admin dashboard

Option B - harden the new onboarding flow
- add Supabase session refresh proxy support
- add more E2E coverage
- verify category/profile/org internal linking behavior in preview/prod

Recommended order:
- do Option A first if the priority is the real invite loop
- do Option B first if the immediate goal is a reliable demoable onboarding path

## What Claude should not assume

- Do not assume the football migration is product scope.
- Do not assume `PROJECT_INVITE_TOKENS` is the long-term model.
- Do not assume database webhooks are configured yet.
- Do not assume the invite system tables already exist.
- Do not assume Vercel `NEXT_PUBLIC_SITE_URL` is already corrected unless verified.
