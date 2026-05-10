# CODEX_HANDOFF.md

Updated: 2026-05-10

This file is the current Codex handoff for Claude Code after the onboarding
foundation pass.

Read this after:
- `CLAUDE.md`
- `SIGNAL_LAB_PLAN.md`

## Branch state

- Repo: `https://github.com/dkfinkbone/signal.lab.git`
- Active branch: `feature/claude-build-001`
- Latest onboarding commit: `562afd7` - `feat: add onboarding member graph foundation`
- Previous major content-graph commit: `b55e9d7` - `feat: add dynamic llms and structured profile endpoints`

## What Codex completed

Codex implemented the missing base onboarding/schema foundation for:
- `members`
- `orgs`
- `accounts`
- `member_domains`

### New migration

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

Note:
- No anon/authenticated policies were added yet because the current app reads the
  member/org graph with the service role on the server.
- This avoids getting blocked by the new Supabase Data API exposure defaults.

### New onboarding flow

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

### Public graph updates

Codex also updated:
- `src/lib/member-graph.ts`
  - now uses server-side service role reads instead of anon reads
- `src/app/p/[slug]/page.tsx`
  - now renders sectors/regions from the stored profile JSON
- `src/app/org/[slug]/page.tsx`
  - shared domains now link to real category pages
- `src/app/project/page.tsx`
  - now uses the shared invite-token helper and server auth helper
- `src/app/join/page.tsx`
  - now acts as the invalid/expired invite fallback page

## Current behavior

### Minimal invite model

The new join flow does **not** implement Stage 01 invite infrastructure yet.

For now:
- `/join/[token]` uses `PROJECT_INVITE_TOKENS`
- if `PROJECT_INVITE_TOKENS` is empty, any non-empty token is accepted

This is intentional for pilot testing and should be replaced later by:
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
- `orgs` row is auto-created once there are at least 2 verified members with the same domain
- members with that domain are linked to the org

## Verification already completed

These passed locally on `562afd7`:

```bash
npm test
npm run lint
npm run build
```

Additional smoke checks completed locally:
- `/join/[token]` returns `200`
- `/join/[token]/signup` returns `200`
- unauthenticated `/onboarding/contribute` redirects to `/join`

## Immediate Supabase gaps

These are the blockers to real end-to-end onboarding in the hosted project.

### 1. Apply the new base migration

Required:
- apply `20260509234923_onboarding_member_graph_foundation.sql`

Without this:
- `members`
- `orgs`
- `accounts`
- `member_domains`

do not exist, and the onboarding routes cannot finish.

### 2. Apply the later profile JSON migration after the base migration

Existing file:
- `supabase/migrations/20260510123000_add_profile_json.sql`

That migration previously assumed `members` already existed.

Now the order should be:
1. `20260509234923_onboarding_member_graph_foundation.sql`
2. `20260510123000_add_profile_json.sql`

After the base migration, review whether the second migration still needs all of
its statements because some fields now overlap with the new base schema.

### 3. Update Supabase Auth email template for SSR magic links

The app now expects the magic link to land on:
- `/join/verify?token_hash=...&type=email`

Update the relevant Supabase email template so it sends `token_hash` to
`/join/verify`, not to the old auth helper path.

Also ensure the redirect URLs allow:
- local dev origin(s)
- preview deployment origin(s)
- production origin

### 4. Deploy and wire the `generate-profile-json` Edge Function

Existing function:
- `supabase/functions/generate-profile-json/index.ts`

This still needs:
- deploy to Supabase Edge Functions
- function secrets verified
- database webhooks created manually in the Supabase dashboard

Claude should assume the webhook setup is still manual.

### 5. Manual database webhooks still not configured

The function is meant to react to changes on:
- `members`
- `accounts`
- `member_domains`

Manual Supabase dashboard work is still required here.

Payload assumptions in the function currently match Supabase webhook docs:
- `type`
- `table`
- `schema`
- `record`
- `old_record`

### 6. No invite table infrastructure yet

Still missing:
- `invite_tokens`
- `invite_events`
- `/api/invite/create`
- `/api/invite/[token]`
- invite analytics in admin dashboard

The current onboarding path is a bridge, not the final invite system.

## Important implementation caveats

### Service-role reads

The member/org graph now reads with `getServiceClient()` on the server.

Reason:
- avoids reliance on anon/Data API grants for the new tables
- keeps public SSR pages working immediately once the DB schema exists

Risk:
- do not move these reads into client components
- do not expose service-role logic through public client code

### Supabase SSR session refresh

Current state:
- `src/proxy.ts` still only handles Basic Auth for `/admin` and `/api/admin/*`
- it does **not** yet implement the Supabase session refresh proxy pattern

This is acceptable for the current pilot flow but may become flaky if auth session
refresh behavior causes problems across requests.

If Claude sees auth inconsistency during onboarding, next hardening step is:
- add Supabase SSR session refresh handling into `src/proxy.ts`
- prefer `getClaims()` semantics for protected auth checks

### RLS and API exposure

Because of recent Supabase changes, new public-schema tables may not be exposed to
the Data API automatically on some projects.

Current code path avoids this issue for public profile/org rendering by using the
service role server-side.

If Claude later wants anon/public REST access to these tables, it will need:
- explicit grants if Data API exposure is disabled by default
- proper RLS policies

## Recommended next sequence for Claude

### Immediate next step

Do **not** start another large feature first.

Instead:
1. confirm the new migration has been applied in Supabase
2. confirm the magic-link template now points to `/join/verify`
3. confirm redirect URLs are allowed in Supabase Auth settings
4. deploy `generate-profile-json`
5. manually configure the database webhooks
6. run a real hosted smoke test:
   - `/join/[token]`
   - `/join/[token]/signup`
   - magic-link click
   - `/onboarding/contribute`
   - `/onboarding/profile`
   - `/p/[slug]`
   - `/org/[slug]` after second member from same domain

### After that

Claude should then decide between these two follow-ups:

Option A - finish Stage 01 properly
- build `invite_tokens`
- build `invite_events`
- replace env-token fallback with real token validation
- add invite analytics to admin dashboard

Option B - harden the new onboarding flow
- add Supabase session refresh proxy support
- add more E2E coverage
- deploy and verify the profile JSON regeneration path
- confirm category/profile/org internal linking behavior in preview/prod

Recommended order:
- do Option A first if the product priority is the real invite loop
- do Option B first if the immediate goal is a reliable demoable onboarding path

## What Claude should not assume

- Do not assume the hosted Supabase project already has the new tables.
- Do not assume the magic-link template has been updated.
- Do not assume the Edge Function is deployed.
- Do not assume the webhooks are configured.
- Do not assume `PROJECT_INVITE_TOKENS` will remain the long-term model.

## Codex note

Codex intentionally stopped at the point where:
- code is ready
- local verification is green
- GitHub branch is updated
- remaining blockers are Supabase config + deployment tasks

This is the correct pause point before deeper invite-system work.
