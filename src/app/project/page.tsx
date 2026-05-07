import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { logRequestEventFromHeaders } from "@/lib/log-event";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://signal.lab";

export const metadata: Metadata = {
  title: "Project Brief - Signal.lab",
  description:
    "The objectives, hypothesis, and intended outcomes of the Signal.lab trusted knowledge network. Read the full project brief.",
  alternates: {
    canonical: `${siteUrl}/project`,
  },
  openGraph: {
    title: "Signal.lab - Project Brief",
    description:
      "Objectives, phases, and intended outcomes of the Signal.lab network. A strategic briefing for contributors, vendors, and channel partners.",
    url: `${siteUrl}/project`,
    siteName: "Signal.lab",
    type: "article",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export const dynamic = "force-dynamic";

async function getSession() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Server Components cannot write cookies. A no-op keeps the soft gate
          // resilient when auth/session refresh is unavailable.
        },
      },
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session;
  } catch {
    return null;
  }
}

function isValidToken(token: string | null): boolean {
  if (!token) return false;

  const validTokens =
    process.env.PROJECT_INVITE_TOKENS?.split(",")
      .map((value) => value.trim())
      .filter(Boolean) ?? [];

  return validTokens.includes(token.trim());
}

export default async function ProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? null;
  const session = await getSession();
  const hasAccess = Boolean(session) || isValidToken(token);

  await logRequestEventFromHeaders({
    headers: await headers(),
    path: "/project",
    routeType: hasAccess ? "project" : "project_gated",
    statusCode: 200,
  });

  return (
    <>
      <style>{`
        .project-root {
          --ink: #e8e6df;
          --ink-2: #9c9a92;
          --ink-3: #5c5b56;
          --paper: #0f0f0d;
          --paper-2: #161613;
          --paper-3: #1e1e1a;
          --rule: rgba(232, 230, 223, 0.08);
          --accent: #c8f060;
          --accent-dim: rgba(200, 240, 96, 0.12);
          --serif: var(--font-dm-serif), Georgia, serif;
          --sans: var(--font-instrument), sans-serif;
          --mono: var(--font-dm-mono), monospace;
          position: relative;
          left: 50%;
          right: 50%;
          width: 100vw;
          margin-left: -50vw;
          margin-right: -50vw;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--sans);
          font-size: 16px;
          line-height: 1.7;
        }

        .project-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .project-hero {
          padding: 5.5rem 0 4rem;
          border-bottom: 0.5px solid var(--rule);
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 4rem;
          align-items: end;
        }

        @media (max-width: 700px) {
          .project-hero {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .phases {
            grid-template-columns: 1fr;
          }
        }

        .project-eyebrow {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 2rem;
        }

        .project-hero h1 {
          font-family: var(--serif);
          font-size: clamp(2.4rem, 4vw, 3.8rem);
          font-weight: 400;
          line-height: 1.1;
          color: var(--ink);
          margin: 0 0 1.5rem;
          letter-spacing: -0.01em;
        }

        .project-hero-sub {
          font-size: 17px;
          color: var(--ink-2);
          line-height: 1.65;
          margin: 0;
        }

        .project-meta {
          text-align: right;
        }

        .project-meta-row {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--ink-3);
          letter-spacing: 0.06em;
          margin-bottom: 0.75rem;
        }

        .project-meta-row strong {
          display: block;
          color: var(--ink-2);
          font-weight: 500;
          margin-top: 2px;
        }

        .project-body {
          padding: 4rem 0 5rem;
        }

        .project-section {
          padding: 4rem 0;
          border-bottom: 0.5px solid var(--rule);
        }

        .project-section:last-of-type {
          border-bottom: none;
        }

        .section-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 2.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .section-label::after {
          content: "";
          flex: 1;
          height: 0.5px;
          background: var(--rule);
        }

        .project-section h2 {
          font-family: var(--serif);
          font-size: clamp(1.7rem, 2.5vw, 2.4rem);
          font-weight: 400;
          line-height: 1.2;
          color: var(--ink);
          margin: 0 0 1.5rem;
          letter-spacing: -0.01em;
        }

        .project-section p {
          color: var(--ink-2);
          max-width: 680px;
          margin-bottom: 1rem;
          font-size: 15px;
        }

        .hypothesis {
          border-left: 2px solid var(--accent);
          padding: 1.5rem 2rem;
          background: var(--accent-dim);
          margin: 2rem 0;
        }

        .hypothesis p {
          font-size: 17px;
          color: var(--ink);
          font-style: italic;
          margin: 0;
          line-height: 1.65;
        }

        .phases {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--rule);
          border: 0.5px solid var(--rule);
          margin-top: 2.5rem;
        }

        .phase {
          background: var(--paper);
          padding: 2rem;
        }

        .phase-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.75rem;
        }

        .phase-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--ink);
          margin-bottom: 1rem;
        }

        .phase-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .phase-list li {
          font-size: 13px;
          color: var(--ink-3);
          padding: 0.5rem 0;
          border-top: 0.5px solid var(--rule);
          line-height: 1.5;
          display: flex;
          gap: 0.6rem;
        }

        .phase-list li::before {
          content: "-";
          color: var(--accent);
          flex-shrink: 0;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1px;
          background: var(--rule);
          border: 0.5px solid var(--rule);
          margin-top: 2rem;
        }

        .metric {
          background: var(--paper-2);
          padding: 1.5rem 2rem;
        }

        .metric-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 14px;
          color: var(--ink);
          font-weight: 500;
        }

        .mcp-tools {
          margin-top: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .mcp-tool {
          background: var(--paper-3);
          border: 0.5px solid var(--rule);
          padding: 1.25rem 1.5rem;
        }

        .mcp-name {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--accent);
          margin-bottom: 0.4rem;
        }

        .mcp-desc {
          font-size: 12px;
          color: var(--ink-3);
          line-height: 1.5;
        }

        .project-gate-shell {
          padding: 4rem 0 5rem;
        }

        .project-gate-overlay {
          position: relative;
          min-height: 560px;
          overflow: hidden;
        }

        .project-gate-blur {
          filter: blur(6px);
          pointer-events: none;
          user-select: none;
          opacity: 0.4;
        }

        .project-gate-panel {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--paper-2);
          border: 0.5px solid rgba(200, 240, 96, 0.3);
          padding: 2.5rem 3rem;
          text-align: center;
          max-width: 420px;
          width: min(90%, 420px);
          z-index: 10;
        }

        .project-gate-panel h3 {
          font-family: var(--serif);
          font-size: 1.6rem;
          font-weight: 400;
          color: var(--ink);
          margin-bottom: 1rem;
        }

        .project-gate-panel p {
          font-size: 14px;
          color: var(--ink-2);
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .project-gate-hint {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.06em;
          color: var(--ink-3);
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }

        .btn-primary {
          display: inline-block;
          background: var(--accent);
          color: #0f0f0d;
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.03em;
          padding: 0.75rem 1.75rem;
          border-radius: 3px;
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .btn-primary:hover {
          opacity: 0.88;
        }

        .btn-ghost {
          display: inline-block;
          font-size: 14px;
          color: var(--ink-2);
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: color 0.15s;
          border-bottom: 0.5px solid var(--ink-3);
          padding-bottom: 1px;
          margin-left: 1rem;
        }

        .btn-ghost:hover {
          color: var(--ink);
          border-color: var(--ink-2);
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-up {
          animation: fade-up 0.6s ease both;
        }

        .fade-up-2 {
          animation: fade-up 0.6s ease 0.1s both;
        }
      `}</style>

      <div className="project-root">
        <div className="project-inner">
          <section className="project-hero">
            <div>
              <p className="project-eyebrow fade-up">Project brief - confidential</p>
              <h1 className="fade-up-2">
                Building the intelligence
                <br />
                substrate for the
                <br />
                technology channel.
              </h1>
              <p className="project-hero-sub fade-up-2">
                A strategic briefing for contributors, vendors, and channel
                partners considering participation in the Signal.lab network.
              </p>
            </div>
            <div className="project-meta fade-up-2">
              <div className="project-meta-row">
                Status <strong>Active - Phase 1</strong>
              </div>
              <div className="project-meta-row">
                Updated <strong>May 2026</strong>
              </div>
              <div className="project-meta-row">
                Network <strong>signal-lab.connxr.com</strong>
              </div>
              <div className="project-meta-row">
                Stack <strong>Next.js - Supabase - Vercel</strong>
              </div>
            </div>
          </section>

          {hasAccess ? (
            <div className="project-body">
              <section className="project-section">
                <div className="section-label">Core hypothesis</div>
                <h2>
                  Verified expertise, structured
                  <br />
                  and attributed, outperforms
                  <br />
                  generic public content.
                </h2>
                <div className="hypothesis">
                  <p>
                    If channel expertise is structured, verified, and attributed at
                    the contributor level, it becomes more valuable to buyers,
                    buyer-agents, and vendors than any amount of generic public web
                    content - and the network that holds it becomes the intelligence
                    substrate for how technology is bought and sold in the channel.
                  </p>
                </div>
                <p>
                  LLMs and search engines can summarise everything that is publicly
                  available. They cannot reconstruct a trusted graph of verified
                  contributors with deal-level expertise, active account
                  relationships, and structured category knowledge. That graph has to
                  be built deliberately, one contribution at a time, with attribution
                  at every node.
                </p>
                <p>
                  The moat is not the software. It is the network - and specifically
                  the quality and verifiability of the people in it.
                </p>
              </section>

              <section className="project-section">
                <div className="section-label">Build phases</div>
                <h2>
                  Three phases.
                  <br />
                  One compounding network.
                </h2>
                <p>
                  Each phase proves a hypothesis and creates the infrastructure for
                  the next. The network becomes more valuable at each stage because
                  the data deepens and the graph grows.
                </p>
                <div className="phases">
                  <div className="phase">
                    <div className="phase-label">Phase 1 - Current</div>
                    <div className="phase-title">Prove the core loop</div>
                    <ul className="phase-list">
                      <li>Low-friction contributor onboarding</li>
                      <li>Structured personal IP JSON profiles</li>
                      <li>Public teaser pages - SSR, indexed, attributed</li>
                      <li>Soft-gated deeper content with intent tracking</li>
                      <li>Attribution experiment - prove discoverability</li>
                      <li>First org cluster - prove indexing gravity</li>
                    </ul>
                  </div>
                  <div className="phase">
                    <div className="phase-label">Phase 2 - Planned</div>
                    <div className="phase-title">Build the org graph</div>
                    <ul className="phase-list">
                      <li>Org cluster pages - auto-created, bidirectionally linked</li>
                      <li>Colleague invitation and linking flow</li>
                      <li>SPIFF programme distribution layer</li>
                      <li>Semantic search over contributor knowledge</li>
                      <li>Relevance scoring and profile depth signals</li>
                      <li>Vendor category pages with contributor attribution</li>
                    </ul>
                  </div>
                  <div className="phase">
                    <div className="phase-label">Phase 3 - Roadmap</div>
                    <div className="phase-title">Expose the MCP server</div>
                    <ul className="phase-list">
                      <li>Human endpoints - agents call verified expertise</li>
                      <li>MCP tools for expert search, org query, SPIFF eligibility</li>
                      <li>Buyer agent integration - structured deal intelligence</li>
                      <li>Vendor agent integration - channel intelligence queries</li>
                      <li>Deal origination signal pipeline</li>
                      <li>Trust agent - verification and anti-poisoning at scale</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="project-section">
                <div className="section-label">The MCP layer</div>
                <h2>
                  Humans as
                  <br />
                  callable endpoints.
                </h2>
                <p>
                  The long-term architecture treats verified network members as
                  addressable resources - not just profile pages, but structured
                  endpoints that agents can query, route to, and invoke through the
                  Model Context Protocol.
                </p>
                <p>
                  A buyer agent working on behalf of a procurement team could call the
                  network directly: find verified sellers with deal experience in
                  microsegmentation, active pipeline in financial services, EMEA
                  region. The network returns structured human endpoints. The agent
                  can extract intelligence, surface contacts, or route a request.
                </p>
                <p>
                  This is not a feature. It is a new category of infrastructure - a
                  protocol bridge between AI agents and verified human channel
                  expertise.
                </p>
                <div className="mcp-tools">
                  {[
                    {
                      name: "search_experts",
                      desc: "Query contributors by category, depth, region, and vendor relationship",
                    },
                    {
                      name: "get_profile",
                      desc: "Return structured personal IP JSON for a verified contributor",
                    },
                    {
                      name: "get_org_cluster",
                      desc: "Return all contributors in an org cluster for a given category",
                    },
                    {
                      name: "get_category_experts",
                      desc: "Find verified contributors for a technology category",
                    },
                    {
                      name: "find_spiff_eligible",
                      desc: "Return sellers eligible for a vendor SPIFF programme",
                    },
                    {
                      name: "get_account_intelligence",
                      desc: "Query anonymised account relationship data for a sector or region",
                    },
                  ].map((tool) => (
                    <div key={tool.name} className="mcp-tool">
                      <div className="mcp-name">{tool.name}()</div>
                      <div className="mcp-desc">{tool.desc}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="project-section">
                <div className="section-label">What success looks like</div>
                <h2>
                  Measurable signals.
                  <br />
                  Not vanity metrics.
                </h2>
                <p>
                  Phase 1 success is defined by whether the core attribution and
                  indexing hypothesis holds. The metrics are proxy signals - not proof
                  that ChatGPT ingested the content, but proof that the content is
                  discoverable, attributable, and worth acting on.
                </p>
                <div className="metrics">
                  {[
                    {
                      label: "Indexing signal",
                      value: "Crawler hits on teaser pages from verified bot user-agents",
                    },
                    {
                      label: "Attribution signal",
                      value: "Teaser-to-detail clickthrough without forced registration",
                    },
                    {
                      label: "Intent signal",
                      value: "Visits to gated detail pages and request-access conversions",
                    },
                    {
                      label: "Network signal",
                      value: "Org cluster formed - minimum 3 linked contributors",
                    },
                    {
                      label: "Contribution signal",
                      value: "Average profile depth score across first cohort",
                    },
                    {
                      label: "Gravity signal",
                      value: "Inbound traffic to category pages from search referrers",
                    },
                  ].map((metric) => (
                    <div key={metric.label} className="metric">
                      <div className="metric-label">{metric.label}</div>
                      <div className="metric-value">{metric.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="project-section"
                style={{ textAlign: "center", paddingBottom: "6rem" }}
              >
                <h2>Ready to contribute?</h2>
                <p
                  style={{
                    maxWidth: "440px",
                    margin: "0 auto 2rem",
                    textAlign: "center",
                  }}
                >
                  The network is in active build. Early contributors shape the
                  categories and set the standard for what verified channel expertise
                  looks like in this network.
                </p>
                <Link href="/join" className="btn-primary">
                  Request access -&gt;
                </Link>
              </section>
            </div>
          ) : (
            <div className="project-gate-shell">
              <div className="project-gate-overlay">
                <div className="project-gate-blur">
                  <div style={{ padding: "4rem 0", opacity: 0.6 }}>
                    <div
                      style={{
                        height: 24,
                        background: "var(--rule)",
                        marginBottom: 16,
                        borderRadius: 2,
                        maxWidth: 480,
                      }}
                    />
                    <div
                      style={{
                        height: 16,
                        background: "var(--rule)",
                        marginBottom: 10,
                        borderRadius: 2,
                        maxWidth: 680,
                      }}
                    />
                    <div
                      style={{
                        height: 16,
                        background: "var(--rule)",
                        marginBottom: 10,
                        borderRadius: 2,
                        maxWidth: 620,
                      }}
                    />
                    <div
                      style={{
                        height: 16,
                        background: "var(--rule)",
                        marginBottom: 10,
                        borderRadius: 2,
                        maxWidth: 700,
                      }}
                    />
                    <div
                      style={{
                        height: 16,
                        background: "var(--rule)",
                        marginBottom: 32,
                        borderRadius: 2,
                        maxWidth: 500,
                      }}
                    />
                    <div
                      style={{
                        height: 24,
                        background: "var(--rule)",
                        marginBottom: 16,
                        borderRadius: 2,
                        maxWidth: 360,
                      }}
                    />
                    <div
                      style={{
                        height: 16,
                        background: "var(--rule)",
                        marginBottom: 10,
                        borderRadius: 2,
                        maxWidth: 680,
                      }}
                    />
                    <div
                      style={{
                        height: 16,
                        background: "var(--rule)",
                        marginBottom: 10,
                        borderRadius: 2,
                        maxWidth: 640,
                      }}
                    />
                    <div
                      style={{
                        height: 16,
                        background: "var(--rule)",
                        borderRadius: 2,
                        maxWidth: 580,
                      }}
                    />
                  </div>
                </div>

                <div className="project-gate-panel">
                  <h3>This is a members briefing.</h3>
                  <p>
                    The full project brief is available to invited contributors and
                    verified network members.
                  </p>
                  <p className="project-gate-hint">
                    Use your invite link or request access to view the complete
                    document.
                  </p>
                  <div>
                    <Link href="/join" className="btn-primary">
                      Request access -&gt;
                    </Link>
                    <Link href="/about" className="btn-ghost">
                      Read the public overview
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
