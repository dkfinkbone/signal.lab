import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getArticleBySlug, getPublishedArticles } from "@/lib/articles";
import { articleCanonical } from "@/lib/canonical";
import { articleJsonLd } from "@/lib/json-ld";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { articleMetadata } from "@/lib/metadata";
import { sanitizeHtml } from "@/lib/sanitize-html";

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
  return articleMetadata(article);
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const requestHeaders = await headers();

  if (!article) {
    await logRequestEventFromHeaders({
      headers: requestHeaders,
      path: `/insights/${slug}`,
      routeType: "insights_article",
      slug,
      statusCode: 404,
    });
    notFound();
  }

  await logRequestEventFromHeaders({
    headers: requestHeaders,
    path: `/insights/${slug}`,
    routeType: "insights_article",
    slug,
    statusCode: 200,
  });

  const jsonLd = articleJsonLd(article);
  const canonical = article.canonical_url || articleCanonical(article.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <header className="mb-8">
          {article.category && (
            <a
              href={`/c/${encodeURIComponent(article.category)}`}
              className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:underline"
            >
              {article.category}
            </a>
          )}
          <h1 className="text-3xl font-bold mt-2 mb-3">{article.headline}</h1>
          <p className="text-lg text-gray-600 mb-4">{article.summary}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 pb-6 border-b border-gray-100">
            {article.author_name && (
              <span>
                <strong>{article.author_name}</strong>
                {article.role && ` | ${article.role}`}
                {article.company && ` at ${article.company}`}
              </span>
            )}
            {article.published_at && (
              <time dateTime={article.published_at}>
                {new Date(article.published_at).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
          </div>
        </header>

        <div
          className="prose prose-gray max-w-none mb-10"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.full_body) }}
        />

        {article.claim && (
          <aside className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-8">
            <p className="text-sm font-semibold text-blue-800 mb-1">Key Claim</p>
            <p className="text-blue-900">{article.claim}</p>
            {article.evidence_source && (
              <p className="text-xs text-blue-600 mt-2">
                Source: {article.evidence_source}
              </p>
            )}
          </aside>
        )}

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {article.cta_url && (
          <div className="border border-gray-200 rounded-lg p-5 mb-8">
            <a
              href={article.cta_url}
              className="text-blue-600 font-semibold hover:underline"
              rel="noopener"
            >
              {article.cta_label || "Learn more ->"}
            </a>
          </div>
        )}

        <footer className="pt-6 border-t border-gray-100 text-xs text-gray-400 space-y-1">
          <p>
            Canonical:{" "}
            <a href={canonical} className="hover:underline">
              {canonical}
            </a>
          </p>
          <p>
            <a href={`/t/${article.slug}`} className="hover:underline">
              Teaser version
            </a>
            {" | "}
            <a href={`/agent-read/${article.slug}`} className="hover:underline">
              Agent-read JSON
            </a>
          </p>
        </footer>
      </article>
    </>
  );
}
