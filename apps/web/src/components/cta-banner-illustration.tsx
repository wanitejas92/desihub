/**
 * The organiser CTA's background scene — a wide crop of the same illustrated
 * language as the hero (crowd, sparkles, brand gradient), plus a performer
 * silhouette at the mic on the right edge. Original SVG, not traced/generated.
 */
const SPARKLES = [
  { x: 90, y: 40, size: 7 },
  { x: 340, y: 20, size: 5 },
  { x: 620, y: 55, size: 8 },
  { x: 900, y: 25, size: 6 },
  { x: 1150, y: 45, size: 7 },
  { x: 1350, y: 20, size: 5 },
];

function CrowdFigure({ x, lean = 0 }: { x: number; lean?: number }) {
  return (
    <g transform={`translate(${x}, 0) scale(0.65)`} fill="white" opacity="0.8">
      <circle cx="0" cy="0" r="7" />
      <path d="M-8,7 Q0,1 8,7 L9,34 Q0,40 -9,34 Z" />
      <path
        d={`M-7,10 Q${-16 + lean},-4 ${-20 + lean},-24`}
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M7,10 Q${16 + lean},-4 ${20 + lean},-24`}
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

const CROWD_X = Array.from({ length: 26 }, (_, i) => 20 + i * 52);

export function CtaBannerIllustration({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg
        viewBox="0 0 1440 340"
        className="h-full w-full"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        <defs>
          <linearGradient id="cta-sky" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0%" stopColor="#FF8A00" />
            <stop offset="55%" stopColor="#F0146F" />
            <stop offset="100%" stopColor="#7B1FD6" />
          </linearGradient>
          <radialGradient id="cta-glow" cx="30%" cy="0%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1440" height="340" fill="url(#cta-sky)" />
        <rect width="1440" height="340" fill="url(#cta-glow)" className="hero-glow-pulse" />

        {SPARKLES.map((s, i) => (
          <path
            key={i}
            d={`M${s.x},${s.y - s.size} L${s.x + s.size * 0.28},${s.y - s.size * 0.28} L${s.x + s.size},${s.y} L${s.x + s.size * 0.28},${s.y + s.size * 0.28} L${s.x},${s.y + s.size} L${s.x - s.size * 0.28},${s.y + s.size * 0.28} L${s.x - s.size},${s.y} L${s.x - s.size * 0.28},${s.y - s.size * 0.28} Z`}
            fill="white"
            className="hero-sparkle"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}

        <g transform="translate(0, 322)">
          <g className="hero-crowd">
            {CROWD_X.map((x, i) => (
              <CrowdFigure key={x} x={x} lean={i % 2 === 0 ? -5 : 5} />
            ))}
          </g>
        </g>

        {/* performer at the mic, right edge */}
        <g transform="translate(1330, 230) scale(1.4)" fill="white">
          <rect x="-2.5" y="20" width="5" height="110" opacity="0.9" />
          <path d="M-18,20 L18,20 L11,3 L-11,3 Z" opacity="0.9" />
          <circle cx="0" cy="-26" r="17" />
          <path d="M-16,-9 Q0,-18 16,-9 L20,42 Q0,55 -20,42 Z" />
          <path
            d="M-16,-5 Q-32,10 -28,34"
            stroke="white"
            strokeWidth="6.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
