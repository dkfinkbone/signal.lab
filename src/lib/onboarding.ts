import { NETWORK_CATEGORIES } from "./categories";
import type { MemberAccount, OnboardingDraft } from "@/types";

export const ACCOUNT_SECTOR_OPTIONS = [
  { value: "financial-services", label: "Financial Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "public-sector", label: "Public Sector" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "energy", label: "Energy" },
  { value: "legal", label: "Legal" },
  { value: "education", label: "Education" },
  { value: "technology", label: "Technology" },
  { value: "telecoms", label: "Telecoms" },
] as const;

export const ACCOUNT_REGION_OPTIONS = [
  { value: "uk", label: "UK" },
  { value: "emea", label: "EMEA" },
  { value: "apac", label: "APAC" },
  { value: "americas", label: "Americas" },
  { value: "global", label: "Global" },
] as const;

export const ACCOUNT_RELATIONSHIP_OPTIONS = [
  { value: "active-pipeline", label: "Active Pipeline" },
  { value: "existing-customer", label: "Existing Customer" },
  { value: "lapsed", label: "Lapsed" },
] as const;

export const DEAL_BAND_OPTIONS = [
  { value: "<50k", label: "<£50k" },
  { value: "50k-250k", label: "£50k-£250k" },
  { value: "250k-1m", label: "£250k-£1M" },
  { value: "1m+", label: "£1M+" },
] as const;

export const DOMAIN_OPTIONS = NETWORK_CATEGORIES.map((category) => ({
  value: category.slug,
  label: category.label,
}));

const CONSUMER_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "outlook.co.uk",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.co.uk",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "gmx.com",
  "mail.com",
  "yandex.com",
  "zoho.com",
]);

const VALID_SECTOR_VALUES = new Set(ACCOUNT_SECTOR_OPTIONS.map((option) => option.value));
const VALID_REGION_VALUES = new Set(ACCOUNT_REGION_OPTIONS.map((option) => option.value));
const VALID_RELATIONSHIP_VALUES = new Set(
  ACCOUNT_RELATIONSHIP_OPTIONS.map((option) => option.value)
);
const VALID_DEAL_BAND_VALUES = new Set(DEAL_BAND_OPTIONS.map((option) => option.value));
const VALID_DOMAIN_VALUES = new Set(DOMAIN_OPTIONS.map((option) => option.value));

function getStringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function requireObject(value: unknown, errorMessage: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(errorMessage);
  }

  return value as Record<string, unknown>;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getEmailDomain(email: string): string | null {
  const normalized = normalizeEmail(email);
  const parts = normalized.split("@");
  if (parts.length !== 2 || !parts[1]) return null;
  return parts[1];
}

export function isConsumerEmailDomain(domain: string | null): boolean {
  if (!domain) return true;
  return CONSUMER_EMAIL_DOMAINS.has(domain.toLowerCase());
}

export function isWorkEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain || !domain.includes(".")) return false;
  return !isConsumerEmailDomain(domain);
}

export function inferCompanyNameFromDomain(domain: string | null): string {
  if (!domain) return "";

  const [rawLabel] = domain.split(".");
  if (!rawLabel) return "";

  return rawLabel
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function inferCompanyNameFromEmail(email: string): string {
  return inferCompanyNameFromDomain(getEmailDomain(email));
}

export function slugifyValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildProfileSlugCandidate(
  name: string,
  companyOrDomain?: string | null
): string {
  return slugifyValue([name, companyOrDomain].filter(Boolean).join("-"));
}

export function calculateProfileScore(accountCount: number, domainCount: number): number {
  return Math.min(100, accountCount * 4 + domainCount * 6);
}

export function parseSignupDraft(payload: unknown): OnboardingDraft {
  const record = requireObject(payload, "Invalid signup request.");
  const name = getStringField(record, "name");
  const email = normalizeEmail(getStringField(record, "email"));
  const inviteToken = getStringField(record, "inviteToken");
  const role = getStringField(record, "role");
  const company =
    getStringField(record, "company") || inferCompanyNameFromEmail(email);

  if (name.length < 2) {
    throw new Error("Enter your full name.");
  }

  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  if (!isWorkEmail(email)) {
    throw new Error("Use your work email to join Signal.lab.");
  }

  if (!role) {
    throw new Error("Add your current role.");
  }

  if (!inviteToken) {
    throw new Error("Invite token missing.");
  }

  return {
    name,
    email,
    company,
    role,
    inviteToken,
  };
}

export function parseContributionPayload(payload: unknown): {
  accounts: MemberAccount[];
  domains: string[];
} {
  const record = requireObject(payload, "Invalid contribution request.");
  const rawAccounts = Array.isArray(record.accounts) ? record.accounts : null;
  const rawDomains = Array.isArray(record.domains) ? record.domains : null;

  if (!rawAccounts || rawAccounts.length === 0) {
    throw new Error("Add at least one active account.");
  }

  if (rawAccounts.length > 10) {
    throw new Error("You can add up to 10 active accounts.");
  }

  const accounts = rawAccounts.map((entry) => {
    const account = requireObject(entry, "Invalid account row.");
    const sector = getStringField(account, "sector");
    const region = getStringField(account, "region");
    const relationship = getStringField(account, "relationship");
    const dealBand = getStringField(account, "deal_band");

    if (!VALID_SECTOR_VALUES.has(sector as (typeof ACCOUNT_SECTOR_OPTIONS)[number]["value"])) {
      throw new Error("Choose a valid sector.");
    }

    if (!VALID_REGION_VALUES.has(region as (typeof ACCOUNT_REGION_OPTIONS)[number]["value"])) {
      throw new Error("Choose a valid region.");
    }

    if (
      !VALID_RELATIONSHIP_VALUES.has(
        relationship as (typeof ACCOUNT_RELATIONSHIP_OPTIONS)[number]["value"]
      )
    ) {
      throw new Error("Choose a valid relationship stage.");
    }

    if (
      dealBand &&
      !VALID_DEAL_BAND_VALUES.has(dealBand as (typeof DEAL_BAND_OPTIONS)[number]["value"])
    ) {
      throw new Error("Choose a valid deal band.");
    }

    return {
      sector,
      region,
      relationship,
      deal_band: dealBand || null,
    };
  });

  if (!rawDomains || rawDomains.length === 0) {
    throw new Error("Choose at least one domain.");
  }

  const domains = [
    ...new Set(
      rawDomains
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean)
    ),
  ];

  for (const domain of domains) {
    if (!VALID_DOMAIN_VALUES.has(domain)) {
      throw new Error("Choose only valid domains from the Signal.lab picklist.");
    }
  }

  return { accounts, domains };
}
