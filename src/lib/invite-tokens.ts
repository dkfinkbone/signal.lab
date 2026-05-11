export function getConfiguredInviteTokens(): string[] {
  return (
    process.env.PROJECT_INVITE_TOKENS?.split(",")
      .map((value) => value.trim())
      .filter(Boolean) ?? []
  );
}

export function hasConfiguredInviteTokens(): boolean {
  return getConfiguredInviteTokens().length > 0;
}

export function isInviteTokenAccepted(
  token: string | null | undefined,
  options?: { allowAnyWhenUnconfigured?: boolean }
): boolean {
  if (!token) return false;

  const normalized = token.trim();
  if (!normalized) return false;

  const configured = getConfiguredInviteTokens();
  if (configured.length === 0) {
    return options?.allowAnyWhenUnconfigured ?? false;
  }

  return configured.includes(normalized);
}

export interface InviteTokenResolution {
  accepted: boolean;
  token: string | null;
  source: "configured" | "access-request" | "open" | "none";
  accessRequest: import("@/types").AccessRequest | null;
}

export async function resolveInviteToken(
  token: string | null | undefined,
  options?: { allowAnyWhenUnconfigured?: boolean }
): Promise<InviteTokenResolution> {
  const normalized = token?.trim() ?? "";
  if (!normalized) {
    return {
      accepted: false,
      token: null,
      source: "none",
      accessRequest: null,
    };
  }

  const configured = getConfiguredInviteTokens();
  if (configured.includes(normalized)) {
    return {
      accepted: true,
      token: normalized,
      source: "configured",
      accessRequest: null,
    };
  }

  const { getIssuedAccessRequestByInviteToken } = await import("@/lib/access-requests");
  const accessRequest = await getIssuedAccessRequestByInviteToken(normalized);
  if (accessRequest) {
    return {
      accepted: true,
      token: normalized,
      source: "access-request",
      accessRequest,
    };
  }

  if (configured.length === 0 && (options?.allowAnyWhenUnconfigured ?? false)) {
    return {
      accepted: true,
      token: normalized,
      source: "open",
      accessRequest: null,
    };
  }

  return {
    accepted: false,
    token: normalized,
    source: "none",
    accessRequest: null,
  };
}
