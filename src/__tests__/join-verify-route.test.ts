import { NextRequest } from "next/server";
import {
  ONBOARDING_COOKIE_NAME,
  serializeOnboardingDraft,
} from "@/lib/onboarding-cookie";

const mocks = {
  createSupabaseAuthServerClient: jest.fn(),
  getMemberByEmail: jest.fn(),
  getOnboardingContextByEmail: jest.fn(),
  upsertMemberFromVerifiedDraft: jest.fn(),
};

jest.mock("@/lib/supabase-auth-server", () => ({
  createSupabaseAuthServerClient: mocks.createSupabaseAuthServerClient,
}));

jest.mock("@/lib/onboarding-store", () => ({
  getMemberByEmail: mocks.getMemberByEmail,
  getOnboardingContextByEmail: mocks.getOnboardingContextByEmail,
  upsertMemberFromVerifiedDraft: mocks.upsertMemberFromVerifiedDraft,
}));

import { GET } from "@/app/join/verify/route";

function createRequest(url: string, cookieValue?: string) {
  const headers = new Headers();

  if (cookieValue) {
    headers.set("cookie", `${ONBOARDING_COOKIE_NAME}=${cookieValue}`);
  }

  return new NextRequest(url, {
    headers,
  });
}

function createSupabaseClient(overrides?: {
  verifyOtp?: jest.Mock;
  exchangeCodeForSession?: jest.Mock;
  getUser?: jest.Mock;
}) {
  return {
    auth: {
      verifyOtp:
        overrides?.verifyOtp ??
        jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      exchangeCodeForSession:
        overrides?.exchangeCodeForSession ??
        jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getUser:
        overrides?.getUser ??
        jest.fn().mockResolvedValue({ data: { user: null } }),
    },
  };
}

describe("join verification callback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to the returning-member path when a consumed link already created the member", async () => {
    const request = createRequest(
      "https://signal-lab.connxr.com/join/verify?token_hash=used-token&type=signup",
      serializeOnboardingDraft({
        name: "Duncan Hart",
        email: "duncan.hart@colortokens.com",
        company: "ColorTokens",
        role: "Advisor",
        inviteToken: "invite-123",
      })
    );

    mocks.createSupabaseAuthServerClient.mockResolvedValue(
      createSupabaseClient({
        verifyOtp: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Token has expired or is invalid" },
        }),
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      })
    );
    mocks.getMemberByEmail.mockResolvedValue({
      id: "member-1",
      email: "duncan.hart@colortokens.com",
      verified_at: "2026-05-12T09:00:00.000Z",
    });

    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "https://signal-lab.connxr.com/join?error=already_verified"
    );
    expect(mocks.getMemberByEmail).toHaveBeenCalledWith(
      "duncan.hart@colortokens.com"
    );
  });

  it("uses the verified user returned by Supabase even before getUser resolves a session", async () => {
    const request = createRequest(
      "https://signal-lab.connxr.com/join/verify?token_hash=fresh-token&type=signup",
      serializeOnboardingDraft({
        name: "Duncan Hart",
        email: "duncan.hart@colortokens.com",
        company: "ColorTokens",
        role: "Advisor",
        inviteToken: "invite-123",
      })
    );

    mocks.createSupabaseAuthServerClient.mockResolvedValue(
      createSupabaseClient({
        verifyOtp: jest.fn().mockResolvedValue({
          data: {
            user: {
              email: "duncan.hart@colortokens.com",
              user_metadata: {
                onboarding_name: "Duncan Hart",
                onboarding_company: "ColorTokens",
                onboarding_role: "Advisor",
                invite_token: "invite-123",
              },
            },
          },
          error: null,
        }),
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      })
    );
    mocks.upsertMemberFromVerifiedDraft.mockResolvedValue({
      id: "member-1",
      email: "duncan.hart@colortokens.com",
    });
    mocks.getOnboardingContextByEmail.mockResolvedValue({
      accounts: [],
      domains: [],
    });

    const response = await GET(request);

    expect(mocks.upsertMemberFromVerifiedDraft).toHaveBeenCalledWith({
      name: "Duncan Hart",
      email: "duncan.hart@colortokens.com",
      company: "ColorTokens",
      role: "Advisor",
      inviteToken: "invite-123",
    });
    expect(response.headers.get("location")).toBe(
      "https://signal-lab.connxr.com/onboarding/contribute"
    );
  });
});
