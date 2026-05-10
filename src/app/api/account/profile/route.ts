import { NextRequest, NextResponse } from "next/server";
import { parseMemberProfilePayload } from "@/lib/onboarding";
import { getMemberByEmail, updateMemberProfile } from "@/lib/onboarding-store";
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

export async function PATCH(req: NextRequest) {
  const rateLimit = enforceRateLimit(req, "member-profile-write", 20, 60_000);
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

  let payload: {
    name: string;
    company: string;
    role: string;
    linkedinUrl: string | null;
  };

  try {
    payload = parseMemberProfilePayload(await req.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid profile update." },
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
    const updated = await updateMemberProfile(member.id, payload);

    return NextResponse.json({
      ok: true,
      profileSlug: updated?.profile_slug ?? member.profile_slug ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update your profile.";

    if (isMissingTableError(message)) {
      return NextResponse.json(
        { error: "The member profile schema has not been applied in Supabase yet." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
