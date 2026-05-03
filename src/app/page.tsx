import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPublishedArticles } from "@/lib/articles";
import { articlePath } from "@/lib/canonical";
import { logRequestEventFromHeaders } from "@/lib/log-event";

export const metadata: Metadata = {
  title: "Signal.lab - Expert Knowledge for Humans and Machines",
  description:
    "A crawlable, machine-readable publishing platform for attributable expert insights.",
  alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL ?? "/" },
};

export default async function HomePage() {
  const articles = await getPublishedArticles();
  const categories = [...new Set(articles.map((a) => a.category).filter(Boolean))];

  await logRequestEventFromHeaders({
    headers: await headers(),
    path: "/",
    routeType: "home",
    statusCode: 200,
  });

  return (
    <>
      <section className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Signal.lab</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Expert knowledge nodes - crawlable, attributable, and machine-readable.
          Built for search engines, LLM agents, and human readers alike.
        </p>
      </section>

      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <a
                key={cat}
                href={`/c/${encodeURIComponent(cat)}`}
                className="px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded-full text-sm"
              >
                {cat}
              </a>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-6">
          Latest Insights
        </h2>
        {articles.length === 0 ? (
          <p className="text-gray-500">No published articles yet.</p>
        ) : (
          <ul className="space-y-8">
            {articles.map((article) => (
              <li key={article.id} className="border-b border-gray-100 pb-8">
                <a href={articlePath(article.slug)} className="block group">
                  <h3 className="text-xl font-semibold group-hover:text-blue-600 mb-2">
                    {article.headline}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{article.summary}</p>
                </a>
                <div className="flex gap-4 text-xs text-gray-400">
                  {article.author_name && <span>{article.author_name}</span>}
                  {article.category && (
                    <a
                      href={`/c/${encodeURIComponent(article.category)}`}
                      className="hover:text-blue-500"
                    >
                      {article.category}
                    </a>
                  )}
                  {article.published_at && (
                    <time dateTime={article.published_at}>
                      {new Date(article.published_at).toLocaleDateString("en-GB")}
                    </time>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 pt-8 border-t border-gray-100">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
          For Agents and Crawlers
        </h2>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>
            <a href="/llms.txt" className="hover:text-blue-500">
              /llms.txt
            </a>{" "}
            - LLM navigation map
          </li>
          <li>
            <a href="/sitemap.xml" className="hover:text-blue-500">
              /sitemap.xml
            </a>{" "}
            - Full sitemap
          </li>
          <li>
            <a href="/robots.txt" className="hover:text-blue-500">
              /robots.txt
            </a>{" "}
            - Crawler permissions
          </li>
          <li>
            <a href="/api/search?q=example" className="hover:text-blue-500">
              /api/search?q=
            </a>{" "}
            - Search API
          </li>
        </ul>
      </section>
    </>
  );
}
