import type { Metadata } from "next";
import { articleCanonical, siteUrl } from "./canonical";
import type { Article } from "@/types";

export function articleMetadata(article: Article): Metadata {
  const url = articleCanonical(article.slug);
  return {
    title: article.headline,
    description: article.summary,
    authors: article.author_name ? [{ name: article.author_name }] : [{ name: "Signal.lab" }],
    creator: article.author_name || "Signal.lab",
    publisher: "Signal.lab",
    alternates: { canonical: url },
    openGraph: {
      title: article.headline,
      description: article.summary,
      url,
      siteName: "Signal.lab",
      type: "article",
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
    },
    twitter: {
      card: "summary_large_image",
      title: article.headline,
      description: article.summary,
    },
  };
}

export function pageMetadata(
  title: string,
  description: string,
  canonicalPath: string
): Metadata {
  const baseUrl = siteUrl();
  const url = `${baseUrl}${canonicalPath}`;
  return {
    title,
    description,
    authors: [{ name: "Signal.lab" }],
    creator: "Signal.lab",
    publisher: "Signal.lab",
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Signal.lab",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
