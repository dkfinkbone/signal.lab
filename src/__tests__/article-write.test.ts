import { ARTICLE_SELECT_COLUMNS, pickArticleWritePayload } from "@/lib/article-write";

describe("pickArticleWritePayload", () => {
  it("keeps writable article fields", () => {
    const payload = pickArticleWritePayload({
      slug: "trust-gap",
      headline: "Trust Gap",
      summary: "Summary",
      full_body: "<p>Body</p>",
      category: "channel-intelligence",
      tags: ["trust", "b2b-sales"],
      claim: "Claim",
      evidence_source: "Observed deals",
      author_name: "Duncan Hart",
      author_email: "dhart@example.com",
      company: "Connxr",
      role: "Founder",
      cta_label: "Contact me",
      cta_url: "https://signal-lab.connxr.com/me",
      canonical_url: "https://signal-lab.connxr.com/insights/trust-gap",
      published_at: "2026-05-11T12:00:00.000Z",
      status: "published",
    });

    expect(payload).toEqual({
      slug: "trust-gap",
      headline: "Trust Gap",
      summary: "Summary",
      full_body: "<p>Body</p>",
      category: "channel-intelligence",
      tags: ["trust", "b2b-sales"],
      claim: "Claim",
      evidence_source: "Observed deals",
      author_name: "Duncan Hart",
      author_email: "dhart@example.com",
      company: "Connxr",
      role: "Founder",
      cta_label: "Contact me",
      cta_url: "https://signal-lab.connxr.com/me",
      canonical_url: "https://signal-lab.connxr.com/insights/trust-gap",
      published_at: "2026-05-11T12:00:00.000Z",
      status: "published",
    });
  });

  it("drops generated and system-managed fields like fts", () => {
    const payload = pickArticleWritePayload({
      id: "article-id",
      updated_at: "2026-05-11T12:00:00.000Z",
      fts: "'trust':1 'gap':2",
      status: "draft",
      slug: "trust-gap",
      headline: "Trust Gap",
      random_field: "ignore me",
    });

    expect(payload).toEqual({
      status: "draft",
      slug: "trust-gap",
      headline: "Trust Gap",
    });
  });

  it("guards the admin edit select list from pulling fts", () => {
    expect(ARTICLE_SELECT_COLUMNS).not.toContain("fts");
  });
});
