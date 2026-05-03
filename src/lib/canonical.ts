const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://signal.lab";

export function canonicalFor(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function articleCanonical(slug: string): string {
  return canonicalFor(`/insights/${slug}`);
}

export function teaserCanonical(slug: string): string {
  return canonicalFor(`/t/${slug}`);
}

export function categoryCanonical(category: string): string {
  return canonicalFor(`/c/${encodeURIComponent(category)}`);
}

export function agentReadCanonical(slug: string): string {
  return canonicalFor(`/agent-read/${slug}`);
}
