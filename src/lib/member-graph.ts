import "server-only";

import { getServiceClient } from "./supabase-service";
import type {
  ProfileJsonDocument,
  PublicMember,
  PublicOrg,
} from "@/types";

interface SlugSitemapEntry {
  profile_slug?: string | null;
  org_slug?: string | null;
  updated_at: string;
}

function isMissingTableError(message?: string | null): boolean {
  if (!message) return false;

  return (
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("Could not find the table")
  );
}

function logUnexpectedError(scope: string, message?: string | null) {
  if (!isMissingTableError(message)) {
    console.error(`[${scope}]`, message);
  }
}

function getMemberGraphClient() {
  try {
    return getServiceClient();
  } catch {
    return null;
  }
}

export async function getVerifiedMemberBySlug(
  slug: string
): Promise<PublicMember | null> {
  const client = getMemberGraphClient();
  if (!client) return null;

  const { data, error } = await client
    .from("members")
    .select(
      "id, name, email, company, role, org_domain, org_id, profile_slug, profile_score, linkedin_url, verified_at, created_at, updated_at, profile_json"
    )
    .eq("profile_slug", slug)
    .not("verified_at", "is", null)
    .single();

  if (error) {
    logUnexpectedError("getVerifiedMemberBySlug", error.message);
    return null;
  }

  return data as PublicMember;
}

export async function getVerifiedOrgBySlug(
  slug: string
): Promise<PublicOrg | null> {
  const client = getMemberGraphClient();
  if (!client) return null;

  const { data, error } = await client
    .from("orgs")
    .select("id, name, org_slug, org_domain, created_at, updated_at")
    .eq("org_slug", slug)
    .single();

  if (error) {
    logUnexpectedError("getVerifiedOrgBySlug", error.message);
    return null;
  }

  return data as PublicOrg;
}

export async function getVerifiedMembersForOrg(
  orgId: string
): Promise<PublicMember[]> {
  const client = getMemberGraphClient();
  if (!client) return [];

  const { data, error } = await client
    .from("members")
    .select(
      "id, name, email, company, role, org_domain, org_id, profile_slug, profile_score, linkedin_url, verified_at, created_at, updated_at, profile_json"
    )
    .eq("org_id", orgId)
    .not("verified_at", "is", null)
    .order("name", { ascending: true });

  if (error) {
    logUnexpectedError("getVerifiedMembersForOrg", error.message);
    return [];
  }

  return (data ?? []) as PublicMember[];
}

export async function getVerifiedMemberCount(): Promise<number> {
  const client = getMemberGraphClient();
  if (!client) return 0;

  const { count, error } = await client
    .from("members")
    .select("id", { head: true, count: "exact" })
    .not("verified_at", "is", null);

  if (error) {
    logUnexpectedError("getVerifiedMemberCount", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getOrgCount(): Promise<number> {
  const client = getMemberGraphClient();
  if (!client) return 0;

  const { count, error } = await client
    .from("orgs")
    .select("id", { head: true, count: "exact" });

  if (error) {
    logUnexpectedError("getOrgCount", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getContributorCountsByDomain(): Promise<Record<string, number>> {
  const client = getMemberGraphClient();
  if (!client) return {};

  const { data, error } = await client
    .from("member_domains")
    .select("domain_slug");

  if (error) {
    logUnexpectedError("getContributorCountsByDomain", error.message);
    return {};
  }

  const rows = (data ?? []) as Array<{ domain_slug?: string | null }>;

  return rows.reduce<Record<string, number>>((acc, row) => {
    const slug = row.domain_slug;
    if (!slug) return acc;
    acc[slug] = (acc[slug] ?? 0) + 1;
    return acc;
  }, {});
}

export async function getProfileSitemapEntries(): Promise<SlugSitemapEntry[]> {
  const client = getMemberGraphClient();
  if (!client) return [];

  const { data, error } = await client
    .from("members")
    .select("profile_slug, updated_at")
    .not("profile_slug", "is", null)
    .not("verified_at", "is", null);

  if (error) {
    logUnexpectedError("getProfileSitemapEntries", error.message);
    return [];
  }

  return (data ?? []) as SlugSitemapEntry[];
}

export async function getOrgSitemapEntries(): Promise<SlugSitemapEntry[]> {
  const client = getMemberGraphClient();
  if (!client) return [];

  const { data, error } = await client
    .from("orgs")
    .select("org_slug, updated_at");

  if (error) {
    logUnexpectedError("getOrgSitemapEntries", error.message);
    return [];
  }

  return (data ?? []) as SlugSitemapEntry[];
}

export function asJsonObject(
  value: unknown
): ProfileJsonDocument | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as ProfileJsonDocument;
}

export function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
}

export function asObjectArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (entry): entry is Record<string, unknown> =>
      Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)
  );
}
