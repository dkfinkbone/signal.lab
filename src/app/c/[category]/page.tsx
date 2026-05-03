import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getArticlesByCategory, getPublishedArticles } from "@/lib/articles";
import { articlePath } from "@/lib/canonical";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { pageMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  const categories = [...new Set(articles.map((a) => a.category).filter(Boolean))];
  return categories.map((cat) => ({ category: encodeURIComponent(cat) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const decoded = decodeURIComponent(category);

  return pageMetadata(
    `${decoded} - Insights`,
    `All Signal.lab articles in the ${decoded} category.`,
    `/c/${category}`
  );
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  const articles = await getArticlesByCategory(decoded);
  const requestHeaders = await headers();

  if (articles.length === 0) {
    await logRequestEventFromHeaders({
      headers: requestHeaders,
      path: `/c/${category}`,
      routeType: "category",
      category: decoded,
      statusCode: 404,
    });
    notFound();
  }

  await logRequestEventFromHeaders({
    headers: requestHeaders,
    path: `/c/${category}`,
    routeType: "category",
    category: decoded,
    statusCode: 200,
  });

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">{decoded}</h1>
      <p className="text-gray-500 mb-10">
        {articles.length} article{articles.length !== 1 ? "s" : ""} in this category.
      </p>

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
    </>
  );
}
