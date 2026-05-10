export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://signal-lab.connxr.com"
  );
}

export function articlePath(slug: string): string {
  return `/insights/${slug}`;
}

export function canonicalFor(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function articleCanonical(slug: string): string {
  return canonicalFor(articlePath(slug));
}

export function articleDataCanonical(slug: string): string {
  return canonicalFor(`/insights/${slug}/data.json`);
}

export function teaserCanonical(slug: string): string {
  return canonicalFor(`/t/${slug}`);
}

export function categoryCanonical(category: string): string {
  return canonicalFor(`/c/${encodeURIComponent(category)}`);
}

export function categoryDataCanonical(category: string): string {
  return canonicalFor(`/c/${encodeURIComponent(category)}/data.json`);
}

export function agentReadCanonical(slug: string): string {
  return canonicalFor(`/agent-read/${slug}`);
}

export function profilePath(slug: string): string {
  return `/p/${slug}`;
}

export function profileCanonical(slug: string): string {
  return canonicalFor(profilePath(slug));
}

export function profileDataCanonical(slug: string): string {
  return canonicalFor(`/p/${slug}/data.json`);
}

export function orgPath(slug: string): string {
  return `/org/${slug}`;
}

export function orgCanonical(slug: string): string {
  return canonicalFor(orgPath(slug));
}

export function orgDataCanonical(slug: string): string {
  return canonicalFor(`/org/${slug}/data.json`);
}
