import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/articles";
import { articlePath } from "@/lib/canonical";
import { homeJsonLd } from "@/lib/json-ld";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Expert Knowledge for Humans and Machines",
  "A crawlable, machine-readable publishing platform for attributable expert insights.",
  "/"
);

export default async function HomePage() {
  const articles = await getPublishedArticles();
  const categories = [...new Set(articles.map((a) => a.category).filter(Boolean))];
  const jsonLd = homeJsonLd();

  await logRequestEventFromHeaders({
    headers: await headers(),
    path: "/",
    routeType: "home",
    statusCode: 200,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Signal.lab</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Expert knowledge nodes - crawlable, attributable, and machine-readable.
          Built for search engines, LLM agents, and human readers alike.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/insights"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Browse Insights
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Open Attribution Dashboard
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Open Admin
          </Link>
        </div>
      </section>

      <section className="mb-12 rounded-3xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
          What Machines Can Extract Here
        </h2>
        <dl className="grid gap-4 md:grid-cols-3">
          <div>
            <dt className="text-sm font-semibold text-gray-900">Contributor profiles</dt>
            <dd className="mt-2 text-sm text-gray-600">
              Named experts, company affiliation, category expertise, and machine-readable
              profile JSON.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-gray-900">Knowledge assets</dt>
            <dd className="mt-2 text-sm text-gray-600">
              Full articles, teaser pages, category hubs, and future proof snippets for
              granular attribution.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-gray-900">Commercial signal</dt>
            <dd className="mt-2 text-sm text-gray-600">
              Domain expertise, anonymised customer-pattern evidence, and paths back to
              real contributors.
            </dd>
          </div>
        </dl>
      </section>

      <section className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Best Content To Publish
        </h2>
        <div className="overflow-x-auto rounded-3xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
                  Format
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
                  What to include
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
                  Why buyers and LLMs care
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              <tr>
                <th scope="row" className="px-4 py-3 font-medium text-gray-900">
                  Category brief
                </th>
                <td className="px-4 py-3 text-gray-600">
                  Opinionated market view, buying patterns, implementation pitfalls, and
                  RFP guidance for a single domain.
                </td>
                <td className="px-4 py-3 text-gray-600">
                  Strong thought-leadership surface for research packages and shortlist
                  formation.
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium text-gray-900">
                  Proof snippet
                </th>
                <td className="px-4 py-3 text-gray-600">
                  Anonymised success, failure, objection, lesson learned, or outcome tied
                  to sector, region, vendor, and category.
                </td>
                <td className="px-4 py-3 text-gray-600">
                  Highly extractable atomic evidence that LLMs can cite back to a named
                  contributor.
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium text-gray-900">
                  Profile evidence
                </th>
                <td className="px-4 py-3 text-gray-600">
                  Customer counts, account patterns, and vendor expertise without exposing
                  named customer accounts.
                </td>
                <td className="px-4 py-3 text-gray-600">
                  Helps buyers validate fit and gives agents structured commercial context.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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

      <section className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
          FAQ
        </h2>
        <div className="space-y-3">
          {[
            {
              question: "What should a seller publish on Signal.lab?",
              answer:
                "The highest-signal content is category expertise, anonymised proof snippets, vendor/product knowledge, and buyer-facing articles that explain outcomes, blockers, and lessons learned.",
            },
            {
              question: "Can a buyer or buyer-side agent contact the contributor?",
              answer:
                "That is the target model. Public pages should carry attributable author identity and a clear contact or intro path back into Signal.lab without leaking private account data.",
            },
            {
              question: "Does Signal.lab require named customer disclosure?",
              answer:
                "No. The platform is designed to support anonymised customer-pattern evidence so contributors can publish useful commercial proof without exposing sensitive account names.",
            },
            {
              question: "How does the platform prove discoverability?",
              answer:
                "Signal.lab can show crawl activity, indexing evidence, search impressions, clicks, and inbound contact actions so contributors see whether their knowledge is actually being surfaced.",
            },
          ].map((item) => (
            <details key={item.question} className="rounded-2xl border border-gray-200 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-gray-900">
                {item.question}
              </summary>
              <p className="mt-3 text-sm text-gray-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

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
