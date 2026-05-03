import { NextRequest, NextResponse } from "next/server";
import { getArticleBySlug, getArticlesByCategory } from "@/lib/articles";
import { buildAgentReadPayload } from "@/lib/agent-read";
import { articleCanonical } from "@/lib/canonical";
import { logRequestEvent } from "@/lib/log-event";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    await logRequestEvent({ req, routeType: "agent_read", slug, statusCode: 404 });
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const relatedLinks = (await getArticlesByCategory(article.category))
    .filter((candidate) => candidate.slug !== slug)
    .slice(0, 5)
    .map((candidate) => ({
      headline: candidate.headline,
      slug: candidate.slug,
      canonical_url: articleCanonical(candidate.slug),
    }));

  await logRequestEvent({ req, routeType: "agent_read", slug, statusCode: 200 });

  return NextResponse.json(buildAgentReadPayload(article, relatedLinks), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
