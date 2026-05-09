import { NextRequest, NextResponse } from "next/server";
import { parseContributionPayload } from "@/lib/onboarding";
import { getMemberByEmail, saveMemberContribution } from "@/lib/onboarding-store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

function isMissingTableError(message?: string | null): boolean {
  if (!message) return false;

  return (
    message.includes("schema cache") ||
    message.includes("Could not find the table") ||
    message.includes("does not exist")
  );
}

export async function POST(req: NextRequest) {
  const rateLimit = enforceRateLimit(req, "onboarding-write", 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let payload;

  try {
    payload = parseContributionPayload(await req.json());
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid contribution request.",
      },
      { status: 400 }
    );
  }

  const member = await getMemberByEmail(user.email);
  if (!member) {
    return NextResponse.json(
      { error: "Finish the email verification step first." },
      { status: 404 }
    );
  }

  try {
    await saveMemberContribution(member.id, payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save contribution.";

    if (isMissingTableError(message)) {
      return NextResponse.json(
        { error: "The onboarding schema has not been applied in Supabase yet." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, redirectTo: "/onboarding/profile" });
}
