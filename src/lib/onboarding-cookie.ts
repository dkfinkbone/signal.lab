import type { OnboardingDraft } from "@/types";

export const ONBOARDING_COOKIE_NAME = "signal_lab_onboarding";
export const AUTH_RETURN_TO_COOKIE_NAME = "signal_lab_return_to";

export function serializeOnboardingDraft(draft: OnboardingDraft): string {
  return encodeURIComponent(JSON.stringify(draft));
}

export function parseOnboardingDraftCookie(
  value: string | undefined
): OnboardingDraft | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    return {
      name: typeof record.name === "string" ? record.name : "",
      email: typeof record.email === "string" ? record.email : "",
      company: typeof record.company === "string" ? record.company : "",
      role: typeof record.role === "string" ? record.role : "",
      inviteToken:
        typeof record.inviteToken === "string" && record.inviteToken.length > 0
          ? record.inviteToken
          : null,
    };
  } catch {
    return null;
  }
}

export function serializeReturnToCookie(path: string): string {
  return encodeURIComponent(path);
}

export function parseReturnToCookie(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const decoded = decodeURIComponent(value);

    if (!decoded.startsWith("/") || decoded.startsWith("//")) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
