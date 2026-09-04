'use client';

import { useEffect, useState } from 'react';

/**
 * The hero's illustrated panel — an original SVG scene (skyline, crowd,
 * sparkles), not a traced or generated image, the same rule the brand mark
 * follows. "Rotating banner" here means the accent motif cycling — fireworks,
 * string lights, confetti — crossfaded over one continuous, always-animated
 * scene, rather than three unrelated static pictures snapping in and out.
 */

const ACCENTS = ['fireworks', 'lights', 'confetti'] as const;
type Accent = (typeof ACCENTS)[number];

function useRotatingAccent(intervalMs = 4200): Accent {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % ACCENTS.length), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return ACCENTS[index]!;
}

/** One dome + minaret cluster, repeated along the skyline. */
function DomeCluster({ x, scale = 1 }: { x: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, 0) scale(${scale})`} fill="currentColor">
      <rect x="-38" y="120" width="76" height="90" rx="3" />
      <path d="M-38,120 Q0,50 38,120 Z" />
      <rect x="-6" y="30" width="12" height="30" />
      <circle cx="0" cy="26" r="7" />
      <rect x="-46" y="150" width="14" height="60" />
      <path d="M-46,150 Q-39,128 -32,150 Z" />
      <rect x="32" y="150" width="14" height="60" />
      <path d="M32,150 Q39,128 46,150 Z" />
    </g>
  );
}

/** A crowd member: head, torso, two raised arms. `lean` varies the arm angle for variety. */
function CrowdFigure({ x, lean = 0, h = 1 }: { x: number; lean?: number; h?: number }) {
  return (
    <g transform={`translate(${x}, ${(1 - h) * 40})`} fill="currentColor">
      <circle cx="0" cy="0" r="10" />
      <path d="M-12,10 Q0,2 12,10 L14,50 Q0,58 -14,50 Z" />
      <path
        d={`M-10,14 Q${-24 + lean},-6 ${-30 + lean},-34`}
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M10,14 Q${24 + lean},-6 ${30 + lean},-34`}
        stroke="currentColor"
        strokeWidth="7"
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

const SPARKLES = [
  { x: 60, y: 90, size: 8, delay: 0 },
  { x: 720, y: 140, size: 11, delay: 0.6 },
  { x: 640, y: 60, size: 6, delay: 1.4 },
  { x: 110, y: 260, size: 6, delay: 2.1 },
  { x: 760, y: 320, size: 9, delay: 0.9 },
  { x: 40, y: 400, size: 7, delay: 1.8 },
  { x: 690, y: 440, size: 8, delay: 2.6 },
  { x: 150, y: 60, size: 5, delay: 3.1 },
];

const FIREWORK_BURSTS = [
  { x: 180, y: 130 },
  { x: 610, y: 90 },
  { x: 700, y: 260 },
];

const LIGHT_STRING = Array.from({ length: 11 }, (_, i) => ({
  x: 60 + i * 68,
  y: 40 + Math.sin(i * 0.9) * 18,
}));

const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 137) % 800,
  y: 30 + ((i * 219) % 380),
  r: (i * 41) % 180,
  hue: i % 3,
}));

export function HeroIllustration({ className }: { className?: string }) {
  const accent = useRotatingAccent();

  return (
    <div className={className} aria-hidden>
      <svg
        viewBox="0 0 800 1000"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF8A00" />
            <stop offset="52%" stopColor="#F0146F" />
            <stop offset="100%" stopColor="#5B1AA6" />
          </linearGradient>
          <radialGradient id="hero-glow" cx="50%" cy="38%" r="45%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#FFD9A0" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFD9A0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-skyline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A1050" />
            <stop offset="100%" stopColor="#1A0630" />
          </linearGradient>
          <clipPath id="hero-clip">
            <rect width="800" height="1000" rx="28" />
          </clipPath>
        </defs>

        <g clipPath="url(#hero-clip)">
          <rect width="800" height="1000" fill="url(#hero-sky)" />
          <rect width="800" height="1000" fill="url(#hero-glow)" className="hero-glow-pulse" />

          {/* faceted texture accents, matching the diamond confetti motif */}
          <g opacity="0.12" fill="white">
            <path d="M40,500 L70,530 L40,560 L10,530 Z" />
            <path d="M760,180 L790,210 L760,240 L730,210 Z" />
            <path d="M720,620 L745,645 L720,670 L695,645 Z" />
          </g>

          {SPARKLES.map((s, i) => (
            <Sparkle key={i} {...s} />
          ))}

          {/* rotating accent layer */}
          <g
            className="hero-accent"
            style={{ opacity: accent === 'fireworks' ? 1 : 0 }}
            fill="white"
          >
            {FIREWORK_BURSTS.map((f, i) => (
              <g key={i} transform={`translate(${f.x}, ${f.y})`}>
                {Array.from({ length: 10 }, (_, j) => {
                  const angle = (j / 10) * Math.PI * 2;
                  return (
                    <line
                      key={j}
                      x1={Math.cos(angle) * 6}
                      y1={Math.sin(angle) * 6}
                      x2={Math.cos(angle) * 26}
                      y2={Math.sin(angle) * 26}
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.9"
                    />
                  );
                })}
                <circle r="4" fill="white" />
              </g>
            ))}
          </g>

          <g className="hero-accent" style={{ opacity: accent === 'lights' ? 1 : 0 }}>
            <path
              d={`M${LIGHT_STRING[0]!.x},${LIGHT_STRING[0]!.y} ${LIGHT_STRING.map((p) => `L${p.x},${p.y}`).join(' ')}`}
              stroke="white"
              strokeWidth="1.5"
              opacity="0.5"
              fill="none"
            />
            {LIGHT_STRING.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y + 10} r="5" fill="#FFE28A" opacity="0.95" />
            ))}
          </g>

          <g className="hero-accent" style={{ opacity: accent === 'confetti' ? 1 : 0 }}>
            {CONFETTI.map((c, i) => (
              <rect
                key={i}
                x={c.x}
                y={c.y}
                width="10"
                height="10"
                rx="2"
                fill={['#FFFFFF', '#FFE28A', '#FFD1E3'][c.hue]}
                opacity="0.85"
                transform={`rotate(${c.r} ${c.x + 5} ${c.y + 5})`}
              />
            ))}
          </g>

          {/* skyline — a low band, so the crowd stands against the bright glow
              above it rather than getting swallowed by the dark base. */}
          <g transform="translate(0, 620)" fill="url(#hero-skyline)">
            <DomeCluster x={90} scale={0.8} />
            <DomeCluster x={280} scale={1.05} />
            <DomeCluster x={480} scale={0.88} />
            <DomeCluster x={670} scale={0.75} />
            <rect x="0" y="270" width="800" height="110" />
          </g>

          {/* crowd — positioning transform on the outer group, sway animation on
              the inner one: a CSS animation on an element replaces its SVG
              `transform` attribute rather than composing with it, so the two
              concerns need separate elements or the position is lost. */}
          <g transform="translate(0, 600)" fill="#0F0620">
            <g className="hero-crowd">
              <CrowdFigure x={70} lean={-6} h={0.9} />
              <CrowdFigure x={150} lean={8} h={1.05} />
              <CrowdFigure x={230} lean={-10} h={0.95} />
              <CrowdFigure x={310} lean={4} h={1.1} />
              <CrowdFigure x={390} lean={-4} h={1} />
              <CrowdFigure x={470} lean={10} h={0.92} />
              <CrowdFigure x={550} lean={-8} h={1.05} />
              <CrowdFigure x={630} lean={6} h={0.96} />
              <CrowdFigure x={710} lean={-6} h={1.02} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
