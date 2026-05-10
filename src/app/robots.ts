import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { siteUrl } from "@/lib/canonical";
import { logRequestEventFromHeaders } from "@/lib/log-event";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await logRequestEventFromHeaders({
    headers: await headers(),
    path: "/robots.txt",
    routeType: "robots",
    statusCode: 200,
  });

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/insights", "/insights/*", "/t/*", "/c/*", "/agent-read/*", "/api/search"],
        disallow: ["/admin", "/admin/*", "/api/admin/*"],
      },
      // Explicitly welcome LLM crawlers
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
