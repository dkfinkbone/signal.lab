import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getPublishedArticles } from "@/lib/articles";
import {
  articleCanonical,
  categoryCanonical,
  orgCanonical,
  profileCanonical,
  siteUrl as canonicalSiteUrl,
  teaserCanonical,
} from "@/lib/canonical";
import { collectCategoryRouteParams, getCategoryRouteParam } from "@/lib/categories";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { getOrgSitemapEntries, getProfileSitemapEntries } from "@/lib/member-graph";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const articles = await getPublishedArticles();
  const categories = collectCategoryRouteParams(
    articles.map((article) => article.category).filter(Boolean)
  );
  const siteUrl = canonicalSiteUrl();
  const [profileRows, orgRows] = await Promise.all([
    getProfileSitemapEntries(),
    getOrgSitemapEntries(),
  ]);

  const categoryLastModified = new Map<string, Date>();
  for (const article of articles) {
    const routeParam = getCategoryRouteParam(article.category);
    const updatedAt = article.updated_at ? new Date(article.updated_at) : new Date();
    const current = categoryLastModified.get(routeParam);

    if (!current || updatedAt > current) {
      categoryLastModified.set(routeParam, updatedAt);
    }
  }

  await logRequestEventFromHeaders({
    headers: requestHeaders,
    path: "/sitemap.xml",
    routeType: "sitemap",
    statusCode: 200,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/insights`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: articleCanonical(a.slug),
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const teaserRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: teaserCanonical(a.slug),
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: categoryCanonical(cat),
    lastModified: categoryLastModified.get(cat) ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 1,
  }));

  const profileRoutes: MetadataRoute.Sitemap = profileRows
    .filter((row) => row.profile_slug)
    .map((row) => ({
      url: profileCanonical(row.profile_slug as string),
      lastModified: new Date(row.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const orgRoutes: MetadataRoute.Sitemap = orgRows
    .filter((row) => row.org_slug)
    .map((row) => ({
      url: orgCanonical(row.org_slug as string),
      lastModified: new Date(row.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...teaserRoutes,
    ...categoryRoutes,
    ...profileRoutes,
    ...orgRoutes,
  ];
}
