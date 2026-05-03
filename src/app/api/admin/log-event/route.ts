import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-service";

// This internal route receives attribution events from middleware.
// It's not exposed externally — robots.txt disallows /api/admin/*
// Guarded by x-internal-secret header to prevent public access.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-internal-secret");
  const expected = process.env.INTERNAL_LOG_SECRET;
  if (!expected) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  if (secret !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const event = await req.json();

    // Sanitise: never trust or re-log a raw IP field if one slipped in
    delete event.raw_ip;
    delete event.ip;

    const client = getServiceClient();
    const { error } = await client.from("request_events").insert(event);

    if (error) {
      console.error("[log-event]", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[log-event] parse error", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
