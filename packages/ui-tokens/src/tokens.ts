/**
 * DesiHub design tokens — the single source of truth.
 *
 * Consumed by:
 *  - apps/web via the Tailwind v4 preset + tokens.css variables
 *  - apps/mobile via NativeWind + the raw JS values below
 *
 * Design intent: editorial and calm. Colour comes from event photography,
 * not from chrome. One saturated accent — crimson, revised from the original
 * marigold to read closer to the confident red CTAs of DesiPass, the
 * category's reference ticketing app (see docs/DECISIONS.md). Dark mode is a
 * first-class theme, not an inversion.
 */

/** Raw brand palette. Hex values are the canonical definition of each colour. */
export const palette = {
  // Ink / neutral ramp (warm-tinted greys, not pure grey).
  ink: '#0F0F0F',
  ink800: '#1C1B1A',
  ink700: '#2E2C2A',
  ink600: '#4A4744',
  ink500: '#6B6762',
  ink400: '#938E88',
  ink300: '#BCB6AE',
  ink200: '#DAD3C9',
  ink100: '#EDE7DD',

  // Warm paper ramp.
  paper: '#FAF7F2',
  paper200: '#F3EEE5',
  paper300: '#EAE3D6',

  // Accent — crimson, DesiPass-inspired (see DECISIONS.md).
  crimson: '#D6284F',
  crimson600: '#AD1F3E',
  crimson400: '#F0899F',
  crimson200: '#F6C3D0',
  crimson100: '#FBE6EB',

  // Retained for festival-mood gradients and category-colour coding — those
  // are decorative, content-driven palettes independent of the brand accent.
  marigold: '#E8802A',
  marigold600: '#C96A1E',
  marigold400: '#F0994F',
  marigold200: '#F8D6B4',
  marigold100: '#FCEBDA',

  // Semantic.
  success: '#2F8F5B',
  successBg: '#E4F2EA',
  warn: '#C98A12',
  warnBg: '#FBF0D8',
  error: '#C43D3D',
  errorBg: '#F8E3E3',

  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * Semantic colour roles, split by theme. Components should reference roles
 * (e.g. `bg`, `fg`, `accent`) rather than raw palette values, so the two
 * themes stay honest and swappable.
 */
export const colorRoles = {
  light: {
    bg: palette.paper,
    bgSubtle: palette.paper200,
    bgSunken: palette.paper300,
    surface: palette.white,
    surfaceHover: palette.paper200,
    border: palette.ink200,
    borderStrong: palette.ink300,
    fg: palette.ink,
    fgMuted: palette.ink500,
    fgSubtle: palette.ink400,
    accent: palette.crimson,
    accentHover: palette.crimson600,
    accentFg: palette.white,
    accentSubtle: palette.crimson100,
    success: palette.success,
    successBg: palette.successBg,
    warn: palette.warn,
    warnBg: palette.warnBg,
    error: palette.error,
    errorBg: palette.errorBg,
  },
  dark: {
    bg: palette.ink,
    bgSubtle: palette.ink800,
    bgSunken: palette.black,
    surface: palette.ink800,
    surfaceHover: palette.ink700,
    border: palette.ink700,
    borderStrong: palette.ink600,
    fg: palette.paper,
    fgMuted: palette.ink300,
    fgSubtle: palette.ink400,
    accent: palette.crimson400,
    accentHover: palette.crimson,
    accentFg: palette.ink,
    accentSubtle: palette.ink700,
    success: '#5FBF8A',
    successBg: '#17352492',
    warn: '#E3B65A',
    warnBg: '#3A2E1492',
    error: '#E87A7A',
    errorBg: '#3A1C1C92',
  },
} as const;

/** Type scale in px: 12 / 14 / 16 / 20 / 28 / 40 / 56. */
export const fontSize = {
  xs: '0.75rem', // 12
  sm: '0.875rem', // 14
  base: '1rem', // 16
  lg: '1.25rem', // 20
  xl: '1.75rem', // 28
  '2xl': '2.5rem', // 40
  '3xl': '3.5rem', // 56
} as const;

export const lineHeight = {
  xs: '1rem',
  sm: '1.25rem',
  base: '1.5rem',
  lg: '1.75rem',
  xl: '2rem',
  '2xl': '2.75rem',
  '3xl': '3.75rem',
} as const;

export const fontFamily = {
  /** Expressive display face for headings. */
  display: ['Fraunces', 'Georgia', 'serif'],
  /** Clean grotesk for UI. */
  sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['Geist Mono', 'ui-monospace', 'monospace'],
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** 4px base spacing scale. */
export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

/** Radius: 12px cards, 999px pills. */
export const radius = {
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '20px',
  pill: '999px',
} as const;

/** One soft elevation only. */
export const shadow = {
  none: 'none',
  elevation: '0 6px 24px -8px rgba(15, 15, 15, 0.18)',
} as const;

/** Motion: 150–250ms ease-out. */
export const motion = {
  fast: '150ms',
  base: '200ms',
  slow: '250ms',
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

/** Minimum touch target. Everything designed at 390px width first. */
export const layout = {
  touchTargetMin: '44px',
  contentMaxWidth: '1200px',
  mobileFirstWidth: '390px',
} as const;

export type ColorRole = keyof typeof colorRoles.light;
export type ThemeName = keyof typeof colorRoles;
