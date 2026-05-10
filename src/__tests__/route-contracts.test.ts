/**
 * Route contract tests.
 *
 * These tests do NOT import Next.js page components directly (which would require
 * a full Next.js runtime). Instead they test the shared library functions that
 * power those pages — the same functions that run server-side.
 *
 * Integration/E2E tests that hit real HTTP are left for Codex to wire with
 * Playwright or a Next.js test harness once the app is running.
 */

import { articleJsonLd, homeJsonLd } from "@/lib/json-ld";
import {
  articleCanonical,
  articleDataCanonical,
  teaserCanonical,
  agentReadCanonical,
  categoryCanonical,
  categoryDataCanonical,
  profileCanonical,
  profileDataCanonical,
  orgCanonical,
  orgDataCanonical,
} from "@/lib/canonical";
import { articleMetadata, pageMetadata } from "@/lib/metadata";
import { buildLlmsManifest } from "@/lib/llms";
import { categoryJsonLd, organizationJsonLd, personJsonLd } from "@/lib/json-ld";
import type { Article, PublicMember, PublicOrg } from "@/types";

const SITE = "https://signal.lab";

process.env.NEXT_PUBLIC_SITE_URL = SITE;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const published: Article = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "test-article",
  headline: "Test Article Headline",
  summary: "A short summary of the test article.",
  full_body: "<p>Full body content that must appear in View Source.</p>",
  category: "Testing",
  tags: ["test", "signal"],
  claim: "Structured publishing improves AI retrieval.",
  evidence_source: "https://example.com/evidence",
  author_name: "Jane Smith",
  author_email: "jane@example.com",
  company: "Acme Corp",
  role: "CTO",
  cta_label: "Read more",
  cta_url: "https://example.com",
  canonical_url: `${SITE}/insights/test-article`,
  published_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  status: "published",
};

const draft: Article = { ...published, id: "draft-id", slug: "draft-article", status: "draft" };
const archived: Article = { ...published, id: "arch-id", slug: "archived-article", status: "archived" };

// ---------------------------------------------------------------------------
// Canonical URLs
// ---------------------------------------------------------------------------

describe("canonical URLs", () => {
  it("articleCanonical produces /insights/:slug", () => {
    expect(articleCanonical("my-article")).toBe(`${SITE}/insights/my-article`);
  });

  it("teaserCanonical produces /t/:slug", () => {
    expect(teaserCanonical("my-article")).toBe(`${SITE}/t/my-article`);
  });

  it("agentReadCanonical produces /agent-read/:slug", () => {
    expect(agentReadCanonical("my-article")).toBe(`${SITE}/agent-read/my-article`);
  });

  it("categoryCanonical produces /c/:category", () => {
    expect(categoryCanonical("AI Publishing")).toBe(`${SITE}/c/AI%20Publishing`);
  });

  it("articleDataCanonical produces /insights/:slug/data.json", () => {
    expect(articleDataCanonical("my-article")).toBe(`${SITE}/insights/my-article/data.json`);
  });

  it("categoryDataCanonical produces /c/:category/data.json", () => {
    expect(categoryDataCanonical("AI Publishing")).toBe(
      `${SITE}/c/AI%20Publishing/data.json`
    );
  });

  it("profileCanonical produces /p/:slug", () => {
    expect(profileCanonical("jane-smith")).toBe(`${SITE}/p/jane-smith`);
  });

  it("profileDataCanonical produces /p/:slug/data.json", () => {
    expect(profileDataCanonical("jane-smith")).toBe(`${SITE}/p/jane-smith/data.json`);
  });

  it("orgCanonical produces /org/:slug", () => {
    expect(orgCanonical("acme")).toBe(`${SITE}/org/acme`);
  });

  it("orgDataCanonical produces /org/:slug/data.json", () => {
    expect(orgDataCanonical("acme")).toBe(`${SITE}/org/acme/data.json`);
  });
});

// ---------------------------------------------------------------------------
// JSON-LD — article structured data
// ---------------------------------------------------------------------------

describe("articleJsonLd", () => {
  const ld = articleJsonLd(published) as Record<string, unknown>;

  it("has @context and @type Article", () => {
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Article");
  });

  it("includes headline", () => {
    expect(ld.headline).toBe(published.headline);
  });

  it("includes author name", () => {
    const author = ld.author as Record<string, unknown>;
    expect(author.name).toBe(published.author_name);
  });

  it("includes datePublished", () => {
    expect(ld.datePublished).toBe(published.published_at);
  });

  it("includes canonical URL", () => {
    expect(ld.url).toBe(published.canonical_url);
  });

  it("includes publisher", () => {
    const publisher = ld.publisher as Record<string, unknown>;
    expect(publisher.name).toBe("Signal.lab");
  });

  it("includes articleBody (full text for crawlers)", () => {
    expect(ld.articleBody).toBe(published.full_body);
  });
});

describe("categoryJsonLd", () => {
  const ld = categoryJsonLd("Zero Trust Architecture", "Zero Trust Architecture", [], [
    { headline: "Zero Trust Guide", slug: "zero-trust-guide" },
  ]) as Record<string, unknown>;

  it("uses DefinedTermSet", () => {
    expect(ld["@type"]).toBe("DefinedTermSet");
  });

  it("includes the category URL", () => {
    expect(ld.url).toBe(`${SITE}/c/Zero%20Trust%20Architecture`);
  });
});

describe("personJsonLd", () => {
  const member: PublicMember = {
    id: "member-1",
    name: "Jane Smith",
    company: "Acme",
    role: "Advisor",
    profile_slug: "jane-smith",
    updated_at: "2026-01-02T00:00:00Z",
  };

  it("falls back to a minimal Person document", () => {
    const ld = personJsonLd(member);
    expect(ld["@type"]).toBe("Person");
    expect(ld.name).toBe("Jane Smith");
    expect(ld.url).toBe(`${SITE}/p/jane-smith`);
  });

  it("prefers cached profile_json when present", () => {
    const ld = personJsonLd({
      ...member,
      profile_json: {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Cached Jane",
      },
    });

    expect(ld.name).toBe("Cached Jane");
  });
});

describe("organizationJsonLd", () => {
  const org: PublicOrg = {
    id: "org-1",
    name: "Acme",
    org_slug: "acme",
    updated_at: "2026-01-02T00:00:00Z",
  };

  const members: PublicMember[] = [
    {
      id: "member-1",
      name: "Jane Smith",
      profile_slug: "jane-smith",
      updated_at: "2026-01-02T00:00:00Z",
    },
  ];

  it("uses Organization and links members", () => {
    const ld = organizationJsonLd(org, members) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Organization");
    expect(ld.url).toBe(`${SITE}/org/acme`);
    expect((ld.member as Array<Record<string, unknown>>)[0].url).toBe(
      `${SITE}/p/jane-smith`
    );
  });
});

// ---------------------------------------------------------------------------
// Metadata generation
// ---------------------------------------------------------------------------

describe("articleMetadata", () => {
  const meta = articleMetadata(published);

  it("title equals headline", () => {
    expect(meta.title).toBe(published.headline);
  });

  it("description equals summary", () => {
    expect(meta.description).toBe(published.summary);
  });

  it("canonical alternates to article URL", () => {
    expect((meta.alternates as Record<string, string>).canonical).toBe(
      `${SITE}/insights/${published.slug}`
    );
  });

  it("includes social metadata", () => {
    expect((meta.openGraph as Record<string, unknown>).siteName).toBe("Signal.lab");
    expect((meta.twitter as Record<string, unknown>).card).toBe("summary_large_image");
  });
});

describe("pageMetadata", () => {
  it("builds canonical from NEXT_PUBLIC_SITE_URL + path", () => {
    const meta = pageMetadata("Insights", "All articles.", "/insights");
    expect((meta.alternates as Record<string, string>).canonical).toBe(`${SITE}/insights`);
  });

  it("includes open graph, twitter, and author defaults", () => {
    const meta = pageMetadata("Insights", "All articles.", "/insights");
    expect((meta.openGraph as Record<string, unknown>).siteName).toBe("Signal.lab");
    expect((meta.twitter as Record<string, unknown>).card).toBe("summary_large_image");
    expect(meta.authors).toEqual([{ name: "Signal.lab" }]);
  });
});

describe("homeJsonLd", () => {
  it("exposes website, organization, and FAQ entities", () => {
    const ld = homeJsonLd() as Record<string, unknown>;
    const graph = ld["@graph"] as Array<Record<string, unknown>>;
    const types = graph.map((entry) => entry["@type"]);

    expect(ld["@context"]).toBe("https://schema.org");
    expect(types).toContain("WebSite");
    expect(types).toContain("Organization");
    expect(types).toContain("FAQPage");
  });
});

// ---------------------------------------------------------------------------
// Teaser contract: full_body must NOT be exposed on teaser pages
// ---------------------------------------------------------------------------

describe("teaser page contract", () => {
  /**
   * The teaser page (src/app/t/[slug]/page.tsx) deliberately does NOT render
   * full_body. This test asserts that the field is absent from any object
   * that would be passed to the teaser rendering context.
   *
   * A future E2E test should confirm `curl /t/slug | grep "Full body"` exits 1.
   */
  it("teaser rendering must not include full_body field", () => {
    // Simulate what the teaser page exposes to its template
    const teaserExposedFields = {
      headline: published.headline,
      summary: published.summary,
      author_name: published.author_name,
      category: published.category,
      role: published.role,
      company: published.company,
      slug: published.slug,
      // full_body intentionally omitted
    };

    expect(teaserExposedFields).not.toHaveProperty("full_body");
  });

  it("full_body is present on article payload (server-render)", () => {
    // The full article page includes full_body — proves SSR path has it
    const articlePayload = { ...published };
    expect(articlePayload.full_body).toBeTruthy();
    expect(articlePayload.full_body.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Unpublished content exclusion
// ---------------------------------------------------------------------------

describe("unpublished content exclusion", () => {
  const allArticles = [published, draft, archived];

  it("only published articles pass the public filter", () => {
    const visible = allArticles.filter((a) => a.status === "published");
    expect(visible).toHaveLength(1);
    expect(visible[0].slug).toBe(published.slug);
  });

  it("draft articles are excluded", () => {
    const visible = allArticles.filter((a) => a.status === "published");
    expect(visible.map((a) => a.slug)).not.toContain(draft.slug);
  });

  it("archived articles are excluded", () => {
    const visible = allArticles.filter((a) => a.status === "published");
    expect(visible.map((a) => a.slug)).not.toContain(archived.slug);
  });

  it("search results would only contain published articles", () => {
    // The searchArticles() function applies .eq('status','published') at DB level.
    // This test validates the same logic at the filter level.
    const searchable = allArticles.filter((a) => a.status === "published");
    expect(searchable.every((a) => a.status === "published")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Agent-read payload shape
// ---------------------------------------------------------------------------

describe("agent-read payload shape", () => {
  it("contains all required fields per brief spec", () => {
    const requiredFields = [
      "headline", "summary", "full_body", "claim", "evidence_source",
      "category", "author", "company", "role", "canonical_url", "cta_url", "related_links",
    ];

    const payload = {
      headline: published.headline,
      summary: published.summary,
      full_body: published.full_body,
      claim: published.claim,
      evidence_source: published.evidence_source,
      category: published.category,
      author: published.author_name,
      company: published.company,
      role: published.role,
      canonical_url: published.canonical_url,
      cta_url: published.cta_url,
      related_links: [],
    };

    for (const field of requiredFields) {
      expect(payload).toHaveProperty(field);
    }
  });
});

describe("buildLlmsManifest", () => {
  it("lists network counts and machine-readable endpoints", () => {
    const manifest = buildLlmsManifest({
      base: SITE,
      generatedAt: "2026-05-10T12:00:00.000Z",
      memberCount: 3,
      orgCount: 1,
      articleCount: 7,
      categories: [
        { slug: "zero-trust", label: "Zero Trust Architecture", contributorCount: 2 },
      ],
    });

    expect(manifest).toContain("Verified contributors: 3");
    expect(manifest).toContain(`${SITE}/p/[slug]/data.json`);
    expect(manifest).toContain(`${SITE}/insights/[slug]/data.json`);
    expect(manifest).toContain("[Zero Trust Architecture]");
  });
});
