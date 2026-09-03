import type { SVGProps } from 'react';

/**
 * Simple outline icon set — consistent 1.75 stroke, rounded caps/joins, 20x20
 * viewBox. Replaces the emoji used through Phase 1's early passes; the brief
 * is explicit that the product should read as a premium, modern platform,
 * not a childish one, and emoji-as-icon undercuts that everywhere it shows
 * up (nav, chips, badges, category tiles).
 */

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  };
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="9" r="6" />
      <path d="M17 17l-4-4" />
    </svg>
  );
}

export function IconMapPin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 18s6-5.2 6-9.8A6 6 0 0 0 4 8.2C4 12.8 10 18 10 18Z" />
      <circle cx="10" cy="8.2" r="2" />
    </svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" />
      <path d="M3 8.5h14M7 2.5v3M13 2.5v3" />
    </svg>
  );
}

export function IconCalendarPlus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" />
      <path d="M3 8.5h14M7 2.5v3M13 2.5v3M10 11v4M8 13h4" />
    </svg>
  );
}

export function IconFlame(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M10 1.5c.6 2.4-2.7 3.6-2.7 6.6a2.7 2.7 0 0 0 5.4 0c1.4 1 2.3 2.6 2.3 4.4a5 5 0 0 1-10 0c0-3.4 2.2-5 3.2-7.4.6-1.4.9-2.5 1.8-3.6Z" />
    </svg>
  );
}

export function IconSparkle(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M10 2l1.6 4.9L16.5 8.5l-4.9 1.6L10 15l-1.6-4.9L3.5 8.5l4.9-1.6L10 2Z" />
      <path d="M16 13l.7 2.1L19 16l-2.1.7L16 19l-.7-2.1L13 16l2.1-.7L16 13Z" />
    </svg>
  );
}

export function IconTicket(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8a2 2 0 1 0 0 4v2.5A1.5 1.5 0 0 0 4.5 16h11a1.5 1.5 0 0 0 1.5-1.5V12a2 2 0 1 1 0-4V5.5A1.5 1.5 0 0 0 15.5 4h-11A1.5 1.5 0 0 0 3 5.5V8Z" />
      <path d="M8 4.5v11" strokeDasharray="2 2" />
    </svg>
  );
}

export function IconShare(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="15" cy="5" r="2.2" />
      <circle cx="5" cy="10" r="2.2" />
      <circle cx="15" cy="15" r="2.2" />
      <path d="M6.9 8.9l6.2-2.8M6.9 11.1l6.2 2.8" />
    </svg>
  );
}

export function IconAlertCircle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6.5v4.2" />
      <circle cx="10" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCheckCircle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M7 10.2l2 2 4-4.4" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7.5 4.5l6 5.5-6 5.5" />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12.5 4.5l-6 5.5 6 5.5" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 7.5l5.5 6 5.5-6" />
    </svg>
  );
}

export function IconHeart(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 17s-6.5-4-6.5-8.7A3.8 3.8 0 0 1 10 5.5a3.8 3.8 0 0 1 6.5 2.8C16.5 13 10 17 10 17Z" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 10h14M11 4l6 6-6 6" />
    </svg>
  );
}

export function IconMegaphone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8.5v3a1 1 0 0 0 1 1h1l1 4h2l-.8-4H8l8.5 3V4.5L8 7.5H4a1 1 0 0 0-1 1Z" />
      <path d="M13.5 8v5" />
    </svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 10s2.7-5.5 8-5.5S18 10 18 10s-2.7 5.5-8 5.5S2 10 2 10Z" />
      <circle cx="10" cy="10" r="2.25" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="7.5" cy="7" r="2.5" />
      <path d="M2.5 16.5c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" />
      <circle cx="14.5" cy="7.5" r="2" />
      <path d="M12.7 12.2c2.2.4 3.8 1.9 3.8 4.3" />
    </svg>
  );
}

// Category icons — one distinctive mark per category, kept simple.
export function IconMic(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7.5" y="2.5" width="5" height="9" rx="2.5" />
      <path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v3M7.5 18h5" />
    </svg>
  );
}

export function IconDisco(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10" cy="8" r="5.5" />
      <path d="M10 2.5v11M4.5 8h11M6 4l8 8M14 4l-8 8" />
      <path d="M6.5 17.5h7" />
    </svg>
  );
}

export function IconDance(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10" cy="3.5" r="1.5" />
      <path d="M10 5.5v5l-3.5 6M10 10.5l3.5 6M6.5 8l-3 2M13.5 8l3 2" />
    </svg>
  );
}

export function IconDiya(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 2.5c1 1.4.6 2.6-.2 3.4-.9.9-.4 2 .4 2 1.4 0 1.8-1.6.9-2.7.9 1 2.3 2.4.9 4" />
      <path d="M3 12.5c1.5 1 4 1.5 7 1.5s5.5-.5 7-1.5c-.5 2.7-3.3 4.5-7 4.5s-6.5-1.8-7-4.5Z" />
    </svg>
  );
}

export function IconPalette(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 3a7 7 0 1 0 0 14c.9 0 1.5-.6 1.5-1.4 0-.4-.2-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.6-1.4 1.4-1.4H13.5A3.5 3.5 0 0 0 17 8.7C17 5.5 13.9 3 10 3Z" />
      <circle cx="6.7" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="13" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTemple(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 2.5l2 3.5H8l2-3.5Z" />
      <path d="M5 9.5V17h10V9.5M3 17h14M4.5 9.5h11L10 6l-5.5 3.5Z" />
      <path d="M8.5 17v-4.5h3V17" />
    </svg>
  );
}

export function IconMasks(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 5.5c1.5-1 3.5-1.3 5-.4 1 .6 1 1.9.2 2.6-1 .9-2.7.6-3.4-.5" />
      <circle cx="5.5" cy="7" r="0.4" fill="currentColor" stroke="none" />
      <path d="M17 8c-1.5 1-3.5 1.3-5 .4-1-.6-1-1.9-.2-2.6 1-.9 2.7-.6 3.4.5" />
      <circle cx="14.5" cy="6.5" r="0.4" fill="currentColor" stroke="none" />
      <path d="M4 12.5c1.8 3 4 4.5 6 4.5s4.2-1.5 6-4.5" />
    </svg>
  );
}

export function IconLaugh(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M6.5 11c.7 1.7 2 2.5 3.5 2.5s2.8-.8 3.5-2.5" />
      <path d="M7 8h.01M13 8h.01" strokeWidth="2.2" />
    </svg>
  );
}

export function IconUtensils(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 2.5v6M3.5 2.5v4a1.5 1.5 0 0 0 3 0v-4M5 8.5V17.5" />
      <path d="M14.5 2.5c-1.4 0-2.5 1.6-2.5 4.5S13 11.5 14.5 11.5V17.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDrum(props: IconProps) {
  return (
    <svg {...base(props)}>
      <ellipse cx="10" cy="6" rx="6.5" ry="2.5" />
      <path d="M3.5 6v6c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V6" />
      <path d="M3.8 4.2L2 2.5M16.2 4.2L18 2.5" />
    </svg>
  );
}

export function IconHandshake(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 9.5l3-2.7a1.6 1.6 0 0 1 2.2.1L9 8.2M17.5 9.5l-3-2.7a1.6 1.6 0 0 0-2.2.1L11 8.2" />
      <path d="M9 8.2l1.3 1.3a1.3 1.3 0 0 0 1.9-1.8l-2-2M6.5 10.5l2.3 2.3a1.4 1.4 0 0 0 2-2l-1-1" />
      <path d="M2.5 9.5v3.3l2.7 2.7 1.6-1.6M17.5 9.5v3.3l-2.7 2.7-1.9-1.9" />
    </svg>
  );
}
