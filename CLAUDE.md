# Signal.lab - Claude Snapshot

Updated: 2026-05-10

This file is the current build/deploy handoff for Claude and Codex.
Prefer this over older assumptions.

## Workspace and Git

- Local workspace: `C:\Codex\signal-lab`
- Git remote: `https://github.com/dkfinkbone/signal.lab.git`
- Active build branch: `feature/claude-build-001`
- Local branches currently present: `feature/claude-build-001`, `main`
- There is no local `staging` branch at the moment.
- Recent branch history includes:
  - `2cdd921` - `feat: add profile json database webhooks`
  - `4930488` - `chore: sync remote Supabase migrations`
  - `e7668c6` - `chore: harden Supabase onboarding config`
  - `2004380` - `docs: add Codex onboarding handoff`
  - `562afd7` - `feat: add onboarding member graph foundation`
  - `b55e9d7` - `feat: add dynamic llms and structured profile endpoints`

## Domain and URL State

- Product plan target domain: `https://signal-lab.connxr.com`
- Hosted Supabase Auth now uses that domain as `site_url`.
- Hosted Supabase Auth redirect allow-list has been updated for:
  - `http://localhost:3000/**`
  - `http://127.0.0.1:3000/**`
  - `https://*-dkfinkbone-gmailcoms-projects.vercel.app/**`
  - `https://signal-lab.connxr.com/**`
  - `https://signal.lab/**`
- Important:
  - `src/app/api/join/request-magic-link/route.ts` now builds `emailRedirectTo`
    from the incoming request origin, not from `NEXT_PUBLIC_SITE_URL`.
  - This reduces preview/prod mismatch risk for the magic-link flow.
  - Canonical tags, sitemap URLs, robots host fields, and `llms.txt` still depend
    on `NEXT_PUBLIC_SITE_URL`.
  - `.env.local.example` still contains `https://signal.lab` as a placeholder and
    should not be treated as the live source of truth.

## Stack

- Next.js `16.2.4` App Router
- TypeScript
- Tailwind CSS 4
- Supabase Postgres
- Vercel via GitHub integration

## Current App Surface

Public routes currently implemented:

- `/`
- `/about`
- `/project`
- `/insights`
- `/insights/[slug]`
- `/insights/[slug]/data.json`
- `/t/[slug]`
- `/c/[category]`
- `/c/[category]/data.json`
- `/agent-read/[slug]`
- `/api/agent-read/[slug]`
- `/api/search?q=...`
- `/api/access-request`
- `/join`
- `/join/[token]`
- `/join/[token]/signup`
- `/join/verify`
- `/onboarding/contribute`
- `/onboarding/profile`
- `/p/[slug]`
- `/p/[slug]/data.json`
- `/org/[slug]`
- `/org/[slug]/data.json`
- `/sitemap.xml`
- `/robots.txt`
- `/llms.txt`

Admin routes currently implemented:

- `/admin`
- `/admin/dashboard`
- `/admin/articles`
- `/admin/articles/[id]`
- `/admin/upload`
- `/api/admin/articles`
- `/api/admin/articles/[id]`
- `/api/admin/bulk-upload`
- `/api/admin/log-event`

## Current Product State

- Public site navigation exposes:
  - `About`
  - `Project`
  - `Insights`
  - `Attribution`
  - `Admin`
- Admin access is enforced with HTTP Basic Auth in `src/proxy.ts`.
- In-app article links are relative and preview-safe.
- Canonical URLs are built in `src/lib/canonical.ts`.
- Public article HTML is server-rendered and sanitized before render.
- Search and admin mutation routes are rate-limited.
- `/join` now includes a real invite-token entry form.
- Gated `/project` now includes an invite-token entry form.
- `/join` now includes a real access-request form backed by Supabase.
- The profile/org graph routes are now in the app and backed by:
  - `members`
  - `orgs`
  - `accounts`
  - `member_domains`
  - `access_requests`

## Supabase State

### Schema and migration status

- Remote and local migration history are currently aligned through:
  - `20260503124538_create_articles_and_request_events.sql`
  - `20260503125453_rls_policies_and_indexes.sql`
  - `20260503125655_attribution_rpc_functions.sql`
  - `20260507230140_create_football_stats_tables.sql`
  - `20260509234923_onboarding_member_graph_foundation.sql`
  - `20260510123000_add_profile_json.sql`
  - `20260510204031_add_access_requests.sql`
- The onboarding/profile migrations have been applied to the hosted project.

### Important contamination note

- `20260507230140_create_football_stats_tables.sql` exists in the hosted migration
  history but is not part of Signal.lab product scope.
- Do not build Signal.lab features on top of:
  - `matches`
  - `match_stats`
  - `match_lineups`
- Treat that migration as legacy cross-project contamination only.

### Auth and onboarding config

- Hosted Supabase Auth magic-link template has been updated for `/join/verify`.
- Hosted Supabase Auth redirect URLs have been updated for local, preview, and
  live domains.
- Current onboarding auth flow is:
  1. user opens `/join/[token]`
  2. user fills `/join/[token]/signup`
  3. `POST /api/join/request-magic-link`
  4. Supabase sends magic link
  5. user lands on `/join/verify`
  6. app upserts `members` row
  7. user goes to `/onboarding/contribute`
  8. app writes `accounts` + `member_domains`
  9. app refreshes `profile_json`
  10. user lands on `/onboarding/profile`

### Edge Function and webhooks

- `generate-profile-json` has been deployed to Supabase Edge Functions.
- `supabase/config.toml` now persists:
  - `[functions.generate-profile-json]`
  - `verify_jwt = false`
- Database webhook triggers are now configured via migration:
  - `20260510165945_add_profile_json_webhooks.sql`
- Current webhook triggers:
  - `members_generate_profile_json_webhook`
  - `accounts_generate_profile_json_webhook`
  - `member_domains_generate_profile_json_webhook`

## Reporting and Attribution

- Request logging pipeline lives in `src/lib/log-event.ts`.
- `request_events` rows currently capture:
  - `route_type`
  - `path`
  - `slug`
  - `category`
  - `user_agent`
  - `bot_family`
  - `referrer`
  - `query_params`
  - `ip_hash`
  - `status_code`
- Raw IPs are not stored. IPs are hashed with `ATTRIBUTION_SALT`.
- Logging currently covers:
  - `/`
  - `/about`
  - `/project`
  - `/insights`
  - `/insights/[slug]`
  - `/t/[slug]`
  - `/c/[category]`
  - `/agent-read/[slug]`
  - `/api/search`
  - `/llms.txt`
  - `/robots.txt`
  - `/sitemap.xml`
  - join/onboarding routes added by the onboarding work

## Admin/Auth Notes

- `src/proxy.ts` is the Next 16 replacement for old middleware naming.
- It protects:
  - `/admin/:path*`
  - `/api/admin/:path*`
- Exception:
  - `/api/admin/log-event` remains callable without Basic Auth because it is
    protected by `INTERNAL_LOG_SECRET` instead.
- Admin credentials are stored in local `.env.local` and Vercel project envs.
- Do not hardcode credentials into source files or docs.

## Environment Variables

Required env vars for the current app:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ATTRIBUTION_SALT`
- `INTERNAL_LOG_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `PROJECT_INVITE_TOKENS`

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Never import `src/lib/supabase-service.ts` into client components.
- `PROJECT_INVITE_TOKENS` is still the temporary invite bridge for `/join/[token]`.
- Later stage env vars for email onramp are defined in `SIGNAL_LAB_PLAN.md`.

## Key Files

Use these files first when making changes:

```text
CLAUDE.md
SIGNAL_LAB_PLAN.md
CODEX_HANDOFF.md
.env.local.example
.vercel/project.json

src/app/layout.tsx
src/app/page.tsx
src/app/about/page.tsx
src/app/project/page.tsx
src/app/insights/page.tsx
src/app/insights/[slug]/page.tsx
src/app/insights/[slug]/data.json/route.ts
src/app/t/[slug]/page.tsx
src/app/c/[category]/page.tsx
src/app/c/[category]/data.json/route.ts
src/app/agent-read/[slug]/route.ts
src/app/api/search/route.ts
src/app/api/access-request/route.ts
src/app/join/page.tsx
src/app/join/[token]/page.tsx
src/app/join/[token]/signup/page.tsx
src/app/join/verify/route.ts
src/app/api/join/request-magic-link/route.ts
src/app/onboarding/contribute/page.tsx
src/app/api/onboarding/contribute/route.ts
src/app/onboarding/profile/page.tsx
src/app/p/[slug]/page.tsx
src/app/p/[slug]/data.json/route.ts
src/app/org/[slug]/page.tsx
src/app/org/[slug]/data.json/route.ts
src/app/robots.ts
src/app/sitemap.ts
src/app/llms.txt/route.ts

src/app/admin/page.tsx
src/app/admin/dashboard/page.tsx
src/app/admin/articles/page.tsx
src/app/admin/articles/[id]/page.tsx
src/app/admin/upload/page.tsx
src/components/ArticleEditor.tsx
src/components/JoinSignupForm.tsx
src/components/OnboardingContributionForm.tsx
src/components/InviteTokenForm.tsx
src/components/AccessRequestForm.tsx

src/proxy.ts
src/lib/articles.ts
src/lib/canonical.ts
src/lib/log-event.ts
src/lib/bot-detection.ts
src/lib/ip-hash.ts
src/lib/sanitize-html.ts
src/lib/supabase-anon.ts
src/lib/supabase-service.ts
src/lib/onboarding.ts
src/lib/onboarding-store.ts
src/lib/onboarding-cookie.ts
src/lib/profile-json.ts
src/lib/member-graph.ts
src/lib/access-requests.ts

supabase/config.toml
supabase/functions/generate-profile-json/index.ts
supabase/migrations/
```

## Local Verification

These commands currently pass on the active feature branch:

```bash
npm test
npm run lint
npm run build
```

## Current Open Issues / Gotchas

- The invite system is still on the temporary `PROJECT_INVITE_TOKENS` bridge and
  does not yet implement `invite_tokens` / `invite_events`.
- Preview deployments are still not the right place to judge real
  indexing/citation behavior.
- Admin uses browser Basic Auth prompts, not an in-app login form.
- The fetched football migration is not product scope and should be ignored by
  Signal.lab feature work.
