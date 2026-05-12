import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  AUTH_RETURN_TO_COOKIE_NAME,
  ONBOARDING_COOKIE_NAME,
  serializeOnboardingDraft,
  serializeReturnToCookie,
} from "@/lib/onboarding-cookie";
import { resolveInviteToken } from "@/lib/invite-tokens";
import { parseSignupDraft } from "@/lib/onboarding";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rateLimit = enforceRateLimit(req, "join-magic-link", 5, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let draft;

  try {
    draft = parseSignupDraft(await req.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid signup request." },
      { status: 400 }
    );
  }

  const invite = await resolveInviteToken(draft.inviteToken, {
    allowAnyWhenUnconfigured: true,
  });

  if (!invite.accepted) {
    return NextResponse.json({ error: "Invite link not recognised." }, { status: 404 });
  }

  if (invite.accessRequest && invite.accessRequest.email !== draft.email) {
    return NextResponse.json(
      {
        error:
          "Use the work email that was approved for this invite, or request a fresh invite.",
      },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json(
      { error: "Supabase auth is not configured." },
      { status: 503 }
    );
  }

  const siteUrl = new URL(req.url).origin.replace(/\/$/, "");
  const supabase = createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email: draft.email,
    options: {
      emailRedirectTo: `${siteUrl}/join/confirm`,
      data: {
        onboarding_name: draft.name,
        onboarding_company: draft.company,
        onboarding_role: draft.role,
        invite_token: invite.token ?? draft.inviteToken,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, email: draft.email });
  response.cookies.set(ONBOARDING_COOKIE_NAME, serializeOnboardingDraft(draft), {
    httpOnly: true,
    sameSite: "lax",
    secure: siteUrl.startsWith("https://"),
    maxAge: 60 * 60,
    path: "/",
  });
  response.cookies.set(
    AUTH_RETURN_TO_COOKIE_NAME,
    serializeReturnToCookie("/onboarding/contribute"),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: siteUrl.startsWith("https://"),
      maxAge: 60 * 60,
      path: "/",
    }
  );

  return response;
}
