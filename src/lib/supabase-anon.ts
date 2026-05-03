import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Safe to use in server components for public reads (RLS applied)
export const supabaseAnon = createClient(url, anon);
