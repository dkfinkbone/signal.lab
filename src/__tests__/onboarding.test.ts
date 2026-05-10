import { buildProfileJsonDocument } from "@/lib/profile-json";
import { parseAccessRequestPayload } from "@/lib/access-requests";
import { isInviteTokenAccepted } from "@/lib/invite-tokens";
import {
  parseReturnToCookie,
  serializeReturnToCookie,
} from "@/lib/onboarding-cookie";
import {
  calculateProfileScore,
  inferCompanyNameFromEmail,
  parseContributionPayload,
  parseMemberProfilePayload,
  parseReturningMemberMagicLinkPayload,
  parseSignupDraft,
} from "@/lib/onboarding";
import type { PublicMember, PublicOrg } from "@/types";

const SITE = "https://signal-lab.connxr.com";

process.env.NEXT_PUBLIC_SITE_URL = SITE;

describe("onboarding helpers", () => {
  it("accepts work emails in signup drafts", () => {
    const draft = parseSignupDraft({
      name: "Jane Smith",
      email: "jane@acme.com",
      company: "",
      role: "Channel Account Manager",
      inviteToken: "pilot-001",
    });

    expect(draft.email).toBe("jane@acme.com");
    expect(draft.company).toBe("Acme");
  });

  it("rejects consumer domains in signup drafts", () => {
    expect(() =>
      parseSignupDraft({
        name: "Jane Smith",
        email: "jane@gmail.com",
        company: "",
        role: "Channel Account Manager",
        inviteToken: "pilot-001",
      })
    ).toThrow("Use your work email to join Signal.lab.");
  });

  it("infers company names from emails", () => {
    expect(inferCompanyNameFromEmail("sam@color-tokens.com")).toBe("Color Tokens");
  });

  it("validates contribution payloads against the picklists", () => {
    const payload = parseContributionPayload({
      accounts: [
        {
          sector: "financial-services",
          region: "emea",
          relationship: "active-pipeline",
          deal_band: "250k-1m",
        },
      ],
      domains: ["zero-trust", "microsegmentation"],
    });

    expect(payload.accounts).toHaveLength(1);
    expect(payload.domains).toEqual(["zero-trust", "microsegmentation"]);
  });

  it("rejects invalid contribution domains", () => {
    expect(() =>
      parseContributionPayload({
        accounts: [
          {
            sector: "financial-services",
            region: "emea",
            relationship: "active-pipeline",
            deal_band: "250k-1m",
          },
        ],
        domains: ["made-up-domain"],
      })
    ).toThrow("Choose only valid domains from the Signal.lab picklist.");
  });

  it("caps profile score at 100", () => {
    expect(calculateProfileScore(20, 20)).toBe(100);
  });

  it("accepts work emails for returning member sign-in links", () => {
    expect(
      parseReturningMemberMagicLinkPayload({
        email: "jane@acme.com",
      })
    ).toEqual({ email: "jane@acme.com" });
  });

  it("rejects consumer domains for returning member sign-in links", () => {
    expect(() =>
      parseReturningMemberMagicLinkPayload({
        email: "jane@gmail.com",
      })
    ).toThrow("Use the work email linked to your Signal.lab profile.");
  });

  it("accepts profile detail updates with optional linkedin", () => {
    expect(
      parseMemberProfilePayload({
        name: "Jane Smith",
        company: "Acme",
        role: "Advisor",
        linkedinUrl: "https://www.linkedin.com/in/jane-smith",
      })
    ).toEqual({
      name: "Jane Smith",
      company: "Acme",
      role: "Advisor",
      linkedinUrl: "https://www.linkedin.com/in/jane-smith",
    });
  });

  it("rejects non-linkedin profile URLs", () => {
    expect(() =>
      parseMemberProfilePayload({
        name: "Jane Smith",
        company: "Acme",
        role: "Advisor",
        linkedinUrl: "https://example.com/jane",
      })
    ).toThrow("Use a LinkedIn profile or company URL.");
  });

  it("accepts work emails for access requests", () => {
    const request = parseAccessRequestPayload({
      name: "Jane Smith",
      email: "jane@acme.com",
      company: "",
      role: "Advisor",
      sourcePath: "/join",
    });

    expect(request.email).toBe("jane@acme.com");
    expect(request.company).toBe("Acme");
  });

  it("rejects consumer domains for access requests", () => {
    expect(() =>
      parseAccessRequestPayload({
        name: "Jane Smith",
        email: "jane@gmail.com",
        company: "",
        role: "Advisor",
        sourcePath: "/join",
      })
    ).toThrow("Use your work email to request access.");
  });
});

describe("auth return cookies", () => {
  it("round-trips safe local paths", () => {
    expect(parseReturnToCookie(serializeReturnToCookie("/me"))).toBe("/me");
  });

  it("rejects protocol-relative paths", () => {
    expect(parseReturnToCookie(serializeReturnToCookie("//evil.test"))).toBeNull();
  });
});

describe("invite token behavior", () => {
  const originalTokens = process.env.PROJECT_INVITE_TOKENS;

  afterEach(() => {
    process.env.PROJECT_INVITE_TOKENS = originalTokens;
  });

  it("matches configured invite tokens exactly", () => {
    process.env.PROJECT_INVITE_TOKENS = "pilot-001,pilot-002";

    expect(isInviteTokenAccepted("pilot-002")).toBe(true);
    expect(isInviteTokenAccepted("pilot-999")).toBe(false);
  });

  it("can allow any token when none are configured", () => {
    process.env.PROJECT_INVITE_TOKENS = "";

    expect(
      isInviteTokenAccepted("open-pilot-token", { allowAnyWhenUnconfigured: true })
    ).toBe(true);
    expect(isInviteTokenAccepted("open-pilot-token")).toBe(false);
  });
});

describe("buildProfileJsonDocument", () => {
  const member: PublicMember = {
    id: "member-1",
    name: "Jane Smith",
    email: "jane@acme.com",
    company: "Acme",
    role: "Advisor",
    org_domain: "acme.com",
    profile_slug: "jane-smith",
    profile_score: 14,
    verified_at: "2026-05-10T00:00:00Z",
    updated_at: "2026-05-10T00:00:00Z",
  };

  const org: PublicOrg = {
    id: "org-1",
    name: "Acme",
    org_slug: "acme",
    org_domain: "acme.com",
    updated_at: "2026-05-10T00:00:00Z",
  };

  it("builds a linked person document with org and insight references", () => {
    const payload = buildProfileJsonDocument({
      member,
      accounts: [
        {
          sector: "financial-services",
          region: "emea",
          relationship: "active-pipeline",
          deal_band: "250k-1m",
        },
      ],
      domains: ["zero-trust", "microsegmentation"],
      insights: [{ slug: "example-article" }],
      org,
      colleagues: [{ profile_slug: "alex-doe" }],
      updatedAt: "2026-05-10T12:00:00Z",
    });

    expect(payload["@type"]).toBe("Person");
    expect(payload.url).toBe(`${SITE}/p/jane-smith`);
    expect(
      ((payload.worksFor as Record<string, unknown>).url as string | undefined) ?? ""
    ).toBe(`${SITE}/org/acme`);
    expect(
      ((payload.expertise as Record<string, unknown>).categories as string[]) ?? []
    ).toEqual(["zero-trust", "microsegmentation"]);
    expect((payload.insights as string[]) ?? []).toEqual([
      `${SITE}/insights/example-article`,
    ]);
  });
});
