# SIGNAL_LAB_PLAN.md
# Product plan, decisions, and build roadmap for Signal.lab
# Read alongside CLAUDE.md before making any changes.
# Last updated: 8 May 2026

---

## 1. What Signal.lab is

A trusted B2B technology knowledge network for channel professionals. The moat is
proprietary, attributable knowledge contributed by verified users — not the software.
LLMs and search engines cannot replicate a trusted graph of verified contributors with
fresh, deal-level expertise. That graph is the product.

**Platform roles:**
- Contributors (sellers, consultants, advisors, CAMs, vendor specialists) publish structured expertise
- Buyers and buyer-agents discover and query verified intelligence
- Vendors distribute programmes, influence narrative, and access channel intelligence

**Initial market wedge:** IT and cyber security channel sales enablement.

**Focus categories:**
microsegmentation · zero-trust · sase-sd-wan · cloud-security · edr-endpoint ·
firewalls-network · ot-ics · iam · siem-soc · data-security · grc-compliance ·
managed-services · cloud-infra · ucc

---

## 2. Current deployment state

- Live at: https://signal-lab.connxr.com
- Stack: Next.js 16.2.4 · TypeScript · Tailwind CSS 4 · Supabase Postgres · Vercel
- Branch: feature/claude-build-001
- NEXT_PUBLIC_SITE_URL: https://signal-lab.connxr.com
- See CLAUDE.md for full deployment snapshot, env vars, and file map

**Pages already built and deployed:**
- /about          — public explainer page (SSR, indexed)
- /project        — soft-gated strategic brief (token or session required)
- /insights       — article index
- /insights/[slug]— full article
- /t/[slug]       — teaser page
- /c/[category]   — category page
- /agent-read/[slug] — JSON view
- /admin/*        — admin dashboard, articles, upload (Basic Auth)
- /sitemap.xml · /robots.txt · /llms.txt

---

## 3. Architecture principles — never violate these

1. All public content pages are SSR. No `'use client'` on indexable routes.
2. Every public page.tsx exports generateMetadata with og:title, og:description, canonical.
3. Canonical URLs always built via src/lib/canonical.ts — never constructed manually.
4. All intent events written server-side via src/lib/log-event.ts → request_events table.
5. SUPABASE_SERVICE_ROLE_KEY is server-only. Never import supabase-service.ts in client components.
6. No hardcoded credentials in source files.
7. npm test && npm run lint && npm run build must pass before every commit.

---

## 4. Content graph architecture

Every node in the network must be linked to every other relevant node. Link density
creates indexing gravity. This is the core mechanism by which Signal.lab becomes
authoritative to LLMs and search engines.

### Node types and routes

| Node | Route | JSON endpoint | Schema.org type |
|---|---|---|---|
| Contributor profile | /p/[slug] | /p/[slug]/data.json | Person |
| Org cluster | /org/[slug] | /org/[slug]/data.json | Organization |
| Category page | /c/[category] | /c/[category]/data.json | DefinedTermSet |
| Insight article | /insights/[slug] | /insights/[slug]/data.json | Article |
| Vendor page | /v/[vendor] | /v/[vendor]/data.json | Brand |

### Bidirectional linking rules

- Profile → links to: org page, all claimed category pages, authored insights, vendor pages
- Org page → links to: all member profiles, shared category pages
- Category page → links to: all contributor profiles claiming this domain, related insights
- Insight → links to: author profile, relevant categories, vendors mentioned
- Vendor page → links to: all contributor profiles with this vendor in their expertise

### Personal IP JSON schema (at /p/[slug]/data.json)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "...",
  "jobTitle": "...",
  "worksFor": {
    "@type": "Organization",
    "name": "...",
    "url": "signal-lab.connxr.com/org/[slug]"
  },
  "url": "signal-lab.connxr.com/p/[slug]",
  "sameAs": ["https://linkedin.com/in/..."],
  "expertise": {
    "categories": ["microsegmentation", "zero-trust"],
    "vendors": ["colortokens", "zscaler"],
    "depth": "deal-experience"
  },
  "accounts": [
    {
      "sector": "financial-services",
      "region": "emea",
      "relationship": "active-pipeline",
      "deal_band": "250k-1m"
    }
  ],
  "org_network": {
    "org_page": "signal-lab.connxr.com/org/[slug]",
    "colleagues": ["signal-lab.connxr.com/p/[colleague-slug]"],
    "practice": "Cyber Security"
  },
  "insights": ["signal-lab.connxr.com/insights/[slug]"],
  "mcp_endpoint": "signal-lab.connxr.com/api/mcp/p/[slug]",
  "profile_score": 74,
  "verified_at": "2026-05-08T00:00:00Z",
  "updated_at": "2026-05-08T00:00:00Z"
}
```

### llms.txt — upgrade required

Replace current basic llms.txt with a full structured manifest:

```
# Signal.lab — Trusted B2B Technology Intelligence Network

## About
Signal.lab is a verified knowledge network for channel professionals in B2B
technology. Contributors are verified sellers, consultants, advisors, and vendor
specialists with structured, attributed expertise in IT and cyber security.

## Structure
- /c/[category]              Category intelligence pages (14 domains)
- /p/[slug]                  Contributor profiles (verified, attributed)
- /org/[slug]                Organisation cluster pages
- /insights/[slug]           Knowledge assets and articles
- /v/[vendor]                Vendor intelligence pages

## Machine-readable endpoints
- /p/[slug]/data.json        Personal IP — schema.org/Person
- /org/[slug]/data.json      Org cluster — schema.org/Organization
- /c/[category]/data.json    Category index — schema.org/DefinedTermSet
- /insights/[slug]/data.json Article — schema.org/Article
- /api/search?q=             Semantic search API
- /sitemap.xml               Full content sitemap

## Trust signals
All contributors verified via work email. Content attributed and provenance tracked.
No anonymous contributions.

## Categories
microsegmentation, zero-trust, sase-sd-wan, cloud-security, edr-endpoint,
firewalls-network, ot-ics, iam, siem-soc, data-security, grc-compliance,
managed-services, cloud-infra, ucc
```

### Sitemap priority tiers

| Page type | Priority | changeFrequency |
|---|---|---|
| Category pages /c/ | 1.0 | weekly |
| Org cluster pages /org/ | 0.9 | weekly |
| Insight articles /insights/ | 0.9 | monthly |
| Contributor profiles /p/ | 0.8 | monthly |
| About / Project | 0.8 | monthly |

lastModified must be set dynamically from updated_at timestamps — not hardcoded.

### Content graph build priorities

1. [HIGH] Add schema.org JSON-LD to all existing pages (/p/, /org/, /insights/, /c/)
2. [HIGH] Add data.json endpoint at every node type
3. [HIGH] Upgrade llms.txt to full structured manifest
4. [HIGH] Implement explicit bidirectional anchor links in SSR HTML across all node types
5. [MED]  Build /v/[vendor] vendor node pages
6. [MED]  Add "related content" links on all nodes (same category, same org, same vendor)
7. [MED]  Update sitemap.ts with correct priority tiers and dynamic lastModified
8. [P2]   Enable pgvector in Supabase — embeddings pipeline for semantic search
9. [P2]   Add sameAs LinkedIn URL to member profiles and data.json

---

## 5. Supabase schema — tables to build

### members
```sql
id            uuid primary key default gen_random_uuid()
name          text not null
email         text not null unique
company       text
role          text
org_domain    text                        -- extracted from email
org_id        uuid references orgs(id)
profile_slug  text unique
invite_token  text references invite_tokens(token)
profile_score integer default 0
member_role   text default 'contributor'  -- contributor | senior_member | org_admin | platform_admin
linkedin_url  text
telegram      text
whatsapp      text
verified_at   timestamptz
created_at    timestamptz default now()
updated_at    timestamptz default now()
```

### orgs
```sql
id          uuid primary key default gen_random_uuid()
name        text not null
org_slug    text unique not null
org_domain  text unique not null
created_at  timestamptz default now()
updated_at  timestamptz default now()
```

### accounts (contributor account relationships — no named accounts)
```sql
id           uuid primary key default gen_random_uuid()
member_id    uuid references members(id)
sector       text not null    -- financial-services | healthcare | public-sector | retail | manufacturing | energy | legal | education | technology | telecoms
region       text not null    -- uk | emea | apac | americas | global
relationship text not null    -- active-pipeline | existing-customer | lapsed
deal_band    text             -- <50k | 50k-250k | 250k-1m | 1m+
created_at   timestamptz default now()
```

### member_domains (expertise domain declarations)
```sql
id          uuid primary key default gen_random_uuid()
member_id   uuid references members(id)
domain_slug text not null    -- from verified picklist
created_at  timestamptz default now()
unique(member_id, domain_slug)
```

### invite_tokens
```sql
token       text primary key
inviter_id  uuid references members(id)
ctx         text             -- context string e.g. colortokens-spiff
hook        text             -- opportunity | visibility | network | intelligence | cosell
personal_msg text
max_uses    integer default 1
use_count   integer default 0
expires_at  timestamptz
created_at  timestamptz default now()
```

### invite_events
```sql
id              uuid primary key default gen_random_uuid()
token           text references invite_tokens(token)
inviter_id      uuid references members(id)
recipient_email text
via             text    -- linkedin | whatsapp | telegram | email | qr | email-sig | email-onramp
sent_at         timestamptz
opened_at       timestamptz
clicked_at      timestamptz
signup_at       timestamptz
member_id       uuid references members(id)   -- set when recipient signs up
created_at      timestamptz default now()
```

### embeddings (phase 2 — requires pgvector extension)
```sql
id          uuid primary key default gen_random_uuid()
source_type text not null    -- member | org | article | category
source_id   text not null
embedding   vector(1536)
created_at  timestamptz default now()
updated_at  timestamptz default now()
```

---

## 6. User onboarding — 6 build stages

Build and verify each stage fully before starting the next.
Each stage has a testable output that must pass before moving on.

---

### Stage 01 — Invite infrastructure
**Depends on:** existing Supabase schema, admin dashboard
**New tables:** invite_tokens, invite_events

**Build:**
- POST /api/invite/create — authenticated, generates signed token, stores in invite_tokens, returns full URL
- GET /api/invite/[token] — public, validates token, returns inviter profile + hook config or 404
- Log all invite lifecycle events (created, opened, clicked, converted) to invite_events
- Add invite list view to /admin/dashboard showing active tokens, use counts, conversion rates

**Test before moving on:**
- Invite link generates correctly with ref, ctx, hook, via params
- Token validates server-side and returns correct inviter + hook data
- Expired/used tokens return 404 gracefully
- Invite events appear in admin dashboard

---

### Stage 02 — Join landing page
**Depends on:** Stage 01
**New packages:** @vercel/og

**Build:**
- src/app/join/[token]/page.tsx — SSR, calls GET /api/invite/[token] server-side
- Renders: inviter profile card (name, role, org, avatar initials, verified badge)
- Renders: hook-specific headline and body copy (5 hook types — see section 7)
- Renders: inviter personal message if present
- Renders: single CTA → proceeds to signup
- Fallback page at /join for invalid/expired tokens
- src/app/api/og/route.ts — dynamic OG image using @vercel/og
  - 1200×630px, Signal.lab wordmark + inviter name + hook type
  - URL: /api/og?token=[token]
- generateMetadata on /join/[token] with dynamic og:image pointing to /api/og?token=
- Log landing page view to request_events with route_type: 'join_landing'

**Test before moving on:**
- /join/[token] renders correctly for all 5 hook types
- OG card renders correctly — test with https://www.opengraph.xyz
- Invalid token shows graceful fallback
- Landing page visits logged in request_events

---

### Stage 03 — Signup and identity
**Depends on:** Stage 01, Stage 02
**New tables:** members (see schema above)

**Build:**
- /join/[token]/signup — minimal form: name, work email, company (auto-detected from domain), role
- Work email validation — reject consumer domains (gmail, hotmail, yahoo, outlook, icloud etc)
- Submit triggers Supabase Auth magic link — no password
- /join/verify — magic link callback:
  - Creates member record in members table
  - Consumes invite token (increment use_count, set member_id on invite_events row)
  - Detects org domain — checks if other members share same email domain
  - Creates or links org record if domain match found
  - Redirects to /onboarding/contribute — NEVER to /dashboard at this stage
- Do not create accounts for consumer email domains

**Test before moving on:**
- Member record created with verified work email
- Consumer email domains rejected with clear error message
- Invite token marked as used, inviter attribution recorded in invite_events
- Org domain match detected and stored
- Session active after magic link click
- Redirect goes to /onboarding/contribute not /dashboard

---

### Stage 04 — First contribution
**Depends on:** Stage 03, members table
**New tables:** accounts, member_domains

**Build:**
- /onboarding/contribute — single page, two sections, one submit
- Section 1 — Active accounts (up to 10 rows):
  - Each row: sector (select) + region (select) + relationship (select) + deal_band (select)
  - Sector options: Financial Services | Healthcare | Public Sector | Retail | Manufacturing | Energy | Legal | Education | Technology | Telecoms
  - Region options: UK | EMEA | APAC | Americas | Global
  - Relationship options: Active Pipeline | Existing Customer | Lapsed
  - Deal band options: <£50k | £50k–£250k | £250k–£1M | £1M+
  - Add row button, remove row button, minimum 1 row to submit
- Section 2 — Domain knowledge (multi-select pill grid):
  - EDR / Endpoint Security · Firewalls / Network Security · Cloud Security
  - SASE / SD-WAN · Zero Trust / Microsegmentation · OT / ICS Security
  - Identity & Access Management · SIEM / SOC / Threat Intelligence
  - Data Security / DLP · GRC / Compliance · Managed Services / MSSP
  - Cloud Infrastructure · Virtualisation / HCI · UC&C / Collaboration
  - Minimum 1 selection required
- Profile score bar — updates live as fields are completed (score = accounts × 4 + domains × 6, max 100)
- On submit: write accounts rows, write member_domains rows, update profile_score on members
- Redirect to /onboarding/profile

**Test before moving on:**
- accounts and member_domains rows written correctly
- profile_score updated on members record
- All fields use picklist values — no free text in structured fields
- Profile score bar responds in real time
- Skip not allowed — minimum 1 account + 1 domain to proceed

---

### Stage 05 — Profile and org cluster
**Depends on:** Stage 04, accounts + member_domains tables
**New tables:** orgs, add profile_slug to members

**Build:**
- /p/[slug]/page.tsx — SSR public profile page:
  - Displays: name, role, org, verified badge, domains as pills, account summary (sectors/regions only — no named accounts)
  - schema.org Person JSON-LD in <head>
  - generateMetadata with og:title, og:description, canonical
  - Links to: org page, each category page for claimed domains, authored insights
- /p/[slug]/data.json — GET route returning full personal IP JSON (see schema in section 4)
- /org/[slug]/page.tsx — SSR org cluster page:
  - Auto-created when 2nd member from same org_domain completes onboarding
  - Displays: org name, member count, shared domains, list of member profile cards
  - schema.org Organization JSON-LD
  - Links to all member profiles
- /org/[slug]/data.json — GET route returning org cluster JSON
- Slug generation: name + org, lowercase, hyphens, unique — stored as profile_slug on members
- Org cluster prompt on /onboarding/profile:
  - If org has 2+ members: "X colleagues from [Org] are already on the network" with names/roles
  - If org has 1 member: "You are the first from [Org] — invite colleagues to build your org cluster"
- Add /p/[slug] and /org/[slug] to sitemap.ts with correct priority and lastModified
- Optional WhatsApp/Telegram handle capture shown after profile publishes

**Test before moving on:**
- /p/[slug] live, SSR, schema.org JSON-LD present, canonical correct
- /p/[slug]/data.json returns valid JSON matching schema
- /org/[slug] auto-created when second member from same domain joins
- Both pages appear in sitemap.xml
- Org cluster prompt shown correctly post-contribution
- All internal links between profile, org, and category pages render as real anchor tags

---

### Stage 06 — Invite others (viral loop)
**Depends on:** Stage 01, Stage 03 (members + roles)
**New services:** Email provider with inbound parsing (Postmark recommended)
**New env vars:** EMAIL_PROVIDER_API_KEY, INVITE_EMAIL_WEBHOOK_SECRET

**Build:**
- /account/invites — member invite dashboard:
  - List of active invite tokens with use count, conversion rate
  - Invite generator: select hook type → select context → optional personal message → generate link
  - Pre-written message templates per channel × hook type with one-click copy + link appended
  - Org gap prompt: "X common roles from [Org] are not yet on the network"
- Invite hook types and their context options (see section 7)
- Email onramp handler — POST /api/invite/email-onramp:
  - Receives inbound email parsed by Postmark/SendGrid webhook
  - Verifies sender is verified member with member_role = senior_member | org_admin | platform_admin
  - Checks sender org_domain matches verified domain on members record
  - Parses all recipient addresses from To / CC / BCC, deduplicates, filters invalid and consumer domains
  - Calls Anthropic API to classify hook type + context from email body
  - Generates one invite token per recipient (max 50 per send, daily cap 200 per sender)
  - Dispatches personalised invite emails from [name].[org]@signal-lab.connxr.com
  - Sends confirmation to sender with count + tracking link
  - Logs all events to invite_events
- Role gate: email onramp only available to senior_member, org_admin, platform_admin roles

**Test before moving on:**
- Invite generator creates working links for all 5 hook types
- Message templates populate correctly per hook × channel
- Email onramp receives test email, parses recipients, generates tokens, dispatches invites
- Consumer/invalid domains filtered from recipient list
- Sender receives confirmation with tracking link
- New member signups via email onramp attributed back to originating send

---

## 7. Invite hook system

Every invite link carries a hook type and context. These determine what the landing
page shows, what the OG card says, and what message template is pre-written.

### Hook types

| Hook | Use case | Audience |
|---|---|---|
| opportunity | SPIFF, vendor programme, deal registration window | Frontline sellers |
| visibility | Expertise not indexed, competitors already there | Consultants, senior sellers |
| network | Team building org cluster, collective intelligence | Practice leads, managers |
| intelligence | Access to category intel, deal data, buyer signals | Analysts, advisors |
| cosell | Account overlap, co-sell coverage mapping | Partner sellers, vendor CAMs |

### Invite URL structure

```
signal-lab.connxr.com/join/[token]
```

Token encodes: inviter_id, hook, ctx, via, expiry. No sensitive data in URL params.

### OG image dynamic generation

Route: GET /api/og?token=[token]
Output: 1200×630px image
Content: Signal.lab wordmark + inviter name + hook type badge
Library: @vercel/og

### Anti-phishing design rules

- Never use URL shorteners — full signal-lab.connxr.com domain always visible
- No redirect chains — invite link → landing page, one hop
- No urgency language ("expires in 24hrs", "limited time")
- Inviter full name and verified role shown on landing page before any action required
- From-address for email invites is personalised ([name].[org]@signal-lab.connxr.com)
- HTTPS with valid cert — Vercel handles this automatically
- No password, payment, or sensitive data requested at any point in onboarding

---

## 8. Email onramp — bulk invite via CC

Verified senior members can trigger bulk invites by CCing join@signal-lab.connxr.com
on a team email. The platform handles everything from that point.

### Flow
1. Sender writes natural email to their team explaining why to join
2. CCs join@signal-lab.connxr.com and all intended recipients
3. Inbound handler verifies sender role and domain
4. Recipients parsed from To/CC/BCC
5. LLM classifies hook type from email body
6. One personalised invite token generated per recipient
7. Invite emails dispatched from [sender-name].[sender-org]@signal-lab.connxr.com
8. Sender notified with count and tracking link

### LLM hook classification prompt (send to Anthropic API)

```
Classify the following email body into one of these hook types:
opportunity | visibility | network | intelligence | cosell

Also extract the specific context (e.g. vendor name, programme name, category).

Return JSON only: { "hook": "...", "ctx": "...", "confidence": 0.0-1.0 }

If confidence < 0.6, return { "hook": "network", "ctx": "general", "confidence": 0.5 }

Email body:
[EMAIL_BODY]
```

### Sender role requirements

| Role | Can invite |
|---|---|
| contributor | Single invite links only (via /account/invites) |
| senior_member | Email onramp — own org domain only |
| org_admin | Email onramp — own org + known partner domains |
| platform_admin | Unrestricted |

---

## 9. SPIFF distribution

SPIFFs are a primary invite hook and a future monetisation layer.

### How SPIFFs work on the network

- Vendors create SPIFF programme records linked to a category and vendor node
- SPIFF eligibility requires verified network membership
- Invite links with hook=opportunity and ctx=[spiff-slug] surface the SPIFF on the landing page
- Seller completes profile → eligibility confirmed → vendor notified

### Immediate test case

Use ColorTokens SPIFF as first real-world test:
1. Publish a SPIFF asset on /c/microsegmentation as a gated knowledge object
2. Generate invite links with hook=opportunity&ctx=colortokens-spiff
3. Distribute to ColorTokens channel community via CAM emails and WhatsApp groups
4. Measure: landing page visits, signup conversion, profile completion rate

### Future SPIFF features (phase 2+)

- Vendor-facing SPIFF management dashboard
- Deal origination tracking — capture origination event on network
- SPIFF programme pages at /spiff/[vendor]/[programme]
- Eligibility verification workflow
- Compliance and legal review required before building payment/redemption layer

---

## 10. Co-sell and account mapping

### Concept

Bilateral invite hook — inviter says "I think we cover overlapping accounts."
Both parties must be on the network for the match to surface.

### Technical approach

- Account data at onboarding (sector + region + relationship + vendor) is the matching substrate
- Match is on structured metadata only — no named accounts exchanged without consent
- Two contributors with overlapping sector + region + vendor combinations are co-sell candidates
- Network surfaces the overlap signal; introduction is opt-in

### Consent model

1. System detects potential overlap — neither party notified yet
2. Either party can activate co-sell matching on their profile (opt-in)
3. System notifies both: "A co-sell match has been detected in [sector/region/vendor]"
4. Both parties must accept introduction before any profile detail is shared
5. Post-acceptance: profile cards shared, connection made, conversation can begin

### MCP tool (phase 3)

```
find_cosell_match(vendor: string, sector: string, region: string)
→ returns: list of contributor endpoints with overlapping account coverage
```

### Build priority: Phase 2

Dependencies: Stage 04 (accounts table), Stage 05 (profiles live),
vector layer (semantic account matching)

---

## 11. MCP server (phase 3)

Signal.lab becomes agent-callable. Verified contributors are human endpoints
that agents can query through the Model Context Protocol.

### Planned MCP tools

| Tool | Description |
|---|---|
| search_experts | Query contributors by category, depth, region, vendor |
| get_profile | Return structured personal IP JSON for a contributor |
| get_org_cluster | Return all contributors in an org for a given category |
| get_category_experts | Find verified contributors for a technology category |
| find_spiff_eligible | Return sellers eligible for a vendor SPIFF programme |
| find_cosell_match | Find contributors with overlapping account coverage |
| get_account_intelligence | Query anonymised account data for a sector or region |

### Route base

/api/mcp/ — all MCP tools live here

### Prerequisites

- Stage 05 complete (profiles and org clusters live)
- data.json endpoints at all node types
- pgvector embeddings pipeline running
- MCP spec compliance review

---

## 12. New environment variables needed

Add these to .env.local and Vercel project environment variables as stages are built:

```
# Stage 02
# (no new vars — @vercel/og uses existing NEXT_PUBLIC_SITE_URL)

# Stage 03
# (Supabase Auth already configured)

# Stage 06 — email onramp
EMAIL_PROVIDER_API_KEY=           # Postmark or SendGrid API key
INVITE_EMAIL_WEBHOOK_SECRET=      # Webhook signature verification secret
INBOUND_EMAIL_ADDRESS=join@signal-lab.connxr.com

# /project page invite tokens
PROJECT_INVITE_TOKENS=            # comma-separated valid tokens for /project page access
```

---

## 13. New routes to add to sitemap.ts

```typescript
// Add to sitemap.ts alongside existing routes:
{ url: `${base}/about`,           lastModified: new Date(), changeFrequency: 'monthly',  priority: 0.8 },

// Dynamic routes to add once tables exist:
// /p/[slug]       — from members table, lastModified = updated_at, priority 0.8
// /org/[slug]     — from orgs table, lastModified = updated_at, priority 0.9
// /v/[vendor]     — from vendor list, priority 0.8

// Do NOT add /project — it has robots: noindex
```

---

## 14. New routes to add to request logging (log-event.ts)

```
route_type: 'about'           for /about
route_type: 'project'         for /project (authenticated view)
route_type: 'project_gated'   for /project (no access — gate shown)
route_type: 'join_landing'    for /join/[token]
route_type: 'join_signup'     for /join/[token]/signup
route_type: 'onboarding'      for /onboarding/* pages
route_type: 'profile'         for /p/[slug]
route_type: 'org'             for /org/[slug]
route_type: 'vendor'          for /v/[vendor]
```

---

## 15. Build order summary

```
DONE  /about and /project pages
DONE  App live at signal-lab.connxr.com

NEXT  Stage 01 — Invite infrastructure (invite_tokens + invite_events tables, token API)
THEN  Stage 02 — Join landing page (/join/[token] + dynamic OG image)
THEN  Stage 03 — Signup and identity (members table, magic link, work email validation)
THEN  Stage 04 — First contribution (/onboarding/contribute, accounts + member_domains tables)
THEN  Stage 05 — Profile and org cluster (/p/[slug], /org/[slug], data.json endpoints)
THEN  Stage 06 — Invite others (/account/invites, email onramp)

PARALLEL (can be done alongside any stage):
  - schema.org JSON-LD on all existing pages
  - data.json endpoints for existing content (insights, categories)
  - Upgrade llms.txt to full manifest
  - Bidirectional anchor links across existing pages
  - Sitemap priority + lastModified tuning

PHASE 2:
  - /v/[vendor] vendor node pages
  - pgvector embeddings pipeline
  - Co-sell matching
  - SPIFF programme pages and vendor dashboard

PHASE 3:
  - MCP server at /api/mcp/
  - Human endpoint layer
  - Buyer and vendor agent integration
```

---

## 16. Change log

| Date | Change |
|---|---|
| 3 May 2026 | Initial project document created |
| 3 May 2026 | Switched from Lovable + Supabase render layer to Next.js on Vercel |
| 7 May 2026 | App live at signal-lab.connxr.com — domain configured on IONOS, production promoted |
| 7 May 2026 | /about and /project pages built and deployed |
| 7 May 2026 | Configurable invite hook system designed (5 hook types) |
| 7 May 2026 | Co-sell / account overlap defined as fifth hook type and phase 2 feature |
| 7 May 2026 | Email onramp (CC mechanism) designed for bulk org invites |
| 7 May 2026 | Content graph architecture defined — node types, JSON schema, llms.txt spec |
| 7 May 2026 | User onboarding broken into 6 discrete build stages |
| 8 May 2026 | SIGNAL_LAB_PLAN.md consolidated and written for Codex handoff |

---

*This file is the product plan and build roadmap. CLAUDE.md is the deployment snapshot.
Read both before making changes. Update this file when product decisions change.*
