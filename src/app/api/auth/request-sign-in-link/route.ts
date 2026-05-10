import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  AUTH_RETURN_TO_COOKIE_NAME,
  ONBOARDING_COOKIE_NAME,
  serializeOnboardingDraft,
  serializeReturnToCookie,
} from "@/lib/onboarding-cookie";
import { parseReturningMemberMagicLinkPayload } from "@/lib/onboarding";
import { getMemberByEmail } from "@/lib/onboarding-store";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rateLimit = enforceRateLimit(req, "member-sign-in-link", 5, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let payload: { email: string };

  try {
    payload = parseReturningMemberMagicLinkPayload(await req.json());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid sign-in request." },
      { status: 400 }
    );
  }

  const member = await getMemberByEmail(payload.email);
  if (!member) {
    return NextResponse.json(
      {
        error:
          "No Signal.lab member profile was found for that email yet. Use an invite link or request access first.",
      },
      { status: 404 }
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
    email: member.email ?? payload.email,
    options: {
      emailRedirectTo: `${siteUrl}/join/verify`,
      shouldCreateUser: false,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, email: member.email ?? payload.email });
  response.cookies.set(
    ONBOARDING_COOKIE_NAME,
    serializeOnboardingDraft({
      name: member.name,
      email: member.email ?? payload.email,
      company: member.company ?? "",
      role: member.role ?? "",
      inviteToken: member.invite_token ?? null,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: siteUrl.startsWith("https://"),
      maxAge: 60 * 60,
      path: "/",
    }
  );
  response.cookies.set(
    AUTH_RETURN_TO_COOKIE_NAME,
    serializeReturnToCookie("/me"),
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
