"use client";

export default function HeroGraphic() {
  return (
    <div aria-hidden="true" className="rounded-[20px] border border-[#2C2C2A] bg-[#11100f] p-4">
      <svg viewBox="0 0 360 240" className="h-auto w-full">
        <defs>
          <linearGradient id="hero-link" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#534AB7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="360" height="240" rx="18" fill="#11100f" />

        <line
          x1="180"
          y1="116"
          x2="72"
          y2="56"
          className="landing-flow-line"
          stroke="url(#hero-link)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="180"
          y1="116"
          x2="288"
          y2="58"
          className="landing-flow-line landing-flow-line-reverse"
          stroke="url(#hero-link)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="180"
          y1="116"
          x2="92"
          y2="180"
          className="landing-flow-line"
          stroke="url(#hero-link)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="180"
          y1="116"
          x2="272"
          y2="180"
          className="landing-flow-line landing-flow-line-reverse"
          stroke="url(#hero-link)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <circle cx="180" cy="116" r="46" fill="#161513" stroke="#1D9E75" strokeWidth="2" />
        <circle cx="180" cy="116" r="38" className="landing-node-pulse" fill="#0C1A16" />
        <text
          x="180"
          y="110"
          textAnchor="middle"
          fill="#F1EFE8"
          style={{ fontSize: "12px", fontFamily: "var(--font-dm-mono), monospace" }}
        >
          trust
        </text>
        <text
          x="180"
          y="126"
          textAnchor="middle"
          fill="#1D9E75"
          style={{ fontSize: "12px", fontFamily: "var(--font-dm-mono), monospace" }}
        >
          graph
        </text>

        <g className="landing-node-pulse">
          <circle cx="72" cy="56" r="27" fill="#171527" stroke="#534AB7" strokeWidth="1.5" />
          <text
            x="72"
            y="61"
            textAnchor="middle"
            fill="#F1EFE8"
            style={{ fontSize: "11px", fontFamily: "var(--font-dm-mono), monospace" }}
          >
            Zero
          </text>
        </g>

        <g className="landing-node-pulse">
          <circle cx="288" cy="58" r="24" fill="#171527" stroke="#534AB7" strokeWidth="1.5" />
          <text
            x="288"
            y="63"
            textAnchor="middle"
            fill="#F1EFE8"
            style={{ fontSize: "11px", fontFamily: "var(--font-dm-mono), monospace" }}
          >
            FS
          </text>
        </g>

        <g className="landing-node-pulse">
          <circle cx="92" cy="180" r="24" fill="#171527" stroke="#534AB7" strokeWidth="1.5" />
          <text
            x="92"
            y="185"
            textAnchor="middle"
            fill="#F1EFE8"
            style={{ fontSize: "11px", fontFamily: "var(--font-dm-mono), monospace" }}
          >
            EMEA
          </text>
        </g>

        <g className="landing-node-pulse">
          <circle cx="272" cy="180" r="28" fill="#0C1A16" stroke="#1D9E75" strokeWidth="1.5" />
          <text
            x="272"
            y="185"
            textAnchor="middle"
            fill="#F1EFE8"
            style={{ fontSize: "11px", fontFamily: "var(--font-dm-mono), monospace" }}
          >
            proof
          </text>
        </g>
      </svg>
    </div>
  );
}
