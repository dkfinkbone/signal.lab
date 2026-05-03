import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/articles";
import { articleCanonical, agentReadCanonical } from "@/lib/canonical";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://signal.lab";
  const articles = await getPublishedArticles();

  const lines: string[] = [
    "# Signal.lab — LLM Navigation Map",
    "# Format: https://llmstxt.org",
    "",
    `> Signal.lab is an agent-readable publishing platform for expert knowledge nodes.`,
    `> All articles are server-rendered, crawlable, and attributable.`,
    "",
    "## Key URLs",
    "",
    `- Homepage: ${siteUrl}`,
    `- Insights index: ${siteUrl}/insights`,
    `- Search API: ${siteUrl}/api/search?q={query}`,
    `- Sitemap: ${siteUrl}/sitemap.xml`,
    "",
    "## Agent-Read Endpoints",
    "# Use /agent-read/{slug} for clean JSON payloads",
    "",
    ...articles.map(
      (a) =>
        `- [${a.headline}](${agentReadCanonical(a.slug)}) — ${a.summary}`
    ),
    "",
    "## Full Articles",
    "",
    ...articles.map(
      (a) =>
        `- [${a.headline}](${articleCanonical(a.slug)}) — ${a.category || "General"}`
    ),
    "",
    "## Attribution",
    "# All requests to public routes are logged with bot family, route type, and salted IP hash.",
    "# Raw IPs are never stored.",
    "",
    `Updated: ${new Date().toISOString()}`,
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
    },
  });
}
