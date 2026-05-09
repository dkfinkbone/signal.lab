import { NextRequest, NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/articles";
import {
  collectCategoryRouteParams,
  getCategoryLabel,
} from "@/lib/categories";
import { buildLlmsManifest } from "@/lib/llms";
import {
  getContributorCountsByDomain,
  getOrgCount,
  getVerifiedMemberCount,
} from "@/lib/member-graph";
import { logRequestEvent } from "@/lib/log-event";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://signal-lab.connxr.com";

  const [articles, memberCount, orgCount, contributorCounts] = await Promise.all([
    getPublishedArticles(),
    getVerifiedMemberCount(),
    getOrgCount(),
    getContributorCountsByDomain(),
  ]);

  const categories = collectCategoryRouteParams(
    articles.map((article) => article.category).filter(Boolean)
  )
    .map((slug) => ({
      slug,
      label: getCategoryLabel(slug),
      contributorCount: contributorCounts[slug] ?? 0,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));

  await logRequestEvent({ req, routeType: "llms", statusCode: 200 });

  const manifest = buildLlmsManifest({
    base,
    generatedAt: new Date().toISOString(),
    memberCount,
    orgCount,
    articleCount: articles.length,
    categories,
  });

  return new NextResponse(manifest, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
