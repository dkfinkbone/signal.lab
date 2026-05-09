// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type WebhookPayload = {
  type?: "INSERT" | "UPDATE" | "DELETE";
  table?: string;
  schema?: string;
  record?: Record<string, unknown> | null;
  old_record?: Record<string, unknown> | null;
};

type MemberRow = {
  id: string;
  email: string;
  name: string;
  role: string | null;
  company: string | null;
  org_domain: string | null;
  org_id: string | null;
  profile_slug: string | null;
  linkedin_url: string | null;
  profile_score: number | null;
  verified_at: string | null;
};

type AccountRow = {
  sector: string;
  region: string;
  relationship: string;
  deal_band: string | null;
};

type DomainRow = {
  domain_slug: string;
};

type VendorRow = {
  vendor_slug: string;
};

type ArticleRow = {
  slug: string;
};

type OrgRow = {
  name: string;
  org_slug: string;
};

const siteUrl =
  Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://signal-lab.connxr.com";

function isMissingTableError(message?: string | null): boolean {
  if (!message) return false;

  return (
    message.includes("schema cache") ||
    message.includes("Could not find the table") ||
    message.includes("does not exist")
  );
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function memberIdFromPayload(payload: WebhookPayload): string | null {
  if (payload.table === "members") {
    return stringValue(payload.record?.id);
  }

  if (payload.table === "accounts" || payload.table === "member_domains") {
    return (
      stringValue(payload.record?.member_id) ??
      stringValue(payload.old_record?.member_id)
    );
  }

  return null;
}

async function selectOrEmpty<T>(
  query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const { data, error } = await query;
  if (error) {
    if (!isMissingTableError(error.message)) {
      console.error(error.message);
    }
    return [];
  }

  return data ?? [];
}

Deno.serve(async (request) => {
  try {
    const payload = (await request.json()) as WebhookPayload;
    const memberId = memberIdFromPayload(payload);

    if (!memberId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing member id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing Supabase function secrets" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select(
        "id, email, name, role, company, org_domain, org_id, profile_slug, linkedin_url, profile_score, verified_at"
      )
      .eq("id", memberId)
      .single();

    const memberRow = (member ?? null) as MemberRow | null;

    if (memberError || !memberRow) {
      return new Response(
        JSON.stringify({ ok: false, error: memberError?.message ?? "Member not found" }),
        {
          status: isMissingTableError(memberError?.message) ? 202 : 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const [accounts, domains, vendors, insights] = await Promise.all([
      selectOrEmpty<AccountRow>(
        supabase
          .from("accounts")
          .select("sector, region, relationship, deal_band")
          .eq("member_id", memberId)
      ),
      selectOrEmpty<DomainRow>(
        supabase
          .from("member_domains")
          .select("domain_slug")
          .eq("member_id", memberId)
      ),
      selectOrEmpty<VendorRow>(
        supabase
          .from("member_vendors")
          .select("vendor_slug")
          .eq("member_id", memberId)
      ),
      selectOrEmpty<ArticleRow>(
        supabase
          .from("articles")
          .select("slug")
          .eq("author_email", memberRow.email)
          .eq("status", "published")
      ),
    ]);

    let org: OrgRow | null = null;
    let colleagues: string[] = [];

    if (memberRow.org_id) {
      const { data: orgRow, error: orgError } = await supabase
        .from("orgs")
        .select("name, org_slug")
        .eq("id", memberRow.org_id)
        .single();

      const typedOrgRow = (orgRow ?? null) as OrgRow | null;

      if (!orgError && typedOrgRow) {
        org = typedOrgRow;
      } else if (orgError && !isMissingTableError(orgError.message)) {
        console.error(orgError.message);
      }

      const colleagueRows = await selectOrEmpty<{ profile_slug: string | null }>(
        supabase
          .from("members")
          .select("profile_slug")
          .eq("org_id", memberRow.org_id)
          .neq("id", memberId)
          .not("profile_slug", "is", null)
          .not("verified_at", "is", null)
      );

      colleagues = colleagueRows
        .map((row) => row.profile_slug)
        .filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
        .map((slug) => `${siteUrl}/p/${slug}`);
    }

    const profileSlug = memberRow.profile_slug ?? memberRow.id;
    const profileJson = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: memberRow.name,
      jobTitle: memberRow.role ?? undefined,
      worksFor: memberRow.company
        ? {
            "@type": "Organization",
            name: memberRow.company,
            url: org ? `${siteUrl}/org/${org.org_slug}` : undefined,
          }
        : undefined,
      url: `${siteUrl}/p/${profileSlug}`,
      sameAs: memberRow.linkedin_url ? [memberRow.linkedin_url] : undefined,
      expertise: {
        categories: domains.map((domain) => domain.domain_slug),
        vendors: vendors.map((vendor) => vendor.vendor_slug),
        depth: accounts.some((account) => account.relationship === "active-pipeline")
          ? "deal-experience"
          : accounts.some(
                (account) => account.relationship === "existing-customer"
              )
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
            org_page: `${siteUrl}/org/${org.org_slug}`,
            colleagues: colleagues.length > 0 ? colleagues : undefined,
            practice: memberRow.org_domain ?? undefined,
          }
        : undefined,
      insights:
        insights.length > 0
          ? insights.map((article) => `${siteUrl}/insights/${article.slug}`)
          : undefined,
      mcp_endpoint: `${siteUrl}/api/mcp/p/${profileSlug}`,
      profile_score: memberRow.profile_score ?? 0,
      verified_at: memberRow.verified_at,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("members")
      .update({
        profile_json: profileJson,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId);

    if (updateError) {
      return new Response(
        JSON.stringify({ ok: false, error: updateError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, member_id: memberId, profile_slug: profileSlug }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
