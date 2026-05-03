import { createHash } from "crypto";

/**
 * Returns a salted SHA-256 hash of the IP.
 * Raw IP is never persisted anywhere.
 * If IP is unavailable, returns null.
 */
export function hashIp(rawIp: string | null | undefined): string | null {
  if (!rawIp || rawIp.trim() === "") return null;
  const salt = process.env.ATTRIBUTION_SALT ?? "default-dev-salt";
  return createHash("sha256")
    .update(salt + rawIp)
    .digest("hex");
}
