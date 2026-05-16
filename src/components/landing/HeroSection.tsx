import Link from "next/link";
import HeroGraphic from "./HeroGraphic";

const processCards = [
  {
    title: "Supplier research",
    detail: "Find verified category experts.",
  },
  {
    title: "Due diligence",
    detail: "Validate expertise and proof.",
  },
  {
    title: "Shortlisting",
    detail: "Rank by fit, depth, and coverage.",
  },
  {
    title: "Intro routing",
    detail: "Connect to the right human.",
  },
];

const skillFiles = [
  {
    fileName: "sarah_k.json",
    role: "Channel consultant",
    category: "Zero Trust",
    depthYears: "11",
    sector: "FS / EMEA",
    contactPath: "/join/sarah-k",
  },
  {
    fileName: "miles_r.json",
    role: "Vendor specialist",
    category: "IAM",
    depthYears: "8",
    sector: "Public sector",
    contactPath: "/join/miles-r",
  },
  {
    fileName: "helen_t.json",
    role: "Partner AE",
    category: "SASE",
    depthYears: "9",
    sector: "Mid-market",
    contactPath: "/join/helen-t",
  },
];

export default function HeroSection() {
  return (
    <section className="border-b border-[#1E1C1A] pb-14 md:pb-[4.5rem]">
      <div className="mx-auto max-w-3xl text-center">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#888780]"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          Trust graph for agentic business processes
        </p>
        <h1
          className="mt-4 text-4xl font-medium leading-tight text-[#F1EFE8] md:text-6xl"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          Agents generate possibilities.
          <br />
          Trusted networks execute <span className="text-[#1D9E75]">reality.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#888780] md:text-base">
          Agentic business processes need deterministic access to verified human
          knowledge. Signal.lab structures expertise so agents resolve to real people,
          not hallucinations.
        </p>
        <Link
          href="/join"
          className="mt-8 inline-flex items-center rounded-full border border-[#1D9E75] bg-[#0C1A16] px-5 py-3 text-sm font-medium text-[#F1EFE8] transition-colors hover:bg-[#13231e]"
        >
          Request access -&gt;
        </Link>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:gap-6">
        <div className="order-2 rounded-[22px] border border-[#2C2C2A] bg-[#141311] p-5 lg:order-1">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#888780]"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Agentic process
          </p>
          <pre className="mt-4 overflow-x-auto rounded-[16px] border border-[#2C2C2A] bg-[#11100f] p-4 text-sm leading-6 text-[#F1EFE8]">
            <code style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
              {`agent.run(
  "identify Zero Trust specialists
   covering FS sector, EMEA"
)`}
            </code>
          </pre>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {processCards.map((item) => (
              <article
                key={item.title}
                className="rounded-[16px] border border-[#2C2C2A] bg-[#11100f] p-4"
              >
                <h2 className="text-sm font-medium text-[#F1EFE8]">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#888780]">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="order-1 rounded-[22px] border border-[#2C2C2A] bg-[#141311] p-5 lg:order-2">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A73D0]"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Signal.lab graph
          </p>
          <div className="mt-4">
            <HeroGraphic />
          </div>
          <div className="mt-5 rounded-[16px] border border-[#2C2C2A] bg-[#11100f] p-4">
            <p
              className="text-[11px] uppercase tracking-[0.16em] text-[#888780]"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              Console output
            </p>
            <div
              className="mt-3 space-y-2 text-sm text-[#D8D4CA]"
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              <p>-&gt; 3 skill files resolved</p>
              <p>-&gt; category: ZeroTrust | FS | EMEA</p>
              <p>-&gt; confidence: verified | attributed</p>
            </div>
          </div>
        </div>

        <div className="order-3 rounded-[22px] border border-[#2C2C2A] bg-[#141311] p-5">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1D9E75]"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Skill file | human expertise
          </p>
          <div className="mt-4 space-y-4">
            {skillFiles.map((file, index) => (
              <article
                key={file.fileName}
                className="landing-reveal rounded-[16px] border border-[#2C2C2A] bg-[#11100f] p-4"
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="text-sm text-[#F1EFE8]"
                    style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                  >
                    {file.fileName}
                  </span>
                  <span
                    className="rounded-full border border-[#1D9E75] bg-[#0C1A16] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#1D9E75]"
                    style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                  >
                    VERIFIED
                  </span>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-[92px_1fr] gap-3">
                    <dt
                      className="text-[#888780]"
                      style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                    >
                      role
                    </dt>
                    <dd className="text-[#F1EFE8]">{file.role}</dd>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-3">
                    <dt
                      className="text-[#888780]"
                      style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                    >
                      category
                    </dt>
                    <dd className="text-[#F1EFE8]">{file.category}</dd>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-3">
                    <dt
                      className="text-[#888780]"
                      style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                    >
                      depth_years
                    </dt>
                    <dd className="text-[#F1EFE8]">{file.depthYears}</dd>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-3">
                    <dt
                      className="text-[#888780]"
                      style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                    >
                      sector
                    </dt>
                    <dd className="text-[#F1EFE8]">{file.sector}</dd>
                  </div>
                  <div className="grid grid-cols-[92px_1fr] gap-3">
                    <dt
                      className="text-[#888780]"
                      style={{ fontFamily: "var(--font-dm-mono), monospace" }}
                    >
                      contact_path
                    </dt>
                    <dd className="text-[#F1EFE8]">{file.contactPath}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
