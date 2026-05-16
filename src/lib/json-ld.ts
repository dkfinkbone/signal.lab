import type { Article } from "@/types";
import type { PublicMember, PublicOrg, ProfileJsonDocument } from "@/types";
import {
  articleCanonical,
  categoryCanonical,
  orgCanonical,
  profileCanonical,
  siteUrl,
} from "./canonical";
import { sanitizeHtml } from "./sanitize-html";

export const HOME_META_DESCRIPTION =
  "Signal.lab structures verified human expertise and trusted relationships so AI agents can make deterministic discoveries. The expertise graph for agentic business processes.";

export const HOME_ORGANIZATION_DESCRIPTION =
  "Signal.lab is a trust graph for agentic business processes. It structures verified human expertise, relationship proximity, and proof of execution so that AI agents and human buyers can make deterministic discoveries.";

export const HOME_FAQ_ITEMS = [
  {
    question: "What is Signal.lab?",
    answer:
      "Signal.lab is a trust graph that makes verified human expertise and professional relationships queryable by AI agents and human buyers. Contributors publish structured expertise, categories, account patterns, and proof snippets, which agents can resolve to a named, verified person with a direct contact path.",
  },
  {
    question: "Who is Signal.lab for?",
    answer:
      "Signal.lab is built for channel sellers, consultants, vendor specialists, and the buyers and AI agents who need to find them. It is the structured layer that sits between LLM generation and human execution.",
  },
  {
    question: "How is Signal.lab different from LinkedIn or a directory?",
    answer:
      "Signal.lab is not a social network or a search index. It is structured infrastructure. Every contributor is a callable skill file with verified fields, machine-readable JSON, and a deterministic contact path. Agents can query it programmatically, not just humans browsing a page.",
  },
  {
    question: "How does Signal.lab prove discoverability?",
    answer:
      "Signal.lab exposes llms.txt, sitemap.xml, a public search API at /api/search, and structured JSON profile endpoints. Every piece of content is attributed to its contributor and indexed by search engines and LLM agents.",
  },
] as const;

export function articleJsonLd(article: Article): object {
  const canonicalUrl = article.canonical_url || articleCanonical(article.slug);

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
    publisher: {
      "@type": "Organization",
      name: "Signal.lab",
      url: siteUrl(),
    },
    datePublished: article.published_at,
    dateModified: article.updated_at,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    keywords: article.tags?.join(", "),
    articleBody: sanitizeHtml(article.full_body),
  };
}

export function homeJsonLd(): object {
  const baseUrl = siteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}#organization`,
        name: "Signal.lab",
        url: baseUrl,
        description: HOME_ORGANIZATION_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}#website`,
        url: baseUrl,
        name: "Signal.lab",
        description: HOME_META_DESCRIPTION,
        publisher: {
          "@id": `${baseUrl}#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/api/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: HOME_FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export function categoryJsonLd(
  category: string,
  routeParam = category,
  contributors: Array<{ name: string; profileSlug: string }> = [],
  relatedArticles: Array<{ headline: string; slug: string }> = []
): ProfileJsonDocument {
  const url = categoryCanonical(routeParam);
  const jsonLd: ProfileJsonDocument = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: category,
    description: `Verified channel professionals and knowledge assets for ${category}`,
    url,
  };

  if (contributors.length > 0) {
    jsonLd.hasDefinedTerm = contributors.map((contributor) => ({
      "@type": "Person",
      name: contributor.name,
      url: profileCanonical(contributor.profileSlug),
    }));
  }

  if (relatedArticles.length > 0) {
    jsonLd.hasPart = relatedArticles.map((article) => ({
      "@type": "Article",
      headline: article.headline,
      url: articleCanonical(article.slug),
    }));
  }

  return jsonLd;
}

export function personJsonLd(member: PublicMember): ProfileJsonDocument {
  if (member.profile_json && typeof member.profile_json === "object") {
    return member.profile_json;
  }

  const jsonLd: ProfileJsonDocument = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    url: profileCanonical(member.profile_slug ?? member.id),
  };

  if (member.role) {
    jsonLd.jobTitle = member.role;
  }

  if (member.company) {
    jsonLd.worksFor = {
      "@type": "Organization",
      name: member.company,
    };
  }

  if (member.linkedin_url) {
    jsonLd.sameAs = [member.linkedin_url];
  }

  return jsonLd;
}

export function organizationJsonLd(
  org: PublicOrg,
  members: PublicMember[]
): ProfileJsonDocument {
  const jsonLd: ProfileJsonDocument = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    url: orgCanonical(org.org_slug),
  };

  const linkedMembers = members
    .filter((member) => member.profile_slug)
    .map((member) => ({
      "@type": "Person",
      name: member.name,
      url: profileCanonical(member.profile_slug as string),
    }));

  if (linkedMembers.length > 0) {
    jsonLd.member = linkedMembers;
  }

  return jsonLd;
}
