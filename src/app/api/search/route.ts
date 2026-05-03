import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/articles";
import { articleCanonical } from "@/lib/canonical";
import { logRequestEvent } from "@/lib/log-event";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { SearchResult } from "@/types";

export async function GET(req: NextRequest) {
  const rateLimit = enforceRateLimit(req, "search", 60, 60_000);
  if (!rateLimit.allowed) {
    await logRequestEvent({ req, routeType: "search", statusCode: 429 });
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": Math.max(
            1,
            Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
          ).toString(),
        },
      }
    );
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    await logRequestEvent({ req, routeType: "search", statusCode: 400 });
    return NextResponse.json(
      { error: "Missing query parameter: q" },
      { status: 400 }
    );
  }

  const articles = await searchArticles(q);

  const results: SearchResult[] = articles.map((a) => ({
    headline: a.headline,
    summary: a.summary,
    slug: a.slug,
    category: a.category,
    canonical_url: a.canonical_url || articleCanonical(a.slug),
  }));

  await logRequestEvent({ req, routeType: "search", statusCode: 200 });

  return NextResponse.json(
    { q, count: results.length, results },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    }
  );
}
