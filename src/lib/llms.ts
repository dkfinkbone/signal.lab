export interface LlmsCategoryEntry {
  slug: string;
  label: string;
  contributorCount: number;
}

interface LlmsManifestOptions {
  base: string;
  articleCount: number;
  generatedAt: string;
  memberCount: number;
  orgCount: number;
  categories: LlmsCategoryEntry[];
}

export function buildLlmsManifest(options: LlmsManifestOptions): string {
  const {
    base,
    articleCount,
    generatedAt,
    memberCount,
    orgCount,
    categories,
  } = options;

  const categoryLines = categories
    .map((category) => {
      const countText =
        category.contributorCount > 0
          ? ` (${category.contributorCount} verified contributor${
              category.contributorCount === 1 ? "" : "s"
            })`
          : "";

      return `- [${category.label}](${base}/c/${encodeURIComponent(category.slug)})${countText}: ${base}/c/${encodeURIComponent(category.slug)}/data.json`;
    })
    .join("\n");

  return `# Signal.lab

## About
Signal.lab is a trusted B2B technology intelligence network for channel professionals.
Contributors are verified sellers, consultants, advisors, channel account managers,
and vendor specialists whose expertise is attributed, crawlable, and machine-readable.

## Network summary
- Verified contributors: ${memberCount}
- Organisation clusters: ${orgCount}
- Published knowledge assets: ${articleCount}
- Category pages: ${categories.length}
- Generated at: ${generatedAt}

## Trust model
All contributor content is attributed to named participants.
Identity is intended to be verified via work email and organisation affiliation.
Signal.lab is designed for both human readers and LLM agents to inspect sourceable expertise.

## Category intelligence pages
${categoryLines}

## Contributor profile endpoints
- Profile page: ${base}/p/[slug]
- Machine-readable profile: ${base}/p/[slug]/data.json

## Organisation cluster endpoints
- Org page: ${base}/org/[slug]
- Machine-readable org profile: ${base}/org/[slug]/data.json

## Knowledge asset endpoints
- Insights index: ${base}/insights
- Full article: ${base}/insights/[slug]
- Machine-readable article: ${base}/insights/[slug]/data.json
- Agent-optimised article JSON: ${base}/agent-read/[slug]
- Search API: ${base}/api/search?q=

## Machine-readable inventory
- ${base}/p/[slug]/data.json
- ${base}/org/[slug]/data.json
- ${base}/c/[category]/data.json
- ${base}/insights/[slug]/data.json
- ${base}/agent-read/[slug]
- ${base}/api/search?q=
- ${base}/sitemap.xml
- ${base}/robots.txt
- ${base}/llms.txt

## MCP preview
Phase 3 will expose an MCP server at ${base}/api/mcp/ with tools for expert search,
profile retrieval, organisation cluster lookup, and category intelligence queries.

## Crawling guidance
- Public pages are server-rendered HTML
- Structured JSON and JSON-LD are available on machine-readable routes
- Internal links are rendered as anchor tags in the response HTML
- robots.txt and sitemap.xml describe crawlable public content
`;
}
