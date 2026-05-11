import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import {
  AUTH_RETURN_TO_COOKIE_NAME,
  ONBOARDING_COOKIE_NAME,
  parseOnboardingDraftCookie,
  parseReturnToCookie,
} from "@/lib/onboarding-cookie";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import {
  getMemberByEmail,
  getOnboardingContextByEmail,
  upsertMemberFromVerifiedDraft,
} from "@/lib/onboarding-store";
import type { OnboardingDraft } from "@/types";

function resolveDraft(user: User, fallbackDraft: OnboardingDraft | null): OnboardingDraft | null {
  const metadata =
    user.user_metadata && typeof user.user_metadata === "object"
      ? (user.user_metadata as Record<string, unknown>)
      : {};
  const email = user.email ?? fallbackDraft?.email ?? "";
  const name =
    fallbackDraft?.name ||
    (typeof metadata.onboarding_name === "string" && metadata.onboarding_name) ||
    "";
  const company =
    fallbackDraft?.company ||
    (typeof metadata.onboarding_company === "string" && metadata.onboarding_company) ||
    "";
  const role =
    fallbackDraft?.role ||
    (typeof metadata.onboarding_role === "string" && metadata.onboarding_role) ||
    "";
  const inviteToken =
    fallbackDraft?.inviteToken ||
    (typeof metadata.invite_token === "string" && metadata.invite_token) ||
    null;

  if (!email || !name || !role) {
    return null;
  }

  return {
    name,
    email,
    company,
    role,
    inviteToken,
  };
}

function redirectWithError(request: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/join?error=${error}`, request.url));
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const code = url.searchParams.get("code");
  const type = (url.searchParams.get("type") ?? "email") as EmailOtpType;
  const fallbackDraft = parseOnboardingDraftCookie(
    request.cookies.get(ONBOARDING_COOKIE_NAME)?.value
  );

  const supabase = await createSupabaseAuthServerClient();
  let user: User | null = null;
  let authFailed = false;

  if (tokenHash) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      authFailed = true;
    } else {
      user = data.user ?? null;
    }
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      authFailed = true;
    } else {
      user = data.user ?? null;
    }
  } else {
    return redirectWithError(request, "verify_failed");
  }

  if (!user) {
    const {
      data: { user: authenticatedUser },
    } = await supabase.auth.getUser();
    user = authenticatedUser ?? null;
  }

  if (!user) {
    if (authFailed && fallbackDraft?.email) {
      const existingMember = await getMemberByEmail(fallbackDraft.email);
      if (existingMember?.verified_at) {
        return redirectWithError(request, "already_verified");
      }
    }

    return redirectWithError(request, "verify_failed");
  }

  const draft = resolveDraft(user, fallbackDraft);

  if (!draft) {
    if (authFailed && fallbackDraft?.email) {
      const existingMember = await getMemberByEmail(fallbackDraft.email);
      if (existingMember?.verified_at) {
        return redirectWithError(request, "already_verified");
      }
    }

    return redirectWithError(request, "verify_failed");
  }

  const member = await upsertMemberFromVerifiedDraft(draft);
  if (!member) {
    return redirectWithError(request, "schema_pending");
  }

  const returnTo = parseReturnToCookie(
    request.cookies.get(AUTH_RETURN_TO_COOKIE_NAME)?.value
  );
  let destination = returnTo;

  if (!destination && member.email) {
    const context = await getOnboardingContextByEmail(member.email);
    const hasContributionData =
      context.accounts.length > 0 || context.domains.length > 0;
    destination = hasContributionData ? "/me" : "/onboarding/contribute";
  }

  const response = NextResponse.redirect(
    new URL(destination ?? "/onboarding/contribute", request.url)
  );
  response.cookies.delete(ONBOARDING_COOKIE_NAME);
  response.cookies.delete(AUTH_RETURN_TO_COOKIE_NAME);
  return response;
}
