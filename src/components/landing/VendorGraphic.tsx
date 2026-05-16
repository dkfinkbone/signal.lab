"use client";

export default function VendorGraphic() {
  return (
    <div aria-hidden="true" className="rounded-[20px] border border-[#2C2C2A] bg-[#11100f] p-4">
      <svg viewBox="0 0 420 270" className="h-auto w-full">
        <defs>
          <linearGradient id="vendor-flow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#534AB7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="420" height="270" rx="18" fill="#11100f" />

        {[80, 210, 340].map((x) => (
          <line
            key={`top-${x}`}
            x1="210"
            y1="42"
            x2={x}
            y2="96"
            className="landing-flow-line"
            stroke="url(#vendor-flow)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}

        {[48, 112, 176].map((x) => (
          <line
            key={`left-${x}`}
            x1="80"
            y1="110"
            x2={x}
            y2="170"
            className="landing-flow-line"
            stroke="url(#vendor-flow)"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        ))}

        {[144, 208, 272].map((x) => (
          <line
            key={`center-${x}`}
            x1="210"
            y1="110"
            x2={x}
            y2="170"
            className="landing-flow-line landing-flow-line-reverse"
            stroke="url(#vendor-flow)"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        ))}

        {[240, 304].map((x) => (
          <line
            key={`right-${x}`}
            x1="340"
            y1="110"
            x2={x}
            y2="170"
            className="landing-flow-line"
            stroke="url(#vendor-flow)"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        ))}

        {[48, 112, 176, 240, 304, 368].map((x) => (
          <line
            key={`base-${x}`}
            x1={x}
            y1="182"
            x2={x}
            y2="230"
            className="landing-flow-line"
            stroke="url(#vendor-flow)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        ))}

        <rect x="164" y="20" width="92" height="28" rx="14" fill="#171527" stroke="#534AB7" />
        <text
          x="210"
          y="38"
          textAnchor="middle"
          fill="#F1EFE8"
          style={{ fontSize: "12px", fontFamily: "var(--font-dm-mono), monospace" }}
        >
          vendor
        </text>

        {[
          { x: 44, label: "partner_1" },
          { x: 174, label: "partner_2" },
          { x: 304, label: "partner_3" },
        ].map((node) => (
          <g key={node.label} className="landing-node-pulse">
            <rect x={node.x} y="96" width="72" height="28" rx="14" fill="#151413" stroke="#2C2C2A" />
            <text
              x={node.x + 36}
              y="114"
              textAnchor="middle"
              fill="#F1EFE8"
              style={{ fontSize: "10px", fontFamily: "var(--font-dm-mono), monospace" }}
            >
              {node.label}
            </text>
          </g>
        ))}

        {[
          { x: 28, label: "AE" },
          { x: 92, label: "SE" },
          { x: 156, label: "CAM" },
          { x: 220, label: "AE" },
          { x: 284, label: "SE" },
          { x: 348, label: "CAM" },
        ].map((node) => (
          <g key={`${node.label}-${node.x}`} className="landing-node-pulse">
            <rect x={node.x} y="166" width="34" height="22" rx="11" fill="#0C1A16" stroke="#1D9E75" />
            <text
              x={node.x + 17}
              y="180.5"
              textAnchor="middle"
              fill="#F1EFE8"
              style={{ fontSize: "9px", fontFamily: "var(--font-dm-mono), monospace" }}
            >
              {node.label}
            </text>
          </g>
        ))}

        {[
          { x: 24, label: "FS" },
          { x: 88, label: "EMEA" },
          { x: 152, label: "Retail" },
          { x: 216, label: "Public" },
          { x: 280, label: "IAM" },
          { x: 344, label: "OT" },
        ].map((node) => (
          <g key={node.label}>
            <rect x={node.x} y="230" width="52" height="18" rx="9" fill="#1f1511" stroke="#993C1D" />
            <text
              x={node.x + 26}
              y="242.5"
              textAnchor="middle"
              fill="#F1EFE8"
              style={{ fontSize: "8.5px", fontFamily: "var(--font-dm-mono), monospace" }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
