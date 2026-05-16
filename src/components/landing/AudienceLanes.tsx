import Link from "next/link";
import BuyerGraphic from "./BuyerGraphic";
import VendorGraphic from "./VendorGraphic";

const vendorStats = [
  "29 verified sellers mapped",
  "8 account patterns surfaced",
  "100% LLM-queryable, structured",
];

const buyerStats = [
  "Deterministic, named experts, not suggestions",
  "Attributed, every result has a real owner",
  "Structured, JSON endpoints and agent-ready records",
];

export default function AudienceLanes() {
  return (
    <section className="border-b border-[#1E1C1A] py-14 md:py-[4.5rem]">
      <div className="max-w-3xl">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#888780]"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          Audience lanes
        </p>
        <h2
          className="mt-4 text-3xl leading-tight text-[#F1EFE8] md:text-5xl"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          Publish once. Resolve for sellers, buyers, and agents.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#888780]">
          Signal.lab turns expertise, proof, and relationship context into structured
          surfaces that people can trust and agents can query.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:items-start">
        <article className="rounded-[22px] border border-[#2C2C2A] bg-[#141311] p-5">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#888780]"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Vendor and seller view
          </p>
          <h3
            className="mt-4 text-2xl leading-tight text-[#F1EFE8] md:text-3xl"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
          >
            Your channel, in code
          </h3>
          <p className="mt-4 text-base leading-7 text-[#888780]">
            Every channel partner, every verified seller, and every anonymised account
            pattern, structured, attributed, and queryable by the agents your buyers
            already run.
          </p>
          <div className="mt-5">
            <VendorGraphic />
          </div>
          <ul className="mt-5 grid gap-3 md:grid-cols-3">
            {vendorStats.map((item) => (
              <li
                key={item}
                className="rounded-[16px] border border-[#2C2C2A] bg-[#11100f] px-4 py-3 text-sm leading-6 text-[#D8D4CA]"
              >
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/project"
            className="mt-5 inline-flex items-center rounded-full border border-[#2C2C2A] px-4 py-2 text-sm font-medium text-[#F1EFE8] transition-colors hover:bg-[#1a1917]"
          >
            See how it works -&gt;
          </Link>
        </article>

        <div className="hidden h-full bg-[#1E1C1A] lg:block" />

        <article className="rounded-[22px] border border-[#2C2C2A] bg-[#141311] p-5">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#888780]"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Buyer view
          </p>
          <h3
            className="mt-4 text-2xl leading-tight text-[#F1EFE8] md:text-3xl"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
          >
            Deterministic expertise, on demand
          </h3>
          <p className="mt-4 text-base leading-7 text-[#888780]">
            Query the graph with a problem. Get back verified contributors,
            structured proof snippets, and a direct intro path, not a ranked list of
            generic results.
          </p>
          <div className="mt-5">
            <BuyerGraphic />
          </div>
          <ul className="mt-5 grid gap-3 md:grid-cols-3">
            {buyerStats.map((item) => (
              <li
                key={item}
                className="rounded-[16px] border border-[#2C2C2A] bg-[#11100f] px-4 py-3 text-sm leading-6 text-[#D8D4CA]"
              >
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/insights"
            className="mt-5 inline-flex items-center rounded-full border border-[#2C2C2A] px-4 py-2 text-sm font-medium text-[#F1EFE8] transition-colors hover:bg-[#1a1917]"
          >
            Browse insights -&gt;
          </Link>
        </article>
      </div>
    </section>
  );
}
