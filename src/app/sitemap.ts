import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getPublishedArticles } from "@/lib/articles";
import { articleCanonical, teaserCanonical, categoryCanonical } from "@/lib/canonical";
import { logRequestEventFromHeaders } from "@/lib/log-event";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const articles = await getPublishedArticles();
  const categories = [...new Set(articles.map((a) => a.category).filter(Boolean))];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://signal.lab";

  await logRequestEventFromHeaders({
    headers: requestHeaders,
    path: "/sitemap.xml",
    routeType: "sitemap",
    statusCode: 200,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/insights`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: articleCanonical(a.slug),
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const teaserRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: teaserCanonical(a.slug),
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: categoryCanonical(cat),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes, ...teaserRoutes, ...categoryRoutes];
}
