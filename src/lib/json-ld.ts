import type { Article } from "@/types";
import { articleCanonical } from "./canonical";
import { sanitizeHtml } from "./sanitize-html";

export function articleJsonLd(article: Article): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.summary,
    author: {
      "@type": "Person",
      name: article.author_name,
      worksFor: article.company
        ? { "@type": "Organization", name: article.company }
        : undefined,
    },
    datePublished: article.published_at,
    dateModified: article.updated_at,
    url: article.canonical_url || articleCanonical(article.slug),
    keywords: article.tags?.join(", "),
    articleBody: sanitizeHtml(article.full_body),
  };
}
