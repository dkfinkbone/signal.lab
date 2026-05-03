import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-service";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/sanitize-html";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rateLimit = enforceRateLimit(req, "admin-write", 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    body.updated_at = new Date().toISOString();
    if (typeof body.full_body === "string") {
      body.full_body = sanitizeHtml(body.full_body);
    }
    if (body.status === "published" && !body.published_at) {
      body.published_at = new Date().toISOString();
    }

    const client = getServiceClient();
    const { data, error } = await client
      .from("articles")
      .update(body)
      .eq("id", id)
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rateLimit = enforceRateLimit(req, "admin-write", 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const client = getServiceClient();
  const { error } = await client.from("articles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ deleted: true });
}
