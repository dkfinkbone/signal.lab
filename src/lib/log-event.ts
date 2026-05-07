import type { NextRequest } from "next/server";
import { detectBotFamily } from "./bot-detection";
import { hashIp } from "./ip-hash";
import { getServiceClient } from "./supabase-service";
import type { RouteType } from "@/types";

interface HeaderSource {
  get(name: string): string | null;
}

interface LogOptions {
  req: NextRequest;
  routeType: RouteType;
  slug?: string;
  category?: string;
  statusCode?: number;
}

interface HeaderLogOptions {
  headers: HeaderSource;
  path: string;
  routeType: RouteType;
  slug?: string;
  category?: string;
  statusCode?: number;
  queryParams?: URLSearchParams | Record<string, string | string[] | undefined> | null;
}

const SENSITIVE_QUERY_KEYS = new Set([
  "token",
  "access_token",
  "refresh_token",
  "code",
]);

function extractRawIp(headers: HeaderSource): string | null {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    null
  );
}

function normalizeQueryParams(
  queryParams?: URLSearchParams | Record<string, string | string[] | undefined> | null
): Record<string, string> | null {
  if (!queryParams) return null;

  const normalized: Record<string, string> = {};

  if (queryParams instanceof URLSearchParams) {
    queryParams.forEach((value, key) => {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) return;
      normalized[key] = value;
    });
  } else {
    for (const [key, value] of Object.entries(queryParams)) {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) continue;

      if (Array.isArray(value)) {
        if (value[0]) normalized[key] = value[0];
      } else if (typeof value === "string" && value) {
        normalized[key] = value;
      }
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

async function insertRequestEvent(opts: HeaderLogOptions): Promise<void> {
  try {
    const {
      headers,
      path,
      routeType,
      slug,
      category,
      statusCode = 200,
      queryParams,
    } = opts;

    const userAgent = headers.get("user-agent") ?? null;
    const referrer = headers.get("referer") ?? null;

    const client = getServiceClient();
    const { error } = await client.from("request_events").insert({
      route_type: routeType,
      path,
      slug: slug ?? null,
      category: category ?? null,
      user_agent: userAgent,
      bot_family: detectBotFamily(userAgent),
      referrer,
      query_params: normalizeQueryParams(queryParams),
      ip_hash: hashIp(extractRawIp(headers)),
      status_code: statusCode,
    });

    if (error) {
      console.error("[logRequestEvent]", error.message);
    }
  } catch (err) {
    console.error("[logRequestEvent] unexpected error", err);
  }
}

export async function logRequestEvent(opts: LogOptions): Promise<void> {
  const { req, routeType, slug, category, statusCode } = opts;
  const url = new URL(req.url);

  await insertRequestEvent({
    headers: req.headers,
    path: url.pathname,
    routeType,
    slug,
    category,
    statusCode,
    queryParams: url.searchParams,
  });
}

export async function logRequestEventFromHeaders(
  opts: HeaderLogOptions
): Promise<void> {
  await insertRequestEvent(opts);
}
