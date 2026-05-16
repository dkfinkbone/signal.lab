import Link from "next/link";
import { HOME_FAQ_ITEMS } from "@/lib/json-ld";

interface FooterCTAProps {
  claimToken?: string;
}

const machineLinks = [
  {
    href: "/llms.txt",
    label: "/llms.txt",
    detail: "LLM navigation map for the public graph.",
  },
  {
    href: "/sitemap.xml",
    label: "/sitemap.xml",
    detail: "Full crawl surface for public pages.",
  },
  {
    href: "/robots.txt",
    label: "/robots.txt",
    detail: "Crawler permissions and route guidance.",
  },
  {
    href: "/api/search?q=zero%20trust",
    label: "/api/search?q=zero trust",
    detail: "Public search endpoint for category and article queries.",
  },
];

export default function FooterCTA({ claimToken }: FooterCTAProps) {
  const hasClaimToken = Boolean(claimToken);
  const href = hasClaimToken ? `/join/${encodeURIComponent(claimToken as string)}` : "/join";
  const heading = hasClaimToken
    ? "Your skill file is waiting."
    : "Be the next logical point of contact, for buyers and for AI.";
  const subheading = hasClaimToken
    ? "You have been invited to claim your place in the graph."
    : "Signal.lab is invite-only during the pilot. Request access to join the graph.";
  const buttonLabel = hasClaimToken ? "Claim your skill file ->" : "Request access ->";

  return (
    <section className="py-14 md:py-[4.5rem]">
      <div className="rounded-[24px] border border-[#2C2C2A] bg-[#141311] p-6 md:p-8">
        <div className="border-b border-[#1E1C1A] pb-8 text-center">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#888780]"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Invite-only pilot
          </p>
          <h2
            className="mx-auto mt-4 max-w-3xl text-3xl leading-tight text-[#F1EFE8] md:text-5xl"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
          >
            {heading}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#888780]">{subheading}</p>
          <Link
            href={href}
            className="mt-6 inline-flex items-center rounded-full border border-[#1D9E75] bg-[#0C1A16] px-5 py-3 text-sm font-medium text-[#F1EFE8] transition-colors hover:bg-[#13231e]"
          >
            {buttonLabel}
          </Link>
        </div>

        <div className="grid gap-8 pt-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <div>
            <h3
              className="text-xl text-[#F1EFE8]"
              style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            >
              FAQ
            </h3>
            <div className="mt-4 space-y-3">
              {HOME_FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="rounded-[16px] border border-[#2C2C2A] bg-[#11100f] px-4 py-4"
                >
                  <summary className="cursor-pointer list-none text-sm font-medium text-[#F1EFE8]">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[#888780]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div>
            <h3
              className="text-xl text-[#F1EFE8]"
              style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            >
              For agents and crawlers
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#888780]">
              These machine surfaces stay linked in the public HTML so crawlers,
              search engines, and LLM agents can discover the graph directly.
            </p>
            <ul className="mt-4 space-y-3">
              {machineLinks.map((item) => (
                <li
                  key={item.href}
                  className="rounded-[16px] border border-[#2C2C2A] bg-[#11100f] px-4 py-4"
                >
                  <a href={item.href} className="text-sm font-medium text-[#F1EFE8] hover:text-[#1D9E75]">
                    {item.label}
                  </a>
                  <p className="mt-2 text-sm leading-7 text-[#888780]">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
