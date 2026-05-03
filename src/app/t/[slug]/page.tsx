import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getArticleBySlug, getPublishedArticles } from "@/lib/articles";
import { articleCanonical } from "@/lib/canonical";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { pageMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Not Found" };
  return pageMetadata(`${article.headline} (Preview)`, article.summary, `/t/${slug}`);
}

export default async function TeaserPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const requestHeaders = await headers();

  if (!article) {
    await logRequestEventFromHeaders({
      headers: requestHeaders,
      path: `/t/${slug}`,
      routeType: "teaser",
      slug,
      statusCode: 404,
    });
    notFound();
  }

  await logRequestEventFromHeaders({
    headers: requestHeaders,
    path: `/t/${slug}`,
    routeType: "teaser",
    slug,
    statusCode: 200,
  });

  return (
    <article>
      {article.category && (
        <a
          href={`/c/${encodeURIComponent(article.category)}`}
          className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:underline"
        >
          {article.category}
        </a>
      )}
      <h1 className="text-3xl font-bold mt-2 mb-4">{article.headline}</h1>
      <p className="text-lg text-gray-600 mb-6">{article.summary}</p>

      {article.author_name && (
        <p className="text-sm text-gray-500 mb-6">
          By <strong>{article.author_name}</strong>
          {article.role && ` | ${article.role}`}
          {article.company && ` at ${article.company}`}
        </p>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500 mb-4">Read the full article on Signal.lab</p>
        <a
          href={articleCanonical(slug)}
          className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          Read Full Article
        </a>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Canonical:{" "}
        <a href={articleCanonical(slug)} className="hover:underline">
          {articleCanonical(slug)}
        </a>
      </p>
    </article>
  );
}
