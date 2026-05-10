import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { siteUrl } from "@/lib/canonical";
import { logRequestEventFromHeaders } from "@/lib/log-event";

export const metadata: Metadata = {
  title: "About Signal.lab - Trusted B2B Technology Intelligence Network",
  description:
    "Signal.lab is a verified knowledge network for channel professionals. Contribute structured expertise, get attributed, and get found by buyers and agents.",
  alternates: {
    canonical: `${siteUrl()}/about`,
  },
  openGraph: {
    title: "About Signal.lab",
    description:
      "A trusted network where channel expertise becomes structured, attributed, and agent-readable intelligence.",
    url: `${siteUrl()}/about`,
    siteName: "Signal.lab",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const domains = [
  "EDR / Endpoint Security",
  "Firewalls / Network Security",
  "Cloud Security",
  "SASE / SD-WAN",
  "Zero Trust / Microsegmentation",
  "OT / ICS Security",
  "Identity & Access Management",
  "SIEM / SOC / Threat Intelligence",
  "Data Security / DLP",
  "GRC / Compliance",
  "Managed Services / MSSP",
  "Cloud Infrastructure",
  "Virtualisation / HCI",
  "UC&C / Collaboration",
];

const forWhom = [
  {
    role: "Channel sellers",
    detail: "Territory AEs, overlay specialists, inside sales",
  },
  {
    role: "Consultants & advisors",
    detail: "Independent practitioners, vCISOs, pre-sales",
  },
  {
    role: "Channel account managers",
    detail: "Vendor-side CAMs and partner development managers",
  },
  {
    role: "Vendor specialists",
    detail: "Product specialists, solutions engineers, field marketers",
  },
  {
    role: "Channel marketers",
    detail: "Partner marketing, demand generation, content",
  },
];

const outcomes = [
  {
    label: "For contributors",
    points: [
      "Your expertise becomes discoverable to buyers and buyer-agents",
      "You are attributed when your knowledge is cited or acted on",
      "Inbound leads and relationship discovery replace cold outreach",
      "SPIFF eligibility and deal origination signals surface to you",
    ],
  },
  {
    label: "For vendors",
    points: [
      "Channel intelligence on who covers your categories",
      "Influence the buyer narrative before competitors do",
      "Distribute SPIFF programmes to verified, active sellers",
      "Deal origination signals from structured account data",
    ],
  },
  {
    label: "For buyers",
    points: [
      "Verified, current expertise - not generic public web content",
      "Reach the people behind the data with the deepest deal knowledge",
      "Structured intelligence on vendors, routes to market, and category dynamics",
      "Agent-accessible network for programmatic research",
    ],
  },
];

export default async function AboutPage() {
  await logRequestEventFromHeaders({
    headers: await headers(),
    path: "/about",
    routeType: "about",
    statusCode: 200,
  });

  return (
    <>
      <style>{`
        .about-root {
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

        .about-inner {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .about-hero {
          padding: 5.5rem 0 5rem;
          border-bottom: 0.5px solid var(--rule);
        }

        .about-eyebrow {
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 2rem;
        }

        .about-hero h1 {
          font-family: var(--serif);
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 400;
          line-height: 1.1;
          color: var(--ink);
          margin: 0 0 2rem;
          max-width: 820px;
          letter-spacing: -0.01em;
        }

        .about-hero h1 em {
          font-style: italic;
          color: var(--ink-2);
        }

        .about-hero-sub {
          font-size: 18px;
          color: var(--ink-2);
          max-width: 580px;
          line-height: 1.65;
          margin: 0 0 3rem;
        }

        .about-cta-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
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
        }

        .btn-ghost:hover {
          color: var(--ink);
          border-color: var(--ink-2);
        }

        .about-statbar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          border-bottom: 0.5px solid var(--rule);
        }

        .about-stat {
          padding: 2.5rem 2rem 2.5rem 0;
          border-right: 0.5px solid var(--rule);
        }

        .about-stat:last-child {
          border-right: none;
        }

        .about-stat-num {
          font-family: var(--mono);
          font-size: 2.2rem;
          font-weight: 500;
          color: var(--ink);
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .about-stat-num span {
          color: var(--accent);
        }

        .about-stat-label {
          font-size: 12px;
          color: var(--ink-3);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .about-section {
          padding: 5rem 0;
          border-bottom: 0.5px solid var(--rule);
        }

        .about-section:last-of-type {
          border-bottom: none;
        }

        .section-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 3rem;
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

        .about-section h2,
        .about-bottom-cta h2 {
          font-family: var(--serif);
          font-size: clamp(1.8rem, 3vw, 2.8rem);
          font-weight: 400;
          line-height: 1.2;
          color: var(--ink);
          margin: 0 0 1.5rem;
          letter-spacing: -0.01em;
        }

        .about-bottom-cta h2 {
          font-size: clamp(2rem, 4vw, 3.5rem);
        }

        .about-section p,
        .about-bottom-cta p {
          color: var(--ink-2);
          max-width: 640px;
          margin-bottom: 1rem;
        }

        .about-bottom-cta p {
          font-size: 17px;
          margin: 0 auto 2.5rem;
        }

        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        @media (max-width: 700px) {
          .two-col {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .whom-list {
          list-style: none;
          margin: 2rem 0 0;
          padding: 0;
        }

        .whom-item {
          display: flex;
          gap: 1.5rem;
          padding: 1.25rem 0;
          border-top: 0.5px solid var(--rule);
          align-items: baseline;
        }

        .whom-item:last-child {
          border-bottom: 0.5px solid var(--rule);
        }

        .whom-role {
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
          min-width: 200px;
        }

        .whom-detail {
          font-size: 13px;
          color: var(--ink-3);
        }

        .domain-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 2rem;
        }

        .domain-pill {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.04em;
          color: var(--ink-2);
          border: 0.5px solid var(--ink-3);
          padding: 5px 12px;
          border-radius: 2px;
          transition: all 0.15s;
        }

        .domain-pill:hover {
          color: var(--accent);
          border-color: var(--accent);
          background: var(--accent-dim);
        }

        .steps {
          margin-top: 2.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--rule);
          border: 0.5px solid var(--rule);
        }

        @media (max-width: 700px) {
          .steps,
          .outcomes-grid {
            grid-template-columns: 1fr;
          }
        }

        .step {
          background: var(--paper);
          padding: 2rem;
        }

        .step:hover {
          background: var(--paper-2);
        }

        .step-n {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .step-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--ink);
          margin-bottom: 0.5rem;
        }

        .step-body {
          font-size: 13px;
          color: var(--ink-3);
          line-height: 1.6;
        }

        .outcomes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--rule);
          border: 0.5px solid var(--rule);
          margin-top: 2.5rem;
        }

        .outcome-col {
          background: var(--paper);
          padding: 2rem;
        }

        .outcome-label {
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1.5rem;
        }

        .outcome-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .outcome-list li {
          font-size: 13px;
          color: var(--ink-2);
          padding: 0.6rem 0;
          border-top: 0.5px solid var(--rule);
          line-height: 1.5;
          display: flex;
          gap: 0.75rem;
        }

        .outcome-list li::before {
          content: "->";
          color: var(--ink-3);
          flex-shrink: 0;
          font-size: 12px;
          padding-top: 1px;
        }

        .trust-items {
          margin-top: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .trust-item {
          padding: 1.5rem;
          background: var(--paper-2);
          border: 0.5px solid var(--rule);
        }

        .trust-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
          margin-bottom: 0.4rem;
        }

        .trust-body {
          font-size: 12px;
          color: var(--ink-3);
          line-height: 1.6;
        }

        .about-bottom-cta {
          padding: 6rem 0;
          text-align: center;
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(16px);
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

        .fade-up-3 {
          animation: fade-up 0.6s ease 0.2s both;
        }

        .fade-up-4 {
          animation: fade-up 0.6s ease 0.3s both;
        }
      `}</style>

      <div className="about-root">
        <div className="about-inner">
          <section className="about-hero">
            <p className="about-eyebrow fade-up">
              Trusted B2B Technology Intelligence Network
            </p>
            <h1 className="fade-up-2">
              Your expertise is being
              <br />
              searched for.
              <br />
              <em>Is it findable?</em>
            </h1>
            <p className="about-hero-sub fade-up-3">
              Signal.lab is a verified knowledge network for channel professionals.
              Contribute structured expertise. Get attributed. Get found by buyers,
              agents, and the people who close deals in your categories.
            </p>
            <div className="about-cta-row fade-up-4">
              <Link href="/join" className="btn-primary">
                Request access -&gt;
              </Link>
              <Link href="/project" className="btn-ghost">
                Read the project brief
              </Link>
            </div>
          </section>

          <div className="about-statbar">
            <div className="about-stat">
              <div className="about-stat-num">
                14<span>+</span>
              </div>
              <div className="about-stat-label">Technology categories</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">
                1<span>st</span>
              </div>
              <div className="about-stat-label">Verified channel network</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">
                0<span>px</span>
              </div>
              <div className="about-stat-label">Generic AI noise</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">Inf</div>
              <div className="about-stat-label">Agent-readable endpoints</div>
            </div>
          </div>

          <section className="about-section">
            <div className="section-label">What Signal.lab is</div>
            <div className="two-col">
              <div>
                <h2>
                  Not a platform.
                  <br />A knowledge substrate.
                </h2>
                <p>
                  Large language models and search engines can summarise everything
                  that is publicly available. They cannot recreate a trusted network
                  of verified contributors with fresh, proprietary, deal-level insight.
                </p>
                <p>
                  Signal.lab is built on a simple premise: the people with the deepest
                  knowledge of how technology is bought and sold in the channel are the
                  sellers, advisors, and specialists who live it every day. That
                  expertise currently lives in their heads, their CRM notes, and their
                  LinkedIn connections. It is invisible to the buyers, agents, and
                  vendors who need it most.
                </p>
                <p>Signal.lab makes it structured, attributed, and findable.</p>
              </div>
              <div>
                <p
                  style={{
                    color: "var(--ink-3)",
                    fontSize: "13px",
                    marginBottom: "1.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontFamily: "var(--mono)",
                  }}
                >
                  Coverage areas
                </p>
                <div className="domain-grid">
                  {domains.map((domain) => (
                    <span key={domain} className="domain-pill">
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="section-label">Who it is for</div>
            <h2>
              Built for the channel.
              <br />
              Specifically.
            </h2>
            <p>
              Signal.lab is not a general professional network. It is built for the
              people who move technology through the channel - the specialists who know
              their categories, their accounts, and their routes to market in depth.
            </p>
            <ul className="whom-list">
              {forWhom.map((entry) => (
                <li key={entry.role} className="whom-item">
                  <span className="whom-role">{entry.role}</span>
                  <span className="whom-detail">{entry.detail}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="about-section">
            <div className="section-label">How it works</div>
            <h2>
              One contribution.
              <br />
              Permanent attribution.
            </h2>
            <p>
              The onramp is designed to be fast and concrete. You do not build a
              profile - you make a contribution. The network does the rest.
            </p>
            <div className="steps">
              {[
                {
                  n: "01",
                  title: "Accept an invite",
                  body: "You are invited by someone already on the network. The invite link carries their attribution - you join a verified cluster, not a cold platform.",
                },
                {
                  n: "02",
                  title: "Name your accounts",
                  body: "List up to 10 accounts you are actively selling to - sector, region, relationship stage. No company names required. This seeds the account intelligence graph immediately.",
                },
                {
                  n: "03",
                  title: "Select your domains",
                  body: "Choose the technology categories where you have the deepest knowledge. Multi-select from a verified picklist. Your selections determine where your profile surfaces.",
                },
                {
                  n: "04",
                  title: "Your profile goes live",
                  body: "A public teaser page is published, attributed to you, linked to your organisation cluster, and indexed by search engines and LLM agents.",
                },
                {
                  n: "05",
                  title: "Invite your colleagues",
                  body: "Each colleague you add to your org cluster increases the indexing gravity of the whole group. More links equals more authority and more inbound.",
                },
                {
                  n: "06",
                  title: "Depth compounds",
                  body: "The concierge agent nudges you to add insights, account experience, and category knowledge over time. Each addition increases your relevance score and query matchability.",
                },
              ].map((step) => (
                <div key={step.n} className="step">
                  <div className="step-n">{step.n}</div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-body">{step.body}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="about-section">
            <div className="section-label">Intended outcomes</div>
            <h2>
              Value flows in
              <br />
              three directions.
            </h2>
            <div className="outcomes-grid">
              {outcomes.map((outcome) => (
                <div key={outcome.label} className="outcome-col">
                  <div className="outcome-label">{outcome.label}</div>
                  <ul className="outcome-list">
                    {outcome.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="about-section">
            <div className="section-label">The trust model</div>
            <h2>
              Attribution is
              <br />
              the product.
            </h2>
            <p>
              The value of the network comes entirely from the quality and
              verifiability of its contributors. Anonymous noise is excluded by
              design.
            </p>
            <div className="trust-items">
              {[
                {
                  title: "Verified identity",
                  body: "Work email verification as a minimum. Company affiliation is confirmed, not assumed.",
                },
                {
                  title: "Content provenance",
                  body: "Every knowledge asset is attributed to its contributor. Nothing is published without an owner.",
                },
                {
                  title: "Anti-poisoning controls",
                  body: "The agent layer flags low-quality or conflicting submissions for review before they enter the index.",
                },
                {
                  title: "Visible attribution",
                  body: "Contributor identity is shown alongside their knowledge. Not hidden behind anonymous ratings.",
                },
                {
                  title: "Agent-readable profiles",
                  body: "Every profile exposes a structured JSON endpoint. Buyer agents can query verified expertise directly.",
                },
              ].map((item) => (
                <div key={item.title} className="trust-item">
                  <div className="trust-title">{item.title}</div>
                  <div className="trust-body">{item.body}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="about-bottom-cta">
            <h2>
              The narrative belongs to
              <br />
              whoever publishes first.
            </h2>
            <p>
              If you do not structure and publish your expertise, someone else will
              shape the buyer&apos;s view of your categories before you do.
            </p>
            <div className="about-cta-row" style={{ justifyContent: "center" }}>
              <Link href="/join" className="btn-primary">
                Request access -&gt;
              </Link>
              <Link href="/project" className="btn-ghost">
                Read the full project brief
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
