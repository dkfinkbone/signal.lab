export interface Article {
  id: string;
  slug: string;
  headline: string;
  summary: string;
  full_body: string;
  category: string;
  tags: string[];
  claim: string;
  evidence_source: string;
  author_name: string;
  author_email: string;
  company: string;
  role: string;
  cta_label: string;
  cta_url: string;
  canonical_url: string;
  published_at: string | null;
  updated_at: string;
  status: "draft" | "published" | "archived";
}

export interface PublicMember {
  id: string;
  name: string;
  email?: string | null;
  company?: string | null;
  role?: string | null;
  org_domain?: string | null;
  org_id?: string | null;
  profile_slug?: string | null;
  profile_score?: number | null;
  linkedin_url?: string | null;
  verified_at?: string | null;
  created_at?: string | null;
  updated_at: string;
  profile_json?: ProfileJsonDocument | null;
}

export interface PublicOrg {
  id: string;
  name: string;
  org_slug: string;
  org_domain?: string | null;
  created_at?: string | null;
  updated_at: string;
}

export type ProfileJsonDocument = Record<string, unknown>;

export interface RequestEvent {
  id: string;
  created_at: string;
  route_type: RouteType;
  path: string;
  slug?: string | null;
  category?: string | null;
  user_agent?: string | null;
  bot_family?: string | null;
  referrer?: string | null;
  query_params?: Record<string, string> | null;
  ip_hash?: string | null;
  status_code?: number | null;
}

export type RouteType =
  | "home"
  | "about"
  | "project"
  | "project_gated"
  | "insights_index"
  | "insights_article"
  | "teaser"
  | "category"
  | "profile"
  | "org"
  | "agent_read"
  | "search"
  | "llms"
  | "robots"
  | "sitemap";

export type BotFamily =
  | "GPTBot"
  | "OAI-SearchBot"
  | "ChatGPT-User"
  | "Googlebot"
  | "Google-InspectionTool"
  | "CCBot"
  | "PerplexityBot"
  | "ClaudeBot"
  | "anthropic-ai"
  | "Bingbot"
  | "Applebot"
  | "unknown";

export interface AgentReadPayload {
  headline: string;
  summary: string;
  full_body: string;
  claim: string;
  evidence_source: string;
  category: string;
  author: string;
  company: string;
  role: string;
  canonical_url: string;
  cta_url: string;
  related_links: { headline: string; slug: string; canonical_url: string }[];
}

export interface SearchResult {
  headline: string;
  summary: string;
  slug: string;
  category: string;
  canonical_url: string;
}
