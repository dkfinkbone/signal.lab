import TrustStackGraphic from "./TrustStackGraphic";

const stackRows = [
  {
    layer: "LLMs",
    role: "Generate and synthesise",
    signal: "answers",
  },
  {
    layer: "Agents",
    role: "Orchestrate processes",
    signal: "queries",
  },
  {
    layer: "Signal.lab",
    role: "Structure trust and expertise",
    signal: "skill files",
    highlight: true,
  },
  {
    layer: "Humans",
    role: "Build consensus and execute",
    signal: "relationships",
  },
];

export default function TrustStackSection() {
  return (
    <section className="border-b border-[#1E1C1A] py-14 md:py-[4.5rem]">
      <div className="flex items-center gap-3">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#888780]"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          Trust stack
        </p>
        <TrustStackGraphic />
      </div>

      <div className="mt-5 space-y-1">
        <p
          className="text-3xl leading-tight text-[#5F5E5A] md:text-5xl"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          Infrastructure became code.
        </p>
        <p
          className="text-3xl leading-tight text-[#5F5E5A] md:text-5xl"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          Workflows became code.
        </p>
        <p
          className="text-3xl leading-tight text-[#F1EFE8] md:text-[3.35rem]"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          Now trust networks become queryable.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-[22px] border border-[#2C2C2A] bg-[#141311]">
        <table className="min-w-full border-collapse text-left text-sm text-[#D8D4CA]">
          <thead className="bg-[#11100f] text-[#888780]">
            <tr>
              <th
                className="px-4 py-4 text-[11px] uppercase tracking-[0.18em] md:px-6"
                style={{ fontFamily: "var(--font-dm-mono), monospace" }}
              >
                Layer
              </th>
              <th
                className="px-4 py-4 text-[11px] uppercase tracking-[0.18em] md:px-6"
                style={{ fontFamily: "var(--font-dm-mono), monospace" }}
              >
                Role
              </th>
              <th
                className="px-4 py-4 text-[11px] uppercase tracking-[0.18em] md:px-6"
                style={{ fontFamily: "var(--font-dm-mono), monospace" }}
              >
                Signal
              </th>
            </tr>
          </thead>
          <tbody>
            {stackRows.map((row) => (
              <tr
                key={row.layer}
                className={`border-t border-[#1E1C1A] ${
                  row.highlight ? "bg-[#0C1A16]" : "bg-transparent"
                }`}
              >
                <th
                  scope="row"
                  className={`px-4 py-4 font-medium md:px-6 ${
                    row.highlight ? "border-l-2 border-[#1D9E75] text-[#F1EFE8]" : ""
                  }`}
                >
                  {row.layer}
                </th>
                <td className="px-4 py-4 md:px-6">{row.role}</td>
                <td className="px-4 py-4 md:px-6">{row.signal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 max-w-2xl text-base leading-7 text-[#888780]">
        The scarce asset in the AI era is not information. It is verified expertise,
        trusted attribution, and relationship proximity. That is what Signal.lab
        structures.
      </p>
    </section>
  );
}
