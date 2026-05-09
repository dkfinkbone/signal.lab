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
