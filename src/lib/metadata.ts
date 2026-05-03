import type { Metadata } from "next";
import { articleCanonical } from "./canonical";
import type { Article } from "@/types";

export function articleMetadata(article: Article): Metadata {
  const url = articleCanonical(article.slug);
  return {
    title: article.headline,
    description: article.summary,
    alternates: { canonical: url },
    openGraph: {
      title: article.headline,
      description: article.summary,
      url,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
    },
  };
}

export function pageMetadata(
  title: string,
  description: string,
  canonicalPath: string
): Metadata {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://signal.lab";
  const url = `${siteUrl}${canonicalPath}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}
