import { NextResponse } from "next/server";
import { getArticlesByCategory } from "@/lib/articles";
import {
  getCategoryDefinition,
  getCategoryLabel,
  getCategoryRouteParam,
} from "@/lib/categories";
import { categoryJsonLd } from "@/lib/json-ld";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const definition = getCategoryDefinition(category);
  const routeParam = getCategoryRouteParam(category);
  const categoryLabel = getCategoryLabel(category);
  const directArticles = await getArticlesByCategory(routeParam);
  const articles =
    directArticles.length === 0 && definition && definition.label !== routeParam
      ? await getArticlesByCategory(definition.label)
      : directArticles;

  if (articles.length === 0 && !definition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const lastModified = articles[0]?.updated_at ?? new Date().toISOString();
  const payload = categoryJsonLd(
    categoryLabel,
    routeParam,
    [],
    articles.map((article) => ({
      headline: article.headline,
      slug: article.slug,
    }))
  );

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Last-Modified": new Date(lastModified).toUTCString(),
    },
  });
}
