# Signal.lab - Claude Snapshot

Updated: 2026-05-03

This file is the current build/deploy handoff for Claude and Codex.
Prefer this over older assumptions.

## Workspace and Git

- Local workspace: `C:\Codex\signal-lab`
- Git remote: `https://github.com/dkfinkbone/signal.lab.git`
- Active build branch: `feature/claude-build-001`
- Local branches currently present: `feature/claude-build-001`, `main`
- There is no local `staging` branch at the moment.
- App snapshot below reflects the latest application commit on the feature branch:
  - `6a5bcb6` - expose admin navigation in app
  - `6f5fe07` - expand crawl attribution reporting
  - `4f65e8d` - keep preview article links relative
  - `4361f6e` - lazy-init public Supabase client
  - `a469e86` - import and harden Signal.lab build

## Vercel State

- Primary Vercel project: `dkfinkbone-signal.lab`
- Local Vercel link file: `.vercel/project.json`
- Linked Vercel IDs:
  - `projectId=prj_6OW2WlCPq4oPC9C3BZps0ez3thln`
  - `orgId=team_OJF3IfBcoAPHgUxbbpjLCFuM`
- Current ready preview for the latest app commit (`6a5bcb6`):
  - `https://dkfinkbone-signal-cgj4lhxol-dkfinkbone-gmailcoms-projects.vercel.app`
- Current branch preview alias:
  - `https://dkfinkbone-signallab-git-f-d0f056-dkfinkbone-gmailcoms-projects.vercel.app`
- Current production alias:
  - `https://dkfinkbone-signallab-dkfinkbone-gmailcoms-projects.vercel.app`
- Important:
  - The primary project preview is healthy and ready.
  - The primary project production alias still points at an old `main` deployment and is currently in `ERROR`.
  - Production has not yet been promoted from `feature/claude-build-001`.
  - A second Vercel project, `project-02f5j`, is also still linked to the GitHub repo and still fails on deploy. Ignore it unless the task is specifically to clean up Vercel project wiring.

## Domain and Crawlability Caveat

- `NEXT_PUBLIC_SITE_URL` is still set to `https://signal.lab` in local/Vercel config.
- That custom domain is not live yet.
- Internal app navigation no longer depends on that value, but these still do:
  - canonical tags
  - sitemap URLs
  - robots host/sitemap fields
  - `llms.txt` absolute links
- If you move testing or production onto the Vercel production domain, update `NEXT_PUBLIC_SITE_URL` first.
- Preview URLs are useful for QA, but they are the wrong target for real indexing experiments.

## Stack

- Next.js `16.2.4` App Router
- TypeScript
- Tailwind CSS 4
- Supabase Postgres
- Vercel via GitHub integration
- Vercel currently reports Node `24.x`

## Current App Surface

Public routes currently implemented:

- `/`
- `/insights`
- `/insights/[slug]`
- `/t/[slug]`
- `/c/[category]`
- `/agent-read/[slug]`
- `/api/agent-read/[slug]`
- `/api/search?q=...`
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

- Public site navigation now exposes:
  - `Insights`
  - `Attribution`
  - `Admin`
- Admin access is enforced with HTTP Basic Auth in `src/proxy.ts`.
- In-app article links are relative and preview-safe.
- Canonical URLs remain absolute and are built in `src/lib/canonical.ts`.
- Public article HTML is server-rendered and sanitized before render.
- Search and admin mutation routes are rate-limited.
- Current Supabase content snapshot at update time:
  - `7` published articles
  - `71` rows in `request_events`

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
  - `/insights`
  - `/insights/[slug]`
  - `/t/[slug]`
  - `/c/[category]`
  - `/agent-read/[slug]`
  - `/api/search`
  - `/llms.txt`
  - `/robots.txt`
  - `/sitemap.xml`
- Attribution UI lives at `src/app/admin/dashboard/page.tsx` and currently shows:
  - summary cards
  - requests by bot family
  - requests by route type
  - requests by slug
  - latest recognized bot events
  - latest 100 request events
- Current limitation:
  - there are request logs already, but there are not yet confirmed production crawler hits from a fully public crawlable deployment
  - most existing rows are still human/manual traffic or `unknown` user agents

## Admin/Auth Notes

- `src/proxy.ts` is the Next 16 replacement for old middleware naming.
- It protects:
  - `/admin/:path*`
  - `/api/admin/:path*`
- Exception:
  - `/api/admin/log-event` remains callable without Basic Auth because it is protected by `INTERNAL_LOG_SECRET` instead.
- Admin credentials are stored in local `.env.local` and in the Vercel project envs.
- Do not hardcode credentials into source files or docs.

## Environment Variables

Required env vars are defined in `.env.local.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ATTRIBUTION_SALT`
- `INTERNAL_LOG_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Never import `src/lib/supabase-service.ts` into client components.
- Secrets are already populated in local `.env.local` for this workspace and in the primary Vercel project.

## Key Files

Use these files first when making changes:

```text
CLAUDE.md
.env.local.example
.vercel/project.json

src/app/layout.tsx                  global public navigation
src/app/page.tsx                    homepage + crawler links + home logging
src/app/insights/page.tsx           insights index
src/app/insights/[slug]/page.tsx    full article page
src/app/t/[slug]/page.tsx           teaser page
src/app/c/[category]/page.tsx       category page
src/app/agent-read/[slug]/route.ts  browser JSON view
src/app/api/search/route.ts         public search API
src/app/robots.ts                   robots.txt generation + logging
src/app/sitemap.ts                  sitemap generation + logging
src/app/llms.txt/route.ts           llms.txt generation + logging

src/app/admin/page.tsx              admin overview
src/app/admin/dashboard/page.tsx    attribution dashboard
src/app/admin/articles/page.tsx     article list
src/app/admin/articles/[id]/page.tsx article editor page
src/app/admin/upload/page.tsx       bulk upload page
src/components/ArticleEditor.tsx    create/edit article UI

src/proxy.ts                        admin Basic Auth gate
src/lib/articles.ts                 article read/search helpers
src/lib/canonical.ts                canonical and relative route builders
src/lib/log-event.ts                request event insertion
src/lib/bot-detection.ts            user-agent classification
src/lib/ip-hash.ts                  salted IP hashing
src/lib/sanitize-html.ts            HTML sanitization
src/lib/supabase-anon.ts            public Supabase client
src/lib/supabase-service.ts         service-role client
src/types/index.ts                  core shared types
```

## Local Verification

These commands currently pass on the active feature branch:

```bash
npm test
npm run lint
npm run build
```

Run locally with:

```bash
npm install
npm run dev
```

## Current Open Issues / Gotchas

- Production is not promoted yet.
- The production Vercel alias is still on the old broken `main` deployment.
- The duplicate Vercel project `project-02f5j` still exists and still fails.
- `NEXT_PUBLIC_SITE_URL` still points to `https://signal.lab`, which is not yet the live public domain.
- Preview deployments are not the right place to judge real indexing/citation behavior.
- Admin uses browser Basic Auth prompts, not an in-app login form.
