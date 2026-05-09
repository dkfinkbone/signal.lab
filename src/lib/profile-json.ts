import type { MemberAccount, ProfileJsonDocument, PublicMember, PublicOrg } from "@/types";
import { articleCanonical, orgCanonical, profileCanonical, siteUrl } from "./canonical";

export function buildProfileJsonDocument(args: {
  member: PublicMember;
  accounts: MemberAccount[];
  domains: string[];
  insights: Array<{ slug: string }>;
  org: PublicOrg | null;
  colleagues: Array<{ profile_slug?: string | null }>;
  vendors?: string[];
  updatedAt?: string;
}): ProfileJsonDocument {
  const {
    member,
    accounts,
    domains,
    insights,
    org,
    colleagues,
    vendors = [],
    updatedAt = new Date().toISOString(),
  } = args;

  const profileSlug = member.profile_slug ?? member.id;
  const uniqueColleagues = colleagues
    .map((colleague) => colleague.profile_slug)
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
    .map((slug) => profileCanonical(slug));

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.role ?? undefined,
    worksFor:
      member.company || org
        ? {
            "@type": "Organization",
            name: member.company ?? org?.name,
            url: org ? orgCanonical(org.org_slug) : undefined,
          }
        : undefined,
    url: profileCanonical(profileSlug),
    sameAs: member.linkedin_url ? [member.linkedin_url] : undefined,
    expertise: {
      categories: domains,
      vendors,
      depth: accounts.some((account) => account.relationship === "active-pipeline")
        ? "deal-experience"
        : accounts.some((account) => account.relationship === "existing-customer")
          ? "practitioner"
          : "awareness",
    },
    accounts: accounts.map((account) => ({
      sector: account.sector,
      region: account.region,
      relationship: account.relationship,
      deal_band: account.deal_band ?? undefined,
    })),
    org_network: org
      ? {
          org_page: orgCanonical(org.org_slug),
          colleagues: uniqueColleagues.length > 0 ? uniqueColleagues : undefined,
          practice: member.org_domain ?? undefined,
        }
      : undefined,
    insights:
      insights.length > 0
        ? insights.map((article) => articleCanonical(article.slug))
        : undefined,
    mcp_endpoint: `${siteUrl()}/api/mcp/p/${profileSlug}`,
    profile_score: member.profile_score ?? 0,
    verified_at: member.verified_at ?? undefined,
    updated_at: updatedAt,
  };
}
