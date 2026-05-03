# Signal.lab Build Brief

## Role Split

- Claude Code is the primary builder on `feature/claude-build-*`.
- Codex reviews, hardens, debugs, and applies only minimal corrective patches on `review/codex-*`.
- No agent commits directly to `main`.

## Product Goal

Turn expert articles into crawlable, attributable, machine-readable knowledge nodes that search engines and LLM agents can discover, retrieve, quote, and cite.

## Current Repo State

- The repo is a starter Next.js 16 App Router app.
- Supabase packages are already installed.
- `src/middleware.ts` exists but currently logs raw IPs and only handles a narrow set of paths.
- Public content routes, admin UI, search API, `llms.txt`, sitemap generation, and proper crawler-facing metadata are not implemented yet.

## Non-Negotiable Requirements

### Platform constraints

- Use Next.js App Router with TypeScript.
- Keep public content server-rendered.
- Do not ship public content behind a client-only SPA.
- Full article text must be present in initial HTML source.
- Public pages must have unique `title`, `description`, and canonical URL metadata.
- Article pages must include Article JSON-LD.

### Required public routes

- `/`
- `/insights`
- `/insights/[slug]`
- `/t/[slug]`
- `/c/[category]`
- `/agent-read/[slug]`
- `/api/search?q=...`
- `/sitemap.xml`
- `/robots.txt`
- `/llms.txt`

### Attribution requirements

- Log a request event for:
  - `/insights`
  - `/insights/[slug]`
  - `/t/[slug]`
  - `/c/[category]`
  - `/agent-read/[slug]`
  - `/api/search`
- Never store raw IPs.
- Store only a salted hash using `ATTRIBUTION_SALT`.
- Bot families must classify:
  - `GPTBot`
  - `OAI-SearchBot`
  - `ChatGPT-User`
  - `Googlebot`
  - `Google-InspectionTool`
  - `CCBot`
  - `PerplexityBot`
  - `ClaudeBot`
  - `anthropic-ai`
  - `Bingbot`
  - `Applebot`
  - `unknown`

## Recommended Technical Shape

### Rendering

- Use server components for public pages.
- Mark public content routes dynamic if needed so per-request attribution always executes.
- Avoid client components for article rendering unless strictly presentational.

### Middleware strategy

- Keep using `src/middleware.ts` if Edge-style request preprocessing is required for attribution.
- Replace the current raw-IP logging logic.
- Middleware should normalize request metadata:
  - path
  - query params
  - user agent
  - bot family
  - salted IP hash
- Actual route-level logging should happen in server code before returning the response so the correct route type, slug/category, and status code are persisted.

### Data access

- Use server-side Supabase access for all article reads and request-event writes.
- Never expose the service role key to the client.
- Admin writes should stay server-side.
- If local/dev schema is missing, prefer a graceful fallback for public reads so routes still render during development.

### Admin

- Add an internal admin area for:
  - article list
  - article editor
  - bulk JSON upload
  - publish/unpublish
  - attribution dashboard
- Use Supabase Auth only if needed for admin protection.
- Public routes must remain fully accessible without auth.

## Schema Contract

### `articles`

- `id`
- `slug`
- `headline`
- `summary`
- `full_body`
- `category`
- `tags`
- `claim`
- `evidence_source`
- `author_name`
- `author_email`
- `company`
- `role`
- `cta_label`
- `cta_url`
- `canonical_url`
- `published_at`
- `updated_at`
- `status`

### `request_events`

- `id`
- `created_at`
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

## Search/API Notes

- `GET /api/search?q=` returns matching articles with:
  - `headline`
  - `summary`
  - `slug`
  - `category`
  - `canonical_url`
- Search requests must also be logged.
- `/agent-read/[slug]` returns clean JSON only.
- `llms.txt` should point agents to the most useful URLs and APIs.

## Suggested Build Order

1. Replace starter layout/styles with the real information architecture.
2. Add typed article/request-event models and server-side data helpers.
3. Implement public routes and shared metadata/canonical helpers.
4. Implement JSON-LD and machine-readable routes/assets.
5. Add attribution preprocessing and request-event logging.
6. Add admin views and publish/edit/import flows.
7. Add tests for route behavior, metadata, and logging helpers.

## Definition of Done

- All required public routes exist and return real content.
- `View Source` on article pages contains the article body text.
- Search and agent-read responses are machine-friendly and route-specific.
- Attribution logging records route type, slug/category, bot family, hashed IP, and status code.
- No public route falls back to a generic SPA shell.
- Tests cover the success criteria from the project brief.
