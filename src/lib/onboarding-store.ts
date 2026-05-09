import "server-only";

import { getPublishedArticles } from "./articles";
import { buildProfileJsonDocument } from "./profile-json";
import { getServiceClient } from "./supabase-service";
import {
  buildProfileSlugCandidate,
  calculateProfileScore,
  getEmailDomain,
  inferCompanyNameFromDomain,
  normalizeEmail,
  slugifyValue,
} from "./onboarding";
import type {
  MemberAccount,
  MemberDomain,
  OnboardingDraft,
  PublicMember,
  PublicOrg,
} from "@/types";

interface OnboardingMemberRecord extends PublicMember {
  invite_token?: string | null;
  profile_json?: Record<string, unknown> | null;
}

function isMissingTableError(message?: string | null): boolean {
  if (!message) return false;

  return (
    message.includes("schema cache") ||
    message.includes("Could not find the table") ||
    message.includes("does not exist")
  );
}

async function selectOrEmpty<T>(
  query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const { data, error } = await query;

  if (error) {
    if (!isMissingTableError(error.message)) {
      console.error("[onboarding-store]", error.message);
    }

    return [];
  }

  return data ?? [];
}

async function maybeSingle<T>(
  query: PromiseLike<{ data: T | null; error: { message: string } | null }>
): Promise<T | null> {
  const { data, error } = await query;

  if (error) {
    if (!isMissingTableError(error.message)) {
      console.error("[onboarding-store]", error.message);
    }

    return null;
  }

  return data ?? null;
}

async function buildUniqueSlug(
  table: "members" | "orgs",
  column: "profile_slug" | "org_slug",
  base: string,
  fallbackPrefix: string
): Promise<string> {
  const client = getServiceClient();
  const normalizedBase = slugifyValue(base) || fallbackPrefix;

  for (let suffix = 1; suffix < 100; suffix += 1) {
    const candidate = suffix === 1 ? normalizedBase : `${normalizedBase}-${suffix}`;

    const rows = await selectOrEmpty<Record<string, unknown>>(
      client.from(table).select(column).eq(column, candidate).limit(1)
    );

    if (rows.length === 0) {
      return candidate;
    }
  }

  return `${fallbackPrefix}-${Date.now()}`;
}

async function getOrgByDomain(domain: string): Promise<PublicOrg | null> {
  const client = getServiceClient();

  return maybeSingle<PublicOrg>(
    client
      .from("orgs")
      .select("id, name, org_slug, org_domain, created_at, updated_at")
      .eq("org_domain", domain)
      .maybeSingle()
  );
}

async function getOrgById(orgId: string): Promise<PublicOrg | null> {
  const client = getServiceClient();

  return maybeSingle<PublicOrg>(
    client
      .from("orgs")
      .select("id, name, org_slug, org_domain, created_at, updated_at")
      .eq("id", orgId)
      .maybeSingle()
  );
}

export async function getMemberByEmail(
  email: string
): Promise<OnboardingMemberRecord | null> {
  const client = getServiceClient();

  return maybeSingle<OnboardingMemberRecord>(
    client
      .from("members")
      .select(
        "id, name, email, company, role, org_domain, org_id, profile_slug, profile_score, linkedin_url, verified_at, invite_token, member_role, profile_json, created_at, updated_at"
      )
      .eq("email", normalizeEmail(email))
      .maybeSingle()
  );
}

export async function getMemberAccounts(memberId: string): Promise<MemberAccount[]> {
  const client = getServiceClient();

  return selectOrEmpty<MemberAccount>(
    client
      .from("accounts")
      .select("id, member_id, sector, region, relationship, deal_band, created_at")
      .eq("member_id", memberId)
      .order("created_at", { ascending: true })
  );
}

export async function getMemberDomains(memberId: string): Promise<MemberDomain[]> {
  const client = getServiceClient();

  return selectOrEmpty<MemberDomain>(
    client
      .from("member_domains")
      .select("id, member_id, domain_slug, created_at")
      .eq("member_id", memberId)
      .order("created_at", { ascending: true })
  );
}

export async function getOrgMembers(
  orgId: string
): Promise<OnboardingMemberRecord[]> {
  const client = getServiceClient();

  return selectOrEmpty<OnboardingMemberRecord>(
    client
      .from("members")
      .select(
        "id, name, email, company, role, org_domain, org_id, profile_slug, profile_score, linkedin_url, verified_at, invite_token, member_role, profile_json, created_at, updated_at"
      )
      .eq("org_id", orgId)
      .order("name", { ascending: true })
  );
}

async function ensureOrgForVerifiedDomain(
  domain: string,
  companyName: string
): Promise<PublicOrg | null> {
  const client = getServiceClient();
  const existingOrg = await getOrgByDomain(domain);
  if (existingOrg) {
    return existingOrg;
  }

  const domainMembers = await selectOrEmpty<{ id: string }>(
    client
      .from("members")
      .select("id")
      .eq("org_domain", domain)
      .not("verified_at", "is", null)
  );

  if (domainMembers.length < 2) {
    return null;
  }

  const orgName = companyName || inferCompanyNameFromDomain(domain) || domain;
  const orgSlug = await buildUniqueSlug("orgs", "org_slug", orgName, "org");
  const now = new Date().toISOString();

  const insertedOrg = await maybeSingle<PublicOrg>(
    client
      .from("orgs")
      .insert({
        name: orgName,
        org_slug: orgSlug,
        org_domain: domain,
        created_at: now,
        updated_at: now,
      })
      .select("id, name, org_slug, org_domain, created_at, updated_at")
      .single()
  );

  if (!insertedOrg) {
    return getOrgByDomain(domain);
  }

  const { error: updateError } = await client
    .from("members")
    .update({ org_id: insertedOrg.id, updated_at: now })
    .eq("org_domain", domain);

  if (updateError && !isMissingTableError(updateError.message)) {
    console.error("[ensureOrgForVerifiedDomain]", updateError.message);
  }

  return insertedOrg;
}

export async function refreshMemberProfileJson(memberId: string) {
  const client = getServiceClient();
  const member = await maybeSingle<OnboardingMemberRecord>(
    client
      .from("members")
      .select(
        "id, name, email, company, role, org_domain, org_id, profile_slug, profile_score, linkedin_url, verified_at, created_at, updated_at"
      )
      .eq("id", memberId)
      .single()
  );

  if (!member) {
    return null;
  }

  const [accounts, domains, org, colleagues, articles] = await Promise.all([
    getMemberAccounts(memberId),
    getMemberDomains(memberId),
    member.org_id ? getOrgById(member.org_id) : Promise.resolve(null),
    member.org_id ? getOrgMembers(member.org_id) : Promise.resolve([]),
    getPublishedArticles(),
  ]);

  const authoredInsights = articles
    .filter((article) => article.author_email === member.email)
    .map((article) => ({ slug: article.slug }));

  const profileJson = buildProfileJsonDocument({
    member,
    accounts,
    domains: domains.map((domain) => domain.domain_slug),
    insights: authoredInsights,
    org,
    colleagues: colleagues.filter((colleague) => colleague.id !== member.id),
    updatedAt: new Date().toISOString(),
  });

  const { error } = await client
    .from("members")
    .update({
      profile_json: profileJson,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (error && !isMissingTableError(error.message)) {
    console.error("[refreshMemberProfileJson]", error.message);
  }

  return profileJson;
}

export async function upsertMemberFromVerifiedDraft(draft: OnboardingDraft) {
  const client = getServiceClient();
  const now = new Date().toISOString();
  const email = normalizeEmail(draft.email);
  const orgDomain = getEmailDomain(email);
  const companyName =
    draft.company || inferCompanyNameFromDomain(orgDomain) || draft.email;
  const existing = await getMemberByEmail(email);
  const nextSlug =
    existing?.profile_slug ||
    (await buildUniqueSlug(
      "members",
      "profile_slug",
      buildProfileSlugCandidate(draft.name, companyName || orgDomain),
      "member"
    ));

  const payload = {
    name: draft.name,
    email,
    company: companyName,
    role: draft.role,
    org_domain: orgDomain,
    invite_token: draft.inviteToken ?? null,
    verified_at: existing?.verified_at ?? now,
    profile_slug: nextSlug,
    updated_at: now,
  };

  const member = existing
    ? await maybeSingle<OnboardingMemberRecord>(
        client
          .from("members")
          .update(payload)
          .eq("id", existing.id)
          .select(
            "id, name, email, company, role, org_domain, org_id, profile_slug, profile_score, linkedin_url, verified_at, invite_token, member_role, profile_json, created_at, updated_at"
          )
          .single()
      )
    : await maybeSingle<OnboardingMemberRecord>(
        client
          .from("members")
          .insert({
            ...payload,
            member_role: "contributor",
            created_at: now,
          })
          .select(
            "id, name, email, company, role, org_domain, org_id, profile_slug, profile_score, linkedin_url, verified_at, invite_token, member_role, profile_json, created_at, updated_at"
          )
          .single()
      );

  if (!member) {
    return null;
  }

  const org =
    orgDomain && companyName
      ? await ensureOrgForVerifiedDomain(orgDomain, companyName)
      : null;

  if (org && member.org_id !== org.id) {
    await maybeSingle<OnboardingMemberRecord>(
      client
        .from("members")
        .update({ org_id: org.id, updated_at: now })
        .eq("id", member.id)
        .select(
          "id, name, email, company, role, org_domain, org_id, profile_slug, profile_score, linkedin_url, verified_at, invite_token, member_role, profile_json, created_at, updated_at"
        )
        .single()
    );
  }

  await refreshMemberProfileJson(member.id);
  return getMemberByEmail(email);
}

export async function saveMemberContribution(
  memberId: string,
  payload: { accounts: MemberAccount[]; domains: string[] }
) {
  const client = getServiceClient();

  const { error: deleteAccountsError } = await client
    .from("accounts")
    .delete()
    .eq("member_id", memberId);

  if (deleteAccountsError && !isMissingTableError(deleteAccountsError.message)) {
    throw new Error(deleteAccountsError.message);
  }

  if (payload.accounts.length > 0) {
    const { error: insertAccountsError } = await client
      .from("accounts")
      .insert(
        payload.accounts.map((account) => ({
          member_id: memberId,
          sector: account.sector,
          region: account.region,
          relationship: account.relationship,
          deal_band: account.deal_band ?? null,
        }))
      );

    if (insertAccountsError) {
      throw new Error(insertAccountsError.message);
    }
  }

  const { error: deleteDomainsError } = await client
    .from("member_domains")
    .delete()
    .eq("member_id", memberId);

  if (deleteDomainsError && !isMissingTableError(deleteDomainsError.message)) {
    throw new Error(deleteDomainsError.message);
  }

  if (payload.domains.length > 0) {
    const { error: insertDomainsError } = await client
      .from("member_domains")
      .insert(
        payload.domains.map((domain) => ({
          member_id: memberId,
          domain_slug: domain,
        }))
      );

    if (insertDomainsError) {
      throw new Error(insertDomainsError.message);
    }
  }

  const profileScore = calculateProfileScore(
    payload.accounts.length,
    payload.domains.length
  );

  const { error: updateMemberError } = await client
    .from("members")
    .update({
      profile_score: profileScore,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (updateMemberError) {
    throw new Error(updateMemberError.message);
  }

  await refreshMemberProfileJson(memberId);
}

export async function getOnboardingContextByEmail(email: string): Promise<{
  member: OnboardingMemberRecord | null;
  accounts: MemberAccount[];
  domains: string[];
  org: PublicOrg | null;
  colleagues: OnboardingMemberRecord[];
}> {
  const member = await getMemberByEmail(email);

  if (!member) {
    return {
      member: null,
      accounts: [],
      domains: [],
      org: null,
      colleagues: [],
    };
  }

  const [accounts, domains, org, colleagues] = await Promise.all([
    getMemberAccounts(member.id),
    getMemberDomains(member.id),
    member.org_id ? getOrgById(member.org_id) : Promise.resolve(null),
    member.org_id ? getOrgMembers(member.org_id) : Promise.resolve([]),
  ]);

  return {
    member,
    accounts,
    domains: domains.map((domain) => domain.domain_slug),
    org,
    colleagues: colleagues.filter((colleague) => colleague.id !== member.id),
  };
}
