import { NextResponse } from "next/server";
import {
  AUTH_RETURN_TO_COOKIE_NAME,
  ONBOARDING_COOKIE_NAME,
} from "@/lib/onboarding-cookie";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

export async function POST() {
  const supabase = await createSupabaseAuthServerClient();
  await supabase.auth.signOut({ scope: "local" });

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ONBOARDING_COOKIE_NAME);
  response.cookies.delete(AUTH_RETURN_TO_COOKIE_NAME);
  return response;
}
