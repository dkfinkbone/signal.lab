import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://signal.lab";

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
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
