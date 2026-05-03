# Codex Review Checklist

## Review Role

- Review Claude's implementation branch against the product brief.
- Prioritize bugs, regressions, crawler visibility failures, security issues, and missing tests.
- Make only minimal hardening patches.

## Mandatory Checks

### Public routing

- `/` links to crawlable public destinations.
- `/insights` shows all published articles only.
- `/insights/[slug]` renders exactly one full article.
- `/t/[slug]` exposes teaser-only content.
- `/c/[category]` filters by category only.
- `/agent-read/[slug]` returns JSON only.
- `/api/search?q=` returns matching article summaries.
- `/llms.txt`, `/robots.txt`, and `/sitemap.xml` are present and correct.

### Rendering and SEO

- Public article/category/teaser pages return HTML on first request.
- Article body text appears in initial HTML source.
- No client-only data fetch is required to see article content.
- Every public route has a unique `title`, `description`, and canonical URL.
- Article pages include valid Article JSON-LD.

### Attribution and analytics

- Public route logs include:
  - `route_type`
  - `path`
  - `slug` or `category`
  - `bot_family`
  - `query_params`
  - `status_code`
- Raw IPs are never stored anywhere.
- `ip_hash` is salted and deterministic for the same IP+salt.
- Bot detection covers every required family and falls back to `unknown`.

### Security

- `SUPABASE_SERVICE_ROLE_KEY` is used server-side only.
- No admin mutation is available without server-side authorization.
- Public content access does not require auth.
- Request logging failure does not leak secrets or crash public routes.

### Data integrity

- Draft/unpublished content does not leak into public listings.
- Category and slug filters do not over-return content.
- Search results do not include unpublished content.
- Agent-read payload contains the required fields only.

### Testing

- Automated tests cover route contracts, bot detection, IP hashing, and metadata helpers.
- At least one test verifies article text is rendered server-side.
- At least one test verifies teaser pages omit full article body text.

## Expected Output From Review

- Findings first, ordered by severity.
- Open questions or assumptions second.
- Short change summary only after the findings.
