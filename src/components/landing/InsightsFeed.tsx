import Link from "next/link";
import { articlePath } from "@/lib/canonical";
import {
  NETWORK_CATEGORIES,
  getCategoryLabel,
  getCategoryRouteParam,
} from "@/lib/categories";
import type { Article } from "@/types";

interface InsightsFeedProps {
  articles: Article[];
  categories: string[];
}

function buildCategoryEntries(categories: string[]) {
  const seen = new Set<string>();

  return categories
    .map((category) => {
      const routeParam = getCategoryRouteParam(category);
      return {
        href: `/c/${encodeURIComponent(routeParam)}`,
        label: getCategoryLabel(category),
      };
    })
    .filter((entry) => {
      if (seen.has(entry.href)) {
        return false;
      }

      seen.add(entry.href);
      return true;
    });
}

export default function InsightsFeed({ articles, categories }: InsightsFeedProps) {
  const latestArticles = articles.slice(0, 4);
  const visibleCategories =
    categories.length > 0 ? categories : NETWORK_CATEGORIES.map((category) => category.label);
  const categoryEntries = buildCategoryEntries(visibleCategories);

  return (
    <section className="border-b border-[#1E1C1A] py-14 md:py-[4.5rem]">
      <div className="max-w-3xl">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#888780]"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          Live from the graph
        </p>
        <h2
          className="mt-4 text-3xl leading-tight text-[#F1EFE8] md:text-5xl"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          Signal.lab publishes structured intelligence from verified contributors.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#888780]">
          Every article is attributed, categorised, and machine-readable.
        </p>
      </div>

      {latestArticles.length === 0 ? (
        <div className="mt-8 rounded-[22px] border border-[#2C2C2A] bg-[#141311] p-6 text-base leading-7 text-[#888780]">
          No published insights are available in this environment yet. The public
          category routes remain linked below so buyers, crawlers, and LLM agents can
          still traverse the graph.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {latestArticles.map((article) => {
            const categoryLabel = getCategoryLabel(article.category);
            const categoryHref = `/c/${encodeURIComponent(getCategoryRouteParam(article.category))}`;

            return (
              <article
                key={article.id}
                className="rounded-[22px] border border-[#2C2C2A] bg-[#141311] p-5"
              >
                <div className="border-l-2 border-[#1D9E75] pl-4">
                  <Link href={articlePath(article.slug)} className="group block">
                    <p
                      className="text-[11px] uppercase tracking-[0.18em] text-[#888780]"
                      style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                    >
                      Insight
                    </p>
                    <h3
                      className="mt-3 text-2xl leading-tight text-[#F1EFE8] transition-colors group-hover:text-[#1D9E75]"
                      style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
                    >
                      {article.headline}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#B4B1A7]">{article.summary}</p>
                  </Link>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#888780]">
                  {article.category && (
                    <Link
                      href={categoryHref}
                      className="rounded-full border border-[#2C2C2A] bg-[#11100f] px-3 py-1 text-[#D8D4CA] transition-colors hover:border-[#1D9E75] hover:text-[#F1EFE8]"
                    >
                      {categoryLabel}
                    </Link>
                  )}
                  {article.author_name && <span>{article.author_name}</span>}
                  {article.published_at && (
                    <time dateTime={article.published_at}>
                      {new Date(article.published_at).toLocaleDateString("en-GB")}
                    </time>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {categoryEntries.length > 0 && (
        <div className="mt-10">
          <h3
            className="text-lg text-[#F1EFE8]"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
          >
            Browse by category
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {categoryEntries.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="rounded-full border border-[#2C2C2A] bg-[#11100f] px-4 py-2 text-sm text-[#D8D4CA] transition-colors hover:border-[#1D9E75] hover:text-[#F1EFE8]"
              >
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/insights"
        className="mt-8 inline-flex items-center rounded-full border border-[#2C2C2A] px-4 py-2 text-sm font-medium text-[#F1EFE8] transition-colors hover:bg-[#1a1917]"
      >
        Browse all insights -&gt;
      </Link>
    </section>
  );
}
