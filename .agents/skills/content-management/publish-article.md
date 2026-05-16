# SKILL: publish-article.md
# Location: C:\Codex\signal-lab\.agents\skills\content-management\publish-article.md
# Version: 1.1
# Last updated: 16 May 2026
#
# PURPOSE
# Reusable skill for publishing articles to the Signal.lab application.
# Invoke this skill whenever a new article needs to be structured, validated,
# and uploaded to the platform - whether the source is a JSON package, a
# Word document, a pasted brief, or a raw HTML file.
#
# READ FIRST: CLAUDE.md and SIGNAL_LAB_PLAN.md before executing this skill.

---

## When to invoke this skill

Invoke this skill when:
- A new article JSON file is present in the repo or handoff folder
- A source document (docx, html, txt, md) has been provided for publication
- Claude has generated a bulk upload JSON package for a new article
- An existing draft article needs to be reviewed, corrected, and published

---

## Input formats accepted

This skill handles any of the following input formats:

| Format | Location | Action |
|---|---|---|
| Bulk upload JSON array | /article-handoffs/[slug].json | Validate then POST to /api/admin/bulk-upload |
| Single article JSON object | /article-handoffs/[slug].json | Wrap in array, validate, POST |
| Raw HTML file | /article-handoffs/[slug].html | Extract content, build JSON, POST |
| Word / docx file | /article-handoffs/[slug].docx | Extract text, build JSON, POST |
| Plain text or markdown | /article-handoffs/[slug].md | Convert to semantic HTML, build JSON, POST |

---

## Required JSON schema

Every article submitted to /api/admin/bulk-upload must conform to this schema.
All fields are required unless marked optional.

```json
{
  "slug":            "kebab-case-unique-identifier",
  "headline":        "Full article headline, under 100 characters",
  "summary":         "One to two sentence summary, under 300 characters",
  "full_body":       "<p>Semantic HTML only. See rules below.</p>",
  "category":        "one-of-the-14-category-slugs",
  "tags":            ["array", "of", "strings"],
  "claim":           "The single most important verifiable claim the article makes",
  "evidence_source": "Source citation for the claim",
  "author_name":     "Contributor name or Signal.lab Editorial",
  "author_email":    "author@domain.com or editorial@signal-lab.connxr.com",
  "company":         "Company name or Signal.lab",
  "role":            "Role or Editorial",
  "cta_label":       "Call to action button text",
  "cta_url":         "https://signal-lab.connxr.com/join or relevant URL",
  "status":          "draft"
}
```

---

## Editorial normalization and tone

Before validation or upload, normalize every user-visible text field:
`headline`, `summary`, `full_body`, `claim`, `evidence_source`, and `cta_label`.

### Punctuation rules

- Remove em dashes (`—`) and en dashes (`–`) from prose before upload.
- Replace them with the punctuation that matches the sentence:
  - comma for a light pause
  - colon for a setup or explanation
  - full stop for a hard break
  - parentheses only when the aside truly needs to be parenthetical
  - hyphen only for compound terms such as `zero-trust`, `end-to-end`, or `buyer-facing`
- Never upload mojibake such as `â€”`, `â€“`, `â€˜`, `â€™`, `â€œ`, or `â€`.
- Prefer plain ASCII punctuation in article copy unless a named source requires otherwise.

### Anti-LLM rewrite pass

Any text written or rewritten by an LLM must be edited before upload.

Remove or rewrite:
- obvious hype or padded emphasis such as "the window is now", "this changes everything", or "now more than ever"
- stock transitions such as "in today's rapidly evolving landscape", "at the end of the day", or "the reality is"
- repetitive contrast patterns such as "not just X, but Y" or "the question is no longer whether, but how"
- empty framing such as "it is important to note" or "it is worth noting" when they add no information
- generic conclusions that only restate the article without adding a practical takeaway
- stacked adjectives and vague claims unsupported by named evidence

Preferred style:
- concrete, specific, and attributable
- shorter sentences with a clear subject
- buyer or practitioner language over marketing language
- evidence first, interpretation second

---

## full_body HTML rules

The full_body field must be semantic HTML only. Strictly follow these rules:

### Allowed tags
```
p, h2, h3, ul, ol, li, table, thead, tbody, tr, th, td,
blockquote, strong, em, a, details, summary
```

### Forbidden tags - never include these
```
script, style, iframe, embed, meta, link, input, button,
form, header, footer, nav, div, span, section, article,
aside, main, figure, figcaption, img, video, audio
```

### Required article structure
Every full_body must include all of the following sections in order:

1. `<h2>` - Opening thesis (what the article argues and why it matters now)
2. `<h2>` - Who this is for (buyers / sellers / vendors / agents, be specific)
3. `<h2>` - The core problem (what is broken or misunderstood in the market)
4. `<h2>` - Key findings (data, research, or observed evidence, use `<ul>` or `<table>`)
5. `<h2>` - Evidence (specific named sources, statistics, case studies)
6. `<h2>` - Lessons learned (what practitioners should take away, use `<ul>`)
7. `<h2>` - Buyer checklist or comparison table (use `<table>` with thead/tbody)
8. `<h2>` - FAQ (use `<details>` and `<summary>` for each question)
9. `<h2>` - Conclusion (restate thesis, signal why Signal.lab matters in this context)

### blockquote usage
Use `<blockquote>` for direct quotations from named sources.
Always include the source as a `<p>` after the blockquote, using plain ASCII punctuation.

### table usage
Every `<table>` must include `<thead>` and `<tbody>`.
Use `<th>` for column headers. Use `<td>` for data cells.

### links
External links must use `target="_blank" rel="noopener noreferrer"`.
Internal Signal.lab links use relative paths: `/c/zero-trust`, `/about`, `/join`.

---

## Valid category slugs

Use exactly one of these for the category field:

```
microsegmentation
zero-trust
sase-sd-wan
cloud-security
edr-endpoint
firewalls-network
ot-ics
iam
siem-soc
data-security
grc-compliance
managed-services
cloud-infra
ucc
channel-intelligence
```

---

## Step-by-step execution

### Step 1 - Locate or generate the article JSON

If a JSON file exists in /article-handoffs/:
  -> Read it and proceed to Step 2.

If the source is a document (docx, html, md):
  -> Extract the content.
  -> Build the JSON package following the required schema above.
  -> Ensure full_body follows the required structure and HTML rules.
  -> Write the JSON to /article-handoffs/[slug].json.

If Claude has provided a JSON package in the handoff:
  -> Copy it to /article-handoffs/[slug].json.

Before moving to Step 2:
  -> Normalize punctuation and remove em dashes or en dashes from prose.
  -> Rewrite obvious LLM phrasing into direct, concrete editorial language.
  -> Read and write the JSON file as UTF-8.

### Step 2 - Validate the JSON

Before uploading, validate the article JSON against these checks:

```
[ ] slug is kebab-case, no spaces, no special characters
[ ] headline is under 100 characters
[ ] summary is under 300 characters
[ ] headline, summary, claim, CTA copy, and prose contain no em dashes, en dashes, or mojibake
[ ] full_body contains only allowed HTML tags
[ ] full_body contains all 9 required sections (h2 headings)
[ ] full_body contains at least one <table> or <ul> for findings
[ ] full_body contains at least one <details>/<summary> FAQ block
[ ] category matches one of the 14 valid slugs
[ ] tags is a JSON array of strings (not a comma-separated string)
[ ] claim is a single sentence under 200 characters
[ ] evidence_source is present and non-empty
[ ] author_name is present
[ ] author_email is a valid email format
[ ] cta_url starts with https://
[ ] obvious LLM-style filler, hype, or repetitive phrasing has been removed
[ ] status is "draft"
```

If any check fails: fix the field before proceeding. Do not upload invalid JSON.

### Step 3 - Upload via bulk upload API

POST a JSON object with an `articles` array to the bulk upload endpoint.
The endpoint does not accept a bare JSON array.

```bash
curl -X POST https://signal-lab.connxr.com/api/admin/bulk-upload \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "Authorization: Basic $(echo -n "$ADMIN_USERNAME:$ADMIN_PASSWORD" | base64)" \
  --data-binary @bulk-upload-body.json
```

Example request body:

```json
{
  "articles": [
    {
      "...": "article fields here"
    }
  ]
}
```

If the source file on disk is a single object or a bare array:
  -> Wrap it into `{ "articles": [...] }` at request time.

If using PowerShell:
  -> Read JSON with explicit UTF-8.
  -> Prefer `curl.exe --data-binary` over a stringified request body to avoid encoding corruption.

Or use the Supabase service role to insert directly if the API is not available:

```typescript
import { getServiceClient } from '@/lib/supabase-service'

const supabase = getServiceClient()
const { data, error } = await supabase
  .from('articles')
  .insert(articleObject)
  .select()
```

### Step 4 - Verify publication

After upload:

```
[ ] Article appears in /admin/articles
[ ] Status is 'draft' in admin
[ ] Draft copy is readable and correctly encoded in the admin editor
[ ] If the article remains draft, a public /insights/[slug] 404 is expected
[ ] After manual review and publish, GET /insights/[slug] returns 200
[ ] After manual review and publish, article appears in /insights index listing
[ ] After manual review and publish, article appears in /sitemap.xml
```

### Step 5 - Notify

After successful upload, output a summary:

```
OK: Article uploaded successfully
  Slug:     [slug]
  Headline: [headline]
  Category: [category]
  Status:   draft
  URL:      https://signal-lab.connxr.com/insights/[slug]
  Admin:    https://signal-lab.connxr.com/admin/articles
```

---

## Signal.lab Editorial attribution

When the article is produced by Signal.lab rather than a named contributor,
use these standard values:

```json
{
  "author_name":  "Signal.lab Editorial",
  "author_email": "editorial@signal-lab.connxr.com",
  "company":      "Signal.lab",
  "role":         "Editorial"
}
```

---

## Handoff folder convention

All article source files and generated JSON packages live in:

```
C:\Codex\signal-lab\article-handoffs\
```

Naming convention:
```
[slug].json       - generated JSON ready for upload
[slug].source.*   - original source file (docx, html, md, txt)
```

Create this folder if it does not exist.

---

## Error handling

| Error | Likely cause | Fix |
|---|---|---|
| 400 Bad Request from /api/admin/bulk-upload | Invalid JSON schema or missing required field | Re-validate against schema, fix field, retry |
| 401 Unauthorized | Admin credentials not set or incorrect | Check ADMIN_USERNAME and ADMIN_PASSWORD in env |
| 409 Conflict | Slug already exists in articles table | Change slug to a unique value |
| full_body contains forbidden tags | Source HTML included div/span/style | Strip forbidden tags, replace with allowed equivalents |
| Article missing required section | Source document lacked that section | Generate the missing section from context |
| Uploaded text shows `â€”` or other mojibake | File was read or posted with the wrong encoding, or smart punctuation was left in place | Re-read the JSON as UTF-8, normalize punctuation, then re-upload |

---

## Notes

- Always set status to "draft" on upload. Never publish directly to "published"
  without a human review in the admin UI at /admin/articles.
- Never trust raw LLM copy. Run a human editorial pass to remove stock phrasing,
  hype, filler, and obvious model voice before upload.
- The Signal.lab app handles slug -> URL routing, sitemap entry, schema.org JSON-LD,
  and data.json endpoint generation automatically after upload.
- Do not create a custom page.tsx for individual articles - the app handles rendering.
- The article editor at /admin/articles/[id] can be used to review and edit after upload.
