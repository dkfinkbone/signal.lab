import type { Article } from "@/types";

export const ARTICLE_SELECT_COLUMNS = [
  "id",
  "slug",
  "headline",
  "summary",
  "full_body",
  "category",
  "tags",
  "claim",
  "evidence_source",
  "author_name",
  "author_email",
  "company",
  "role",
  "cta_label",
  "cta_url",
  "canonical_url",
  "published_at",
  "updated_at",
  "status",
].join(", ");

const ARTICLE_WRITE_FIELDS = [
  "slug",
  "headline",
  "summary",
  "full_body",
  "category",
  "tags",
  "claim",
  "evidence_source",
  "author_name",
  "author_email",
  "company",
  "role",
  "cta_label",
  "cta_url",
  "canonical_url",
  "published_at",
  "status",
] as const;

export type ArticleWritePayload = Omit<Article, "id" | "updated_at">;

export function pickArticleWritePayload(input: unknown): Partial<ArticleWritePayload> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const source = input as Record<string, unknown>;
  const payload: Partial<ArticleWritePayload> = {};
  const target = payload as Record<string, unknown>;

  for (const field of ARTICLE_WRITE_FIELDS) {
    const value = source[field];
    if (value !== undefined) {
      target[field] = value;
    }
  }

  return payload;
}
