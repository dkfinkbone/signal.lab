import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "About Signal.lab",
  "Signal.lab is a trust graph for agentic business processes. It structures verified human expertise, proof, and relationship proximity into machine-readable public routes.",
  "/about"
);

const principles = [
  {
    title: "Structured expertise",
    detail:
      "Contributors publish category coverage, proof snippets, and account-pattern intelligence in a format that can be read by people and machines.",
  },
  {
    title: "Deterministic discovery",
    detail:
      "Buyers and AI agents should resolve to named experts with clear ownership, not generic ranked lists or unattributed summaries.",
  },
  {
    title: "Relationship proximity",
    detail:
      "The scarce asset is not more text. It is trusted execution paths, verified attribution, and direct routes to the right human.",
  },
];

const machineSurfaces = [
  {
    label: "/llms.txt",
    detail: "Public navigation map for LLM agents.",
  },
  {
    label: "/sitemap.xml",
    detail: "Index of public pages for crawlers.",
  },
  {
    label: "/api/search?q=",
    detail: "Search endpoint for category and article discovery.",
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
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 md:p-10">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          About Signal.lab
        </p>
        <h1
          className="mt-4 max-w-3xl text-4xl leading-tight text-slate-950 md:text-5xl"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          Signal.lab turns trusted expertise into public infrastructure.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
          Signal.lab sits between LLM generation and human execution. It structures
          verified human knowledge, relationship proximity, and proof of execution so
          buyers and agents can find the right person with a real contact path.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            View homepage -&gt;
          </Link>
          <Link
            href="/insights"
            className="inline-flex items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
          >
            Browse insights -&gt;
          </Link>
          <Link
            href="/join"
            className="inline-flex items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
          >
            Request access -&gt;
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {principles.map((item) => (
          <article
            key={item.title}
            className="rounded-[22px] border border-slate-200 bg-white p-6"
          >
            <h2
              className="text-2xl leading-tight text-slate-950"
              style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            >
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 md:p-10">
        <h2
          className="text-3xl leading-tight text-slate-950"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          How the graph stays discoverable
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Public pages stay server-rendered and richly linked. The homepage, category
          routes, insights, and machine surfaces are all designed to be extractable in
          raw HTML, not hidden behind client-side rendering.
        </p>
        <dl className="mt-6 grid gap-4 md:grid-cols-3">
          {machineSurfaces.map((item) => (
            <div
              key={item.label}
              className="rounded-[20px] border border-slate-200 bg-slate-50 p-5"
            >
              <dt
                className="text-sm font-medium text-slate-950"
                style={{ fontFamily: "var(--font-dm-mono), monospace" }}
              >
                {item.label}
              </dt>
              <dd className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
