import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPublishedArticles } from "@/lib/articles";
import { homeJsonLd } from "@/lib/json-ld";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { homePageMetadata } from "@/lib/metadata";
import AudienceLanes from "@/components/landing/AudienceLanes";
import FooterCTA from "@/components/landing/FooterCTA";
import HeroSection from "@/components/landing/HeroSection";
import InsightsFeed from "@/components/landing/InsightsFeed";
import TrustStackSection from "@/components/landing/TrustStackSection";

export const metadata: Metadata = homePageMetadata();

interface HomePageProps {
  searchParams?: Promise<{
    token?: string | string[];
  }>;
}

function getSingleSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const searchParamPromise = searchParams ?? Promise.resolve<{ token?: string | string[] }>({});
  const [articles, requestHeaders, resolvedSearchParams] = await Promise.all([
    getPublishedArticles(),
    headers(),
    searchParamPromise,
  ]);

  const categories = [...new Set(articles.map((article) => article.category).filter(Boolean))];
  const claimToken = getSingleSearchParam(resolvedSearchParams.token);
  const jsonLd = homeJsonLd();

  await logRequestEventFromHeaders({
    headers: requestHeaders,
    path: "/",
    routeType: "home",
    statusCode: 200,
  });

  return (
    <>
      <style>{`
        .landing-flow-line {
          stroke-dasharray: 8 10;
        }

        .landing-reveal {
          opacity: 1;
        }

        @media (prefers-reduced-motion: no-preference) {
          .landing-flow-line {
            animation: landing-flow 7s linear infinite;
          }

          .landing-flow-line-reverse {
            animation-direction: reverse;
          }

          .landing-node-pulse {
            transform-origin: center;
            animation: landing-pulse 4.8s ease-in-out infinite;
          }

          .landing-reveal {
            opacity: 0;
            animation: landing-reveal 0.55s ease forwards;
          }
        }

        @keyframes landing-flow {
          to {
            stroke-dashoffset: -72;
          }
        }

        @keyframes landing-pulse {
          0%,
          100% {
            opacity: 0.72;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }

        @keyframes landing-reveal {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative left-1/2 right-1/2 -mt-10 -mb-10 w-screen -translate-x-1/2 overflow-hidden bg-[#0e0d0c] text-[#F1EFE8]">
        <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-8 md:py-14">
          <HeroSection />
          <TrustStackSection />
          <AudienceLanes />
          <InsightsFeed articles={articles} categories={categories} />
          <FooterCTA claimToken={claimToken} />
        </div>
      </div>
    </>
  );
}
