import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPublishedArticles } from "@/lib/articles";
import { articlePath } from "@/lib/canonical";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Insights",
  "All published expert knowledge nodes on Signal.lab.",
  "/insights"
);

export default async function InsightsPage() {
  const articles = await getPublishedArticles();

  await logRequestEventFromHeaders({
    headers: await headers(),
    path: "/insights",
    routeType: "insights_index",
    statusCode: 200,
  });

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Insights</h1>
      <p className="text-gray-500 mb-10">
        {articles.length} published article{articles.length !== 1 ? "s" : ""}.
      </p>

      {articles.length === 0 ? (
        <p className="text-gray-400">No articles published yet.</p>
      ) : (
        <ul className="space-y-8">
          {articles.map((article) => (
            <li key={article.id} className="border-b border-gray-100 pb-8">
              <a href={articlePath(article.slug)} className="block group">
                <h2 className="text-xl font-semibold group-hover:text-blue-600 mb-1">
                  {article.headline}
                </h2>
                <p className="text-gray-600 text-sm mb-3">{article.summary}</p>
              </a>
              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                {article.author_name && <span>By {article.author_name}</span>}
                {article.category && (
                  <a
                    href={`/c/${encodeURIComponent(article.category)}`}
                    className="hover:text-blue-500"
                  >
                    {article.category}
                  </a>
                )}
                {article.tags?.map((tag) => (
                  <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
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
    </>
  );
}
