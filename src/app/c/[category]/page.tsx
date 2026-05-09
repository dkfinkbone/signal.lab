import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getArticlesByCategory, getPublishedArticles } from "@/lib/articles";
import { articlePath } from "@/lib/canonical";
import {
  collectCategoryRouteParams,
  getCategoryDefinition,
  getCategoryLabel,
  getCategoryRouteParam,
} from "@/lib/categories";
import { categoryJsonLd } from "@/lib/json-ld";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { pageMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  const categories = collectCategoryRouteParams(
    articles.map((article) => article.category).filter(Boolean)
  );
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const decoded = getCategoryLabel(category);
  const canonicalCategory = getCategoryRouteParam(category);

  return pageMetadata(
    `${decoded} - Insights`,
    `All Signal.lab articles in the ${decoded} category.`,
    `/c/${encodeURIComponent(canonicalCategory)}`
  );
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const resolvedCategory = getCategoryRouteParam(category);
  const categoryLabel = getCategoryLabel(category);
  const definition = getCategoryDefinition(category);
  const directArticles = await getArticlesByCategory(resolvedCategory);
  const articles =
    directArticles.length === 0 && definition && definition.label !== resolvedCategory
      ? await getArticlesByCategory(definition.label)
      : directArticles;
  const requestHeaders = await headers();
  const jsonLd = categoryJsonLd(
    categoryLabel,
    resolvedCategory,
    [],
    articles.map((article) => ({ headline: article.headline, slug: article.slug }))
  );

  if (articles.length === 0 && !definition) {
    await logRequestEventFromHeaders({
      headers: requestHeaders,
      path: `/c/${category}`,
      routeType: "category",
      category: resolvedCategory,
      statusCode: 404,
    });
    notFound();
  }

    await logRequestEventFromHeaders({
      headers: requestHeaders,
      path: `/c/${category}`,
      routeType: "category",
      category: resolvedCategory,
      statusCode: 200,
    });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold mb-2">{categoryLabel}</h1>
      <p className="text-gray-500 mb-6">
        {articles.length} article{articles.length !== 1 ? "s" : ""} in this category.
      </p>

      <p className="text-sm text-gray-500 mb-10">
        Machine-readable endpoint:{" "}
        <a
          href={`/c/${encodeURIComponent(resolvedCategory)}/data.json`}
          className="hover:text-blue-600"
        >
          /c/{resolvedCategory}/data.json
        </a>
      </p>

      {articles.length === 0 && (
        <div className="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          This category route is live for crawlers and future contributor profiles,
          but there are no published articles in it yet.
        </div>
      )}

      {articles.length > 0 && (
        <ul className="space-y-8">
          {articles.map((article) => (
            <li key={article.id} className="border-b border-gray-100 pb-8">
              <a href={articlePath(article.slug)} className="group block">
                <h2 className="text-xl font-semibold group-hover:text-blue-600 mb-1">
                  {article.headline}
                </h2>
                <p className="text-gray-600 text-sm mb-3">{article.summary}</p>
                <div className="flex gap-4 text-xs text-gray-400">
                  {article.author_name && <span>By {article.author_name}</span>}
                  {article.published_at && (
                    <time dateTime={article.published_at}>
                      {new Date(article.published_at).toLocaleDateString("en-GB")}
                    </time>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
