import type { AgentReadPayload, Article } from "@/types";
import { articleCanonical } from "./canonical";
import { sanitizeHtml } from "./sanitize-html";

interface RelatedArticleLink {
  headline: string;
  slug: string;
  canonical_url: string;
}

export function buildAgentReadPayload(
  article: Article,
  relatedLinks: RelatedArticleLink[]
): AgentReadPayload {
  return {
    headline: article.headline,
    summary: article.summary,
    full_body: sanitizeHtml(article.full_body),
    claim: article.claim,
    evidence_source: article.evidence_source,
    category: article.category,
    author: article.author_name,
    company: article.company,
    role: article.role,
    canonical_url: article.canonical_url || articleCanonical(article.slug),
    cta_url: article.cta_url,
    related_links: relatedLinks,
  };
}
