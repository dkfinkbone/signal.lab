import { NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/articles";
import { articleJsonLd } from "@/lib/json-ld";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(JSON.stringify(articleJsonLd(article), null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Last-Modified": new Date(article.updated_at).toUTCString(),
    },
  });
}
