/**
 * DesiHub design tokens — the single source of truth.
 *
 * Consumed by:
 *  - apps/web via the Tailwind v4 preset + tokens.css variables
 *  - apps/mobile via NativeWind + the raw JS values below
 *
 * Design intent: premium European-startup product with modern Indian
 * energy — think Fever/Airbnb/Spotify polish, DesiHub identity. Light-only
 * by deliberate brief: no dark theme. Warm off-white and deep navy carry
 * the interface; the orange→pink→purple brand gradient is a controlled
 * signature accent (logo, primary CTAs, badges), never the page itself.
 */

/** Raw brand palette. Hex values are the canonical definition of each colour. */
export const palette = {
  // Neutral ramp — warm off-white through deep navy, per brief.
  bg: '#FAFAF7',
  bgSubtle: '#F5F5F2',
  surface: '#FFFFFF',
  border: '#E9E9EE',
  navy: '#171A35',
  navyMuted: '#6B6F80',
  navySubtle: '#9699A6',

  // Brand accents.
  orange: '#FF8A00',
  orange600: '#DB7500',
  pink: '#F0446F',
  pink600: '#D22E58',
  purple: '#7B35D6',
  purple600: '#6423B8',

  // Soft tint backgrounds for badges/chips/soft buttons.
  orangeSoft: '#FFF2E3',
  pinkSoft: '#FFF0F3',
  purpleSoft: '#F3EEFF',

  // Semantic.
  success: '#22A06B',
  successBg: '#E7F5EE',
  warn: '#E6A21A',
  warnBg: '#FCF2DD',
  error: '#D64545',
  errorBg: '#FBE9E9',

  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * The brand mark's gradient (logo, wordmark, primary buttons, selected
 * states) — orange → pink → purple. Used selectively and never as a page
 * background, per brief.
 */
export const brandGradient = [palette.orange, palette.pink, palette.purple] as const;

/**
 * Semantic colour roles. Light-only by brief — no dark theme. Kept as a
 * `{ light: {...} }` shape (rather than flattening) so the rest of the
 * token pipeline (Tailwind preset, tokens.css generator, mobile NativeWind
 * vars) needs no restructuring if a dark theme is ever reconsidered later.
 */
export const colorRoles = {
  light: {
    bg: palette.bg,
    bgSubtle: palette.bgSubtle,
    bgSunken: palette.bgSubtle,
    surface: palette.surface,
    surfaceHover: palette.bgSubtle,
    border: palette.border,
    borderStrong: '#D6D6DE',
    fg: palette.navy,
    fgMuted: palette.navyMuted,
    fgSubtle: palette.navySubtle,
    accent: palette.orange,
    accentHover: palette.orange600,
    accentFg: palette.white,
    accentSubtle: palette.orangeSoft,
    accentPink: palette.pink,
    accentPinkHover: palette.pink600,
    accentPinkSubtle: palette.pinkSoft,
    accentPurple: palette.purple,
    accentPurpleHover: palette.purple600,
    accentPurpleSubtle: palette.purpleSoft,
    success: palette.success,
    successBg: palette.successBg,
    warn: palette.warn,
    warnBg: palette.warnBg,
    error: palette.error,
    errorBg: palette.errorBg,
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

/**
 * Two-family pairing: Fraunces (warm, characterful serif) carries headlines
 * and event titles; Inter carries everything read at UI density — nav,
 * buttons, forms, prices, dates. The pairing is the product's editorial
 * signature, not a neutral default.
 */
export const fontFamily = {
  display: ['Fraunces', 'Georgia', 'serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['ui-monospace', 'monospace'],
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** 8px base spacing scale. */
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

/** Radius system: 8–10px small controls, 12px buttons/inputs, 16px cards, 18–20px modals, 999px pills/chips. */
export const radius = {
  none: '0',
  sm: '10px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  pill: '999px',
} as const;

/** Soft shadows only — never a harsh/black shadow. */
export const shadow = {
  none: 'none',
  elevation: '0 4px 16px rgba(23, 26, 53, 0.06)',
  elevationLg: '0 12px 32px rgba(23, 26, 53, 0.10)',
} as const;

/** Motion: 150–200ms ease-out, restrained (no bounce/glow). */
export const motion = {
  fast: '150ms',
  base: '180ms',
  slow: '200ms',
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
