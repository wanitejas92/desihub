'use client';

/**
 * The hero's illustrated panel — an original SVG scene (skyline, crowd,
 * glowing arch, ornaments), not a traced or generated image, the same rule
 * the brand mark follows. One consistent composition, kept alive through
 * animation (glow pulse, sparkle twinkle, a gentle crowd sway) rather than
 * a static picture.
 */

/** Onion dome + flanking minarets, the recurring skyline unit. */
function DomeCluster({ x, scale = 1 }: { x: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, 0) scale(${scale})`} fill="currentColor">
      {/* main dome drum + onion cap */}
      <rect x="-42" y="140" width="84" height="110" rx="2" />
      <path d="M-42,140 Q-42,95 0,80 Q42,95 42,140 Z" />
      <path d="M0,80 Q-14,60 0,42 Q14,60 0,80 Z" />
      <rect x="-3.5" y="20" width="7" height="24" />
      <circle cx="0" cy="16" r="6" />
      {/* flanking minarets */}
      <rect x="-58" y="175" width="15" height="75" />
      <path d="M-58,175 Q-50.5,150 -43,175 Z" />
      <rect x="-64" y="130" width="4" height="4" />
      <rect x="43" y="175" width="15" height="75" />
      <path d="M43,175 Q50.5,150 58,175 Z" />
    </g>
  );
}

/** A crowd member: head, torso, two raised arms. `lean` varies the arm angle for variety. */
function CrowdFigure({ x, lean = 0, h = 1 }: { x: number; lean?: number; h?: number }) {
  return (
    <g transform={`translate(${x}, ${(1 - h) * 40})`}>
      <circle cx="0" cy="0" r="11" />
      <path d="M-13,11 Q0,2 13,11 L15,54 Q0,63 -15,54 Z" />
      <path
        d={`M-11,15 Q${-26 + lean},-6 ${-33 + lean},-37`}
        strokeWidth="7.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M11,15 Q${26 + lean},-6 ${33 + lean},-37`}
        strokeWidth="7.5"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

function Sparkle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <path
      d={`M${x},${y - size} L${x + size * 0.28},${y - size * 0.28} L${x + size},${y} L${x + size * 0.28},${y + size * 0.28} L${x},${y + size} L${x - size * 0.28},${y + size * 0.28} L${x - size},${y} L${x - size * 0.28},${y - size * 0.28} Z`}
      fill="white"
      className="hero-sparkle"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

/** A hanging pendant ornament, dangling from a thin chain off the top edge. */
function Ornament({
  x,
  drop,
  size,
  color,
}: {
  x: number;
  drop: number;
  size: number;
  color: string;
}) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <line x1="0" y1="0" x2="0" y2={drop} stroke={color} strokeWidth="1.5" opacity="0.6" />
      <path
        d={`M${-size},${drop} L${size},${drop} L0,${drop + size * 1.6} Z`}
        fill={color}
        opacity="0.9"
      />
      <circle cx="0" cy={drop} r={size * 0.6} fill={color} />
    </g>
  );
}

/** One faceted diamond, the corner-confetti motif. */
function Facet({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return (
    <path
      d={`M${x},${y - size} L${x + size},${y} L${x},${y + size} L${x - size},${y} Z`}
      fill={color}
      opacity="0.85"
    />
  );
}

const SPARKLES = [
  { x: 90, y: 130, size: 7, delay: 0 },
  { x: 700, y: 90, size: 9, delay: 0.7 },
  { x: 640, y: 210, size: 6, delay: 1.5 },
  { x: 140, y: 300, size: 6, delay: 2.2 },
  { x: 730, y: 380, size: 8, delay: 1.0 },
  { x: 60, y: 420, size: 6, delay: 1.9 },
  { x: 400, y: 70, size: 6, delay: 2.7 },
];

const ORNAMENTS = [
  { x: 620, drop: 90, size: 9, color: '#FFD37A' },
  { x: 690, drop: 130, size: 7, color: '#F49BC1' },
  { x: 760, drop: 70, size: 8, color: '#C79CF0' },
  { x: 560, drop: 60, size: 6, color: '#F49BC1' },
];

const LEFT_FACETS = [
  { x: 46, y: 540, size: 24, color: '#FF7A3D' },
  { x: 92, y: 590, size: 32, color: '#F0446F' },
  { x: 26, y: 630, size: 20, color: '#FFB05A' },
  { x: 96, y: 520, size: 15, color: '#FF9A4D' },
  { x: 40, y: 680, size: 22, color: '#E0345C' },
  { x: 110, y: 660, size: 14, color: '#FFC98A' },
  { x: 60, y: 470, size: 12, color: '#FF9A4D' },
];

const RIGHT_FACETS = [
  { x: 754, y: 580, size: 28, color: '#7B35D6' },
  { x: 700, y: 630, size: 21, color: '#4C6FE0' },
  { x: 774, y: 640, size: 15, color: '#9B5CE0' },
  { x: 720, y: 690, size: 20, color: '#5D2AA8' },
  { x: 764, y: 500, size: 13, color: '#8B5CE8' },
  { x: 690, y: 560, size: 12, color: '#4C6FE0' },
];

const CROWD_X = [70, 150, 230, 310, 390, 470, 550, 630, 710];

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg
        viewBox="0 0 800 1000"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0.15" y2="1">
            <stop offset="0%" stopColor="#FFF3E4" />
            <stop offset="22%" stopColor="#FFB35C" />
            <stop offset="48%" stopColor="#F0446F" />
            <stop offset="100%" stopColor="#3D1268" />
          </linearGradient>
          <radialGradient id="hero-glow" cx="50%" cy="30%" r="30%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="35%" stopColor="#FFDDEE" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFDDEE" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-arch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C77CF0" />
            <stop offset="100%" stopColor="#7B35D6" />
          </linearGradient>
          <linearGradient id="hero-skyline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C2560E" />
            <stop offset="100%" stopColor="#8A3208" />
          </linearGradient>
          <linearGradient id="hero-crowd-light" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3A160A" />
            <stop offset="45%" stopColor="#2A1030" />
            <stop offset="100%" stopColor="#160A38" />
          </linearGradient>
          <clipPath id="hero-clip">
            <rect width="800" height="1000" rx="28" />
          </clipPath>
        </defs>

        <g clipPath="url(#hero-clip)">
          <rect width="800" height="1000" fill="url(#hero-sky)" />

          {/* the glowing arch behind the skyline — the reference's centrepiece */}
          <g className="hero-glow-pulse" style={{ transformOrigin: '400px 300px' }}>
            <path
              d="M400,40 Q580,130 580,320 L580,620 Q400,680 220,620 L220,320 Q220,130 400,40 Z"
              fill="url(#hero-arch)"
              opacity="0.92"
            />
            <rect width="800" height="1000" fill="url(#hero-glow)" />
          </g>

          {/* mandala medallion, upper-left, clear of the arch */}
          <g
            transform="translate(105, 130)"
            stroke="#FFE3B0"
            strokeWidth="1.4"
            fill="none"
            opacity="0.45"
          >
            <circle r="58" />
            <circle r="42" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * 42}
                  y1={Math.sin(a) * 42}
                  x2={Math.cos(a) * 58}
                  y2={Math.sin(a) * 58}
                />
              );
            })}
          </g>

          {ORNAMENTS.map((o, i) => (
            <Ornament key={i} {...o} />
          ))}

          {SPARKLES.map((s, i) => (
            <Sparkle key={i} {...s} />
          ))}

          {/* skyline — a continuous base wall under the domes, so it reads as
              one palace, not islands with gaps. Domes rise up into the arch's
              lower half, the way the reference layers them. */}
          <g transform="translate(0, 520)" fill="url(#hero-skyline)">
            <DomeCluster x={90} scale={1.05} />
            <DomeCluster x={270} scale={0.75} />
            <DomeCluster x={530} scale={0.75} />
            <DomeCluster x={710} scale={1.05} />
            <rect x="0" y="330" width="800" height="150" />
          </g>

          {/* crowd — positioning transform on the outer group, sway animation on
              the inner one: a CSS animation on an element replaces its SVG
              `transform` attribute rather than composing with it, so the two
              concerns need separate elements or the position is lost. */}
          <g
            transform="translate(0, 610)"
            fill="url(#hero-crowd-light)"
            stroke="url(#hero-crowd-light)"
          >
            <g className="hero-crowd">
              {CROWD_X.map((x, i) => (
                <CrowdFigure key={x} x={x} lean={i % 2 === 0 ? -6 : 8} h={1.05 + (i % 3) * 0.08} />
              ))}
            </g>
          </g>

          {/* corner confetti, warm left / cool right — echoes the crowd's rim light */}
          {LEFT_FACETS.map((f, i) => (
            <Facet key={`l${i}`} {...f} />
          ))}
          {RIGHT_FACETS.map((f, i) => (
            <Facet key={`r${i}`} {...f} />
          ))}
        </g>
      </svg>
    </div>
  );
}
