import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-service";
import { articleCanonical } from "@/lib/canonical";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/sanitize-html";

export async function POST(req: NextRequest) {
  const rateLimit = enforceRateLimit(req, "admin-write", 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const client = getServiceClient();

    if (typeof body.full_body === "string") {
      body.full_body = sanitizeHtml(body.full_body);
    }

    // Auto-fill canonical_url if blank
    if (!body.canonical_url && body.slug) {
      body.canonical_url = articleCanonical(body.slug);
    }
    if (body.status === "published" && !body.published_at) {
      body.published_at = new Date().toISOString();
    }

    const { data, error } = await client
      .from("articles")
      .insert(body)
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
