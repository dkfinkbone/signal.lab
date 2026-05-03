import type { NextRequest } from "next/server";
import { hashIp } from "./ip-hash";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function getClientKey(req: NextRequest, scope: string): string {
  const rawIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "";
  const hashedIp = hashIp(rawIp);
  const userAgent = req.headers.get("user-agent") ?? "unknown";
  return `${scope}:${hashedIp ?? userAgent}`;
}

export function enforceRateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const key = getClientKey(req, scope);
  const existing = buckets.get(key);

  const bucket =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);

  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}
