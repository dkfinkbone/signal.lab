import { NextRequest, NextResponse } from "next/server";
import { pickArticleWritePayload } from "@/lib/article-write";
import { getServiceClient } from "@/lib/supabase-service";
import { articleCanonical } from "@/lib/canonical";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/sanitize-html";

export async function POST(req: NextRequest) {
  const rateLimit = enforceRateLimit(req, "admin-write", 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { articles } = await req.json();
    if (!Array.isArray(articles)) {
      return NextResponse.json({ error: "Expected { articles: [] }" }, { status: 400 });
    }

    const client = getServiceClient();
    let inserted = 0;
    const errors: string[] = [];

    for (const sourceArticle of articles) {
      const article = pickArticleWritePayload(sourceArticle);

      if (!article.slug || !article.headline) {
        errors.push(
          `Skipped: missing slug or headline - ${JSON.stringify(sourceArticle).slice(0, 80)}`
        );
        continue;
      }

      if (!article.canonical_url) {
        article.canonical_url = articleCanonical(article.slug);
      }
      if (typeof article.full_body === "string") {
        article.full_body = sanitizeHtml(article.full_body);
      }
      if (article.status === "published" && !article.published_at) {
        article.published_at = new Date().toISOString();
      }

      const { error } = await client.from("articles").upsert(article, { onConflict: "slug" });

      if (error) {
        errors.push(`${article.slug}: ${error.message}`);
      } else {
        inserted++;
      }
    }

    return NextResponse.json({ inserted, errors }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
