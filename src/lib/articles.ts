import { supabaseAnon } from "./supabase-anon";
import type { Article } from "@/types";

export async function getPublishedArticles(): Promise<Article[]> {
  const { data, error } = await supabaseAnon
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[getPublishedArticles]", error.message);
    return [];
  }
  return data as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabaseAnon
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data as Article;
}

export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const { data, error } = await supabaseAnon
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("category", category)
    .order("published_at", { ascending: false });

  if (error) return [];
  return data as Article[];
}

export async function searchArticles(q: string): Promise<Article[]> {
  const { data, error } = await supabaseAnon
    .from("articles")
    .select("*")
    .eq("status", "published")
    .textSearch("fts", q, { config: "english", type: "websearch" });

  if (error) return [];
  return data as Article[];
}

// Admin: all articles (requires service role caller to pass in client)
export async function getAllArticlesAdmin(
  serviceClient: ReturnType<typeof import("./supabase-service").getServiceClient>
): Promise<Article[]> {
  const { data, error } = await serviceClient
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return [];
  return data as Article[];
}
