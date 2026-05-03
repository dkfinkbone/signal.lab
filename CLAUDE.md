# Signal.lab — CLAUDE.md

## Project overview
Signal.lab is an **agent-readable publishing platform** for expert knowledge nodes.
Every article is a crawlable, attributable, machine-readable node — served as
server-rendered HTML for humans, and clean JSON for LLM agents.

## Stack
- **Next.js 15** App Router, TypeScript, Tailwind CSS 4
- **Supabase Postgres** — `articles` + `request_events` tables
- **Vercel** hosting via GitHub integration

## Branch model
| Branch | Purpose |
|--------|---------|
| `main` | Production |
| `staging` | Pre-production |
| `feature/claude-build-*` | Claude Code build branches |
| `review/codex-*` | Codex review/hardening branches |

**Never commit directly to `main` or `staging`.**
Current build branch: `feature/claude-build-001`

## Environment variables
See `.env.local.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ATTRIBUTION_SALT` — salted IP hashing, never store raw IPs
- `INTERNAL_LOG_SECRET` — protects `/api/admin/log-event` from public access
- `NEXT_PUBLIC_SITE_URL`

## Key constraints
1. **No raw IP storage** — use `hashIp()` from `src/lib/ip-hash.ts`
2. **All public pages must be server-rendered** — no client-only article rendering
3. **Full article text must appear in View Source**
4. **Teaser pages (`/t/:slug`) must never render `full_body`**
5. **`SUPABASE_SERVICE_ROLE_KEY` is server-only** — never import `supabase-service.ts` in client components

## Architecture

```
src/
  lib/
    articles.ts         — public reads (anon key, RLS)
    bot-detection.ts    — classify user-agent → BotFamily
    canonical.ts        — canonical URL builders
    ip-hash.ts          — salted SHA-256 hash (never store raw IP)
    json-ld.ts          — Article JSON-LD schema
    log-event.ts        — server-side request logging
    metadata.ts         — Next.js Metadata helpers
    supabase-anon.ts    — public read client
    supabase-service.ts — service-role client (server only)
  app/
    page.tsx              /  landing
    insights/page.tsx     /insights  article index
    insights/[slug]/      /insights/:slug  full article
    t/[slug]/             /t/:slug  teaser (summary only)
    c/[category]/         /c/:category  category listing
    agent-read/[slug]/    /agent-read/:slug  JSON browser view
    api/
      agent-read/[slug]/  pure JSON for agents
      search/             GET ?q= search
      admin/
        articles/         POST create, PATCH/DELETE by id
        bulk-upload/      POST JSON array
        log-event/        POST internal attribution log
    admin/
      page.tsx            overview
      dashboard/          attribution dashboard
      articles/           article list + editor
      upload/             bulk JSON upload
    sitemap.ts  robots.ts  llms.txt/
```

## Running locally
```bash
cp .env.local.example .env.local
# fill in your Supabase and salt values
npm install
npm run dev
```

## Tests
```bash
npm test
```
Tests live in `src/__tests__/`. They cover:
- Bot detection (all 12 families)
- IP hashing (never stores raw IP, deterministic, salt-sensitive)
- Route contracts (canonical URLs, JSON-LD shape, teaser exclusion, unpublished exclusion)

E2E tests with Playwright are a **Codex follow-up item**.

## Codex review checklist
- [ ] Admin routes need auth (currently unprotected — add Supabase Auth or Basic Auth)
- [ ] `middleware.ts` fire-and-forget fetch may drop events at high load — consider Vercel Edge `waitUntil`
- [ ] `full_body` is stored as raw HTML — sanitize on insert
- [ ] Add rate limiting to `/api/search` and `/api/admin/*`
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is not bundled client-side (verify with `next build --debug`)
- [ ] Add Playwright E2E: `curl /insights/slug | grep "article text"` → exit 0
- [ ] Add Playwright E2E: `curl /t/slug | grep "full body text"` → exit 1
