import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { ONBOARDING_COOKIE_NAME, parseOnboardingDraftCookie } from "@/lib/onboarding-cookie";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { upsertMemberFromVerifiedDraft } from "@/lib/onboarding-store";
import type { OnboardingDraft } from "@/types";

function resolveDraft(user: User, fallbackDraft: OnboardingDraft | null): OnboardingDraft | null {
  const metadata =
    user.user_metadata && typeof user.user_metadata === "object"
      ? (user.user_metadata as Record<string, unknown>)
      : {};
  const email = user.email ?? fallbackDraft?.email ?? "";
  const name =
    (typeof metadata.onboarding_name === "string" && metadata.onboarding_name) ||
    fallbackDraft?.name ||
    "";
  const company =
    (typeof metadata.onboarding_company === "string" && metadata.onboarding_company) ||
    fallbackDraft?.company ||
    "";
  const role =
    (typeof metadata.onboarding_role === "string" && metadata.onboarding_role) ||
    fallbackDraft?.role ||
    "";
  const inviteToken =
    (typeof metadata.invite_token === "string" && metadata.invite_token) ||
    fallbackDraft?.inviteToken ||
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

  const supabase = await createSupabaseAuthServerClient();

  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return redirectWithError(request, "verify_failed");
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return redirectWithError(request, "verify_failed");
    }
  } else {
    return redirectWithError(request, "verify_failed");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithError(request, "verify_failed");
  }

  const fallbackDraft = parseOnboardingDraftCookie(
    request.cookies.get(ONBOARDING_COOKIE_NAME)?.value
  );
  const draft = resolveDraft(user, fallbackDraft);

  if (!draft) {
    return redirectWithError(request, "verify_failed");
  }

  const member = await upsertMemberFromVerifiedDraft(draft);
  if (!member) {
    return redirectWithError(request, "schema_pending");
  }

  const response = NextResponse.redirect(new URL("/onboarding/contribute", request.url));
  response.cookies.delete(ONBOARDING_COOKIE_NAME);
  return response;
}
