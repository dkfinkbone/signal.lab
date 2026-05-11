import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getArticleBySlug, getPublishedArticles } from "@/lib/articles";
import { articleCanonical, articleDataCanonical } from "@/lib/canonical";
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

      <article className="article-shell mx-auto max-w-3xl">
        <header className="article-header mb-10">
          {article.category && (
            <a
              href={`/c/${encodeURIComponent(article.category)}`}
              className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 transition hover:bg-blue-100"
            >
              {article.category}
            </a>
          )}
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            {article.headline}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
            {article.summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-b border-slate-200 pb-8 text-sm text-slate-500">
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
          className="article-body mb-12"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.full_body) }}
        />

        {article.claim && (
          <aside className="mb-10 rounded-2xl border border-blue-200 bg-blue-50/80 p-6 shadow-sm">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-800">
              Key Claim
            </p>
            <p className="text-base leading-8 text-blue-950">{article.claim}</p>
            {article.evidence_source && (
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-blue-700">
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
          <div className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5">
            <a
              href={article.cta_url}
              className="font-semibold text-blue-700 hover:underline"
              rel="noopener"
            >
              {article.cta_label || "Learn more ->"}
            </a>
          </div>
        )}

        <footer className="space-y-2 border-t border-slate-200 pt-6 text-xs text-slate-400">
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
            <a href={articleDataCanonical(article.slug)} className="hover:underline">
              Article JSON
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
