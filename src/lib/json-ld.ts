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
