"use client";

export default function BuyerGraphic() {
  return (
    <div aria-hidden="true" className="rounded-[20px] border border-[#2C2C2A] bg-[#11100f] p-4">
      <svg viewBox="0 0 420 270" className="h-auto w-full">
        <defs>
          <linearGradient id="buyer-flow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#534AB7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="420" height="270" rx="18" fill="#11100f" />

        <rect x="22" y="34" width="108" height="70" rx="16" fill="#171527" stroke="#534AB7" />
        <text
          x="36"
          y="56"
          fill="#F1EFE8"
          style={{ fontSize: "11px", fontFamily: "var(--font-dm-mono), monospace" }}
        >
          buyer_agent
        </text>
        <text
          x="36"
          y="76"
          fill="#B8B6D9"
          style={{ fontSize: "9px", fontFamily: "var(--font-dm-mono), monospace" }}
        >
          query:
        </text>
        <text
          x="36"
          y="92"
          fill="#F1EFE8"
          style={{ fontSize: "9px", fontFamily: "var(--font-dm-mono), monospace" }}
        >
          zero trust, fs, emea
        </text>

        <line
          x1="130"
          y1="68"
          x2="188"
          y2="96"
          className="landing-flow-line"
          stroke="url(#buyer-flow)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <circle cx="210" cy="100" r="46" fill="#161513" stroke="#1D9E75" strokeWidth="2" />
        <circle cx="210" cy="100" r="38" className="landing-node-pulse" fill="#0C1A16" />
        <text
          x="210"
          y="94"
          textAnchor="middle"
          fill="#F1EFE8"
          style={{ fontSize: "11px", fontFamily: "var(--font-dm-mono), monospace" }}
        >
          signal.lab
        </text>
        <text
          x="210"
          y="110"
          textAnchor="middle"
          fill="#1D9E75"
          style={{ fontSize: "11px", fontFamily: "var(--font-dm-mono), monospace" }}
        >
          graph
        </text>

        {[
          { y: 28, name: "nina_p.json", tag: "json" },
          { y: 84, name: "omid_r.json", tag: "proof" },
          { y: 140, name: "helen_t.json", tag: "intro" },
        ].map((card, index) => (
          <g key={card.name} className="landing-node-pulse">
            <line
              x1="250"
              y1="100"
              x2="296"
              y2={card.y + 20}
              className={index % 2 === 0 ? "landing-flow-line" : "landing-flow-line landing-flow-line-reverse"}
              stroke="url(#buyer-flow)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <rect
              x="296"
              y={card.y}
              width="104"
              height="34"
              rx="12"
              fill="#151413"
              stroke="#2C2C2A"
            />
            <text
              x="312"
              y={card.y + 15}
              fill="#F1EFE8"
              style={{ fontSize: "9.5px", fontFamily: "var(--font-dm-mono), monospace" }}
            >
              {card.name}
            </text>
            <rect
              x="350"
              y={card.y + 8}
              width="34"
              height="16"
              rx="8"
              fill="#0C1A16"
              stroke="#1D9E75"
            />
            <text
              x="367"
              y={card.y + 19}
              textAnchor="middle"
              fill="#1D9E75"
              style={{ fontSize: "8px", fontFamily: "var(--font-dm-mono), monospace" }}
            >
              {card.tag}
            </text>
          </g>
        ))}

        <line
          x1="210"
          y1="146"
          x2="210"
          y2="184"
          className="landing-flow-line"
          stroke="url(#buyer-flow)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        <rect x="118" y="188" width="188" height="48" rx="14" fill="#1f1511" stroke="#993C1D" />
        <text
          x="136"
          y="208"
          fill="#F1EFE8"
          style={{ fontSize: "9.5px", fontFamily: "var(--font-dm-mono), monospace" }}
        >
          proof_snippet
        </text>
        <text
          x="136"
          y="224"
          fill="#DCA08B"
          style={{ fontSize: "8.5px", fontFamily: "var(--font-dm-mono), monospace" }}
        >
          named owner + attributed evidence
        </text>
      </svg>
    </div>
  );
}
