/**
 * The DesiHub brand mark — an original "D" monogram (own SVG, not traced
 * from any reference image) with a simple NL skyline silhouette, filled
 * with the brand gradient. Paired with a wordmark where "Hub" repeats the
 * same gradient as live, theme-safe text (no image needed for the words).
 *
 * The D is a true semicircle bulge (centre (24,40), r 36), so available
 * width narrows fast below y≈60 — the skyline band sits at y 40–62 to stay
 * clear of that curve rather than reaching the visual baseline.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 64 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient
          id="desihub-logo-gradient"
          gradientUnits="userSpaceOnUse"
          x1="4"
          y1="4"
          x2="60"
          y2="76"
        >
          <stop offset="0%" stopColor="#F0812A" />
          <stop offset="50%" stopColor="#D6338C" />
          <stop offset="100%" stopColor="#7B3FA0" />
        </linearGradient>
        <clipPath id="desihub-logo-clip">
          <path d="M6,4 H24 A36,36 0 0 1 24,76 H6 Z" />
        </clipPath>
      </defs>

      <path d="M6,4 H24 A36,36 0 0 1 24,76 H6 Z" fill="url(#desihub-logo-gradient)" />

      {/* Skyline silhouette, clipped to the D. */}
      <g clipPath="url(#desihub-logo-clip)" stroke="#1C1023" strokeLinecap="round">
        {/* Windmill */}
        <circle cx="13" cy="50" r="1.6" fill="#1C1023" stroke="none" />
        <line x1="13" y1="50" x2="8" y2="45" strokeWidth="1.4" />
        <line x1="13" y1="50" x2="18" y2="45" strokeWidth="1.4" />
        <line x1="13" y1="50" x2="8" y2="55" strokeWidth="1.4" />
        <line x1="13" y1="50" x2="18" y2="55" strokeWidth="1.4" />
        <path d="M10.5,50 L11.5,62 L14.5,62 L13.5,50 Z" fill="#1C1023" stroke="none" />

        {/* Gabled canal house */}
        <rect x="20" y="48" width="10" height="14" fill="#1C1023" stroke="none" />
        <path d="M20,48 L30,48 L25,39 Z" fill="#1C1023" stroke="none" />

        {/* Cable-stay bridge */}
        <rect x="33.2" y="44" width="1.6" height="16" fill="#1C1023" stroke="none" />
        <rect x="41.2" y="44" width="1.6" height="16" fill="#1C1023" stroke="none" />
        <line x1="29" y1="60" x2="47" y2="60" strokeWidth="2" />
        <line x1="34" y1="46" x2="29.5" y2="60" strokeWidth="1" />
        <line x1="34" y1="50" x2="31.5" y2="60" strokeWidth="1" />
        <line x1="42" y1="46" x2="46.5" y2="60" strokeWidth="1" />
        <line x1="42" y1="50" x2="44.5" y2="60" strokeWidth="1" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ''}`}>
      <LogoMark size={28} />
      <span className="font-display text-lg leading-none font-semibold tracking-tight">
        <span className="text-fg">Desi</span>
        <span
          style={{
            backgroundImage: 'linear-gradient(90deg, #F0812A, #D6338C, #7B3FA0)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Hub
        </span>
      </span>
    </span>
  );
}
