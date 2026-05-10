import { NextRequest, NextResponse } from "next/server";
import { parseAccessRequestPayload, upsertAccessRequest } from "@/lib/access-requests";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rateLimit = enforceRateLimit(req, "access-request", 5, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const input = parseAccessRequestPayload(await req.json());
    const accessRequest = await upsertAccessRequest(input);

    return NextResponse.json(
      { ok: true, email: accessRequest.email, status: accessRequest.status },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to record the access request." },
      { status: 400 }
    );
  }
}
