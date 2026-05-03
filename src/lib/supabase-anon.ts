import { createClient } from "@supabase/supabase-js";

type SupabaseAnonClient = ReturnType<typeof createClient>;

let cachedClient: SupabaseAnonClient | null = null;
let cachedConfig: string | null = null;
let warnedMissingEnv = false;

// Lazy init avoids crashing the build during module evaluation when preview envs are absent.
export function getSupabaseAnonClient(): SupabaseAnonClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    if (!warnedMissingEnv) {
      console.error(
        "[supabase-anon] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
      warnedMissingEnv = true;
    }
    cachedClient = null;
    cachedConfig = null;
    return null;
  }

  const nextConfig = `${url}:${anon}`;
  if (!cachedClient || cachedConfig !== nextConfig) {
    cachedClient = createClient(url, anon);
    cachedConfig = nextConfig;
  }

  warnedMissingEnv = false;
  return cachedClient;
}
