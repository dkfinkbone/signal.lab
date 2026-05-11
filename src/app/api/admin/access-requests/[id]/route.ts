import { NextRequest, NextResponse } from "next/server";
import {
  parseAccessRequestReviewPayload,
  updateAccessRequestReview,
} from "@/lib/access-requests";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimit = enforceRateLimit(req, "admin-write", 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { id } = await params;
    const input = parseAccessRequestReviewPayload(await req.json());
    const request = await updateAccessRequestReview(id, input);

    return NextResponse.json({ request });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update access request." },
      { status: 400 }
    );
  }
}
