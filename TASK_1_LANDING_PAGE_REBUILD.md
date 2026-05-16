# Task 1 — Landing page rebuild
**Repo:** `https://github.com/dkfinkbone/signal.lab.git`
**Branch:** cut from `feature/claude-build-001` → new branch `feature/landing-page-rebuild`
**Date issued:** 2026-05-16

---

## Context and goal

Signal.lab is a trust graph for agentic business processes. The current homepage
(`src/app/page.tsx`) reads as a machine-optimised site brief. It performs well for
LLM discoverability but does not land emotionally or commercially for human visitors.

This task replaces the homepage with a high-impact landing page that communicates
the core positioning:

> Agents generate possibilities. Trusted networks execute reality.

The `/about` page content is absorbed into the new homepage structure. The `/about`
route itself is kept but can redirect to `/` or be simplified to a short
organisational description — Codex should not delete it.

**Critical constraint:** Nothing that is currently working for LLM discoverability
is broken. JSON-LD, OG tags, sitemap, llms.txt, robots.txt, and the `/api/search`
endpoint are all preserved and updated to reflect the new positioning copy.

---

## Rendering rules — read this first

The repo uses Next.js App Router (Next 14+). All new section components must be
**React Server Components by default.** Do not add `'use client'` to any component
unless it handles browser-only behaviour (animation, hover, scroll events).

The pattern for animated sections:

```
ServerComponent.tsx        — renders meaningful HTML (headings, paragraphs, lists)
  └── ClientWrapper.tsx    — 'use client', receives data as props, handles animation only
```

LLM crawlers and search engines do not execute JavaScript. All copy, headings,
and structured content must be present in the server-rendered HTML. Animation
layers are decorative and may be client-side. Data never originates in a client
component.

---

## File structure

New files to create:

```
src/
  app/
    page.tsx                          ← rebuilt (server component)
  components/
    landing/
      HeroSection.tsx                 ← server component
      HeroGraphic.tsx                 ← 'use client' animation wrapper
      TrustStackSection.tsx           ← server component
      TrustStackGraphic.tsx           ← 'use client' animation wrapper
      AudienceLanes.tsx               ← server component
      VendorGraphic.tsx               ← 'use client' animation wrapper
      BuyerGraphic.tsx                ← 'use client' animation wrapper
      InsightsFeed.tsx                ← server component (reuses existing data fetch)
      FooterCTA.tsx                   ← server component
```

Existing files to update:

```
src/app/page.tsx                      ← full rebuild
src/lib/metadata.ts                   ← update title, description, OG copy
src/lib/json-ld.ts                    ← update WebSite and Organization descriptions
src/app/about/page.tsx                ← simplify or redirect (do not delete)
```

Do not touch anything outside this list without flagging it first.

---

## Section specifications

### Section 1 — Hero (`HeroSection.tsx`)

**Layout:** Three columns, equal width, dark field background (`#0e0d0c`).

**Left column — Agentic process**

Label (small caps, muted): `Agentic process`

Show a monospace code block representing an agent executing a business process
query. Example:

```
agent.run(
  "identify Zero Trust specialists
   covering FS sector, EMEA"
)
```

Below the code block, four business process types as small cards:
- Supplier research — Find verified category experts
- Due diligence — Validate expertise and proof
- Shortlisting — Rank by fit, depth, coverage
- Intro routing — Connect to the right human

**Centre column — Signal.lab trust graph**

Label (small caps, purple): `Signal.lab graph`

An animated SVG graph showing category nodes (Zero Trust, FS, EMEA, proof)
connected to a central "trust graph" node. Dashed animated lines showing
resolution. Below the graph, a monospace console output:

```
→ 3 skill files resolved
→ category: ZeroTrust · FS · EMEA
→ confidence: verified · attributed
```

The SVG animation is in `HeroGraphic.tsx` (client component). The surrounding
copy and console text are server-rendered.

**Right column — Skill file output**

Label (small caps, teal): `Skill file · human expertise`

Three stacked skill file cards in monospace JSON style, each showing:
- filename (e.g. `sarah_k.json`)
- VERIFIED badge
- key fields: role, category, depth_years, sector, contact path

Cards animate in with a staggered fade-up. Animation in `HeroGraphic.tsx`.
The card content is server-rendered HTML.

**Headline block** (above the three columns, centred):

```
Agents generate possibilities.
Trusted networks execute reality.
```

H1, `font-weight: 500`, `color: #F1EFE8`. The word "possibilities" plain.
"reality" in teal (`#1D9E75`).

Subheading (13px, muted):
```
Agentic business processes need deterministic access to verified human knowledge.
Signal.lab structures expertise so agents resolve to real people, not hallucinations.
```

Single CTA button: `Request access →` linking to `/join`.

---

### Section 2 — Trust stack (`TrustStackSection.tsx`)

**Headline:**
```
Infrastructure became code.
Workflows became code.
Now trust networks become queryable.
```

Each line renders as a separate element. The first two lines are muted
(`#5F5E5A`). The third line is full white (`#F1EFE8`) at slightly larger size.
This creates a build-up effect typographically without requiring JavaScript.

**Four-layer stack visual** (server-rendered HTML table, styled as a dark card):

| Layer | Role | Signal |
|---|---|---|
| LLMs | Generate and synthesise | answers |
| Agents | Orchestrate processes | queries |
| Signal.lab | Structure trust and expertise | skill files |
| Humans | Build consensus and execute | relationships |

Signal.lab row is highlighted (teal left border, slightly lighter background).

Below the table, a short paragraph (server-rendered):
```
The scarce asset in the AI era is not information.
It is verified expertise, trusted attribution, and relationship proximity.
That is what Signal.lab structures.
```

No animation required in this section. Pure server-rendered HTML.

---

### Section 3 — Audience lanes (`AudienceLanes.tsx`)

Two columns with a vertical divider.

**Left lane — Vendor / Seller**

Label: `Vendor and seller view`
Headline: `Your channel — in code`
Body (server-rendered):
```
Every channel partner, every verified seller, every anonymised account pattern —
structured, attributed, and queryable by the agents your buyers are already running.
```

Below the copy, the vendor channel graph visual (`VendorGraphic.tsx`, client):
- Dark field
- Vendor node at top
- Three partner org nodes below
- Eight individual seller nodes (AE, SE, CAM) below those
- Anonymised account nodes at the base
- Animated flow lines cascading down each tier

Stat bar below the graphic (server-rendered):
- 29 verified sellers mapped
- 8 account patterns surfaced
- 100% LLM-queryable, structured

CTA: `See how it works →` linking to `/project`

**Right lane — Buyer**

Label: `Buyer view`
Headline: `Deterministic expertise — on demand`
Body (server-rendered):
```
Query the graph with a problem. Get back verified contributors, structured proof
snippets, and a direct intro path — not a ranked list of generic results.
```

Below the copy, the buyer knowledge graph visual (`BuyerGraphic.tsx`, client):
- Buyer / LLM agent node on left with example query
- Signal.lab graph in centre resolving the query
- Three contributor cards fanning out on the right with JSON badges
- Proof snippet card below in coral

Stat bar below the graphic (server-rendered):
- Deterministic — named experts, not suggestions
- Attributed — every result has a real owner
- Structured — JSON endpoints, agent-ready

CTA: `Browse insights →` linking to `/insights`

---

### Section 4 — Insights feed (`InsightsFeed.tsx`)

Reuse the existing data fetch from the current homepage insights list.
Do not change the data layer.

Visual reframe only:

- Section label: `Live from the graph`
- Subheading: `Signal.lab publishes structured intelligence from verified contributors.
  Every article is attributed, categorised, and machine-readable.`
- Article cards: dark background, teal left border accent, category pill,
  contributor attribution line, date
- Show latest 4 articles maximum
- Link to `/insights` at the bottom: `Browse all insights →`

This section is fully server-rendered. No client component needed.

---

### Section 5 — Footer CTA (`FooterCTA.tsx`)

Full-width dark bar, centred content.

**Default state (cold visitor):**

Headline: `Be the next logical point of contact — for buyers and for AI.`
Subheading: `Signal.lab is invite-only during the pilot. Request access to join the graph.`
Button: `Request access →` → `/join`

**Claim state (visitor arriving with `?token=` query param):**

This component reads the `searchParams` prop passed from `page.tsx`.
If a token is present, render instead:

Headline: `Your skill file is waiting.`
Subheading: `You've been invited to claim your place in the graph.`
Button: `Claim your skill file →` → `/claim/[token]`

Note: `/claim/[token]` does not exist yet (that is Task 2). For now, link to
`/join?token=[token]` as a fallback. Task 2 will update this link.

This is a server component. The token is read from `searchParams` at render time —
no client-side JavaScript required.

---

## Metadata updates (`src/lib/metadata.ts` and `src/lib/json-ld.ts`)

Update the following values:

**Page title:** `Signal.lab — Trust networks, queryable`

**Meta description:**
`Signal.lab structures verified human expertise and trusted relationships so AI agents can make deterministic discoveries. The expertise graph for agentic business processes.`

**OG title:** `Signal.lab — Trusted networks, queryable`

**OG description:** same as meta description

**JSON-LD WebSite description:** same as meta description

**JSON-LD Organization description:**
`Signal.lab is a trust graph for agentic business processes. It structures verified human expertise, relationship proximity, and proof of execution so that AI agents and human buyers can make deterministic discoveries.`

**FAQPage entries** — update existing entries to reflect new positioning:

Q: What is Signal.lab?
A: Signal.lab is a trust graph that makes verified human expertise and professional relationships queryable by AI agents and human buyers. Contributors publish structured expertise — categories, account patterns, and proof snippets — which agents can resolve to a named, verified person with a direct contact path.

Q: Who is Signal.lab for?
A: Signal.lab is built for channel sellers, consultants, vendor specialists, and the buyers and AI agents who need to find them. It is the structured layer that sits between LLM generation and human execution.

Q: How is Signal.lab different from LinkedIn or a directory?
A: Signal.lab is not a social network or a search index. It is structured infrastructure — every contributor is a callable skill file with verified fields, machine-readable JSON, and a deterministic contact path. Agents can query it programmatically, not just humans browsing a page.

Q: How does Signal.lab prove discoverability?
A: Signal.lab exposes llms.txt, sitemap.xml, a public search API at /api/search, and structured JSON profile endpoints. Every piece of content is attributed to its contributor and indexed by search engines and LLM agents.

---

## Styling and design constraints

- Dark field throughout: background `#0e0d0c`, card surfaces `#141311` or `#0C1A16`
- Primary accent: teal `#1D9E75` (verified, active, outcomes)
- Secondary accent: purple `#534AB7` (graph, agents, queries)
- Warning accent: coral `#993C1D` / `#D85A30` (urgency, proof snippets)
- Muted text: `#5F5E5A` and `#888780`
- Borders: `#2C2C2A` default, `#1e1c1a` subtle
- Monospace font for code blocks and JSON: `font-family: monospace`
- All other text: existing site font stack
- Border radius: `8px` cards, `10–12px` larger panels, `20px` outer containers
- No drop shadows, no gradients except single-axis colour transitions on graph fills
- Animation: CSS only, `@keyframes`, `transform` and `opacity` only,
  wrapped in `@media (prefers-reduced-motion: no-preference)`

The design must work on mobile. On viewports below 768px:
- Three-column hero collapses to single column, centre graph section first
- Two-column audience lanes stack vertically, vendor above buyer
- Stat bars reflow to two columns
- All font sizes scale down one step

---

## What must not change

- `src/app/layout.tsx` — do not touch navigation or shared layout
- `/insights`, `/about`, `/project`, `/join`, `/me` routes — do not touch
- `src/lib/canonical.ts` — do not touch
- `supabase/` directory — no schema changes in this task
- All existing tests must continue to pass: `npm test`, `npm run lint`, `npm run build`
- `/api/search`, `llms.txt`, `sitemap.xml`, `robots.txt` — do not touch

---

## Acceptance criteria

- [ ] `npm test` passes 90/90
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] Homepage renders without JavaScript (curl or view-source shows all copy)
- [ ] JSON-LD present and updated in page `<head>`
- [ ] OG tags present and updated
- [ ] All five sections present and correctly ordered
- [ ] Footer CTA renders default state on cold visit
- [ ] Footer CTA renders claim state when `?token=abc` is in the URL
- [ ] Mobile layout correct at 390px viewport width
- [ ] No links to `/admin` or `/admin/dashboard` anywhere in the new components
- [ ] `/about` route still resolves (redirect or simplified page, not 404)
