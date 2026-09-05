/**
 * DesiHub design tokens — the single source of truth.
 *
 * Consumed by:
 *  - apps/web via the Tailwind v4 preset + tokens.css variables
 *  - apps/mobile via NativeWind + the raw JS values below
 *
 * ---------------------------------------------------------------------------
 * Design intent
 * ---------------------------------------------------------------------------
 * Premium consumer product with warmth — the restraint of Linear and the
 * photography-first discipline of Airbnb, but on warm paper rather than
 * sterile SaaS white, because this is a platform for Diwali, Garba and Sufi
 * nights, not a B2B dashboard.
 *
 * The single biggest change from the previous system: there is now **one**
 * accent. Orange, pink and purple used to be co-equal brand accents, which
 * meant every surface competed for attention and nothing read as *the*
 * action. Deep saffron now carries every primary action, active state and
 * key highlight; everything else is near-monochrome warm neutral. The
 * orange→pink→purple gradient survives in exactly one place — the logo mark
 * — where a brand signature belongs.
 */

/** Raw palette. Hex values are the canonical definition of each colour. */
export const palette = {
  // --- Light: warm paper and warm ink ------------------------------------
  // Both are deliberately off-neutral. A pure #FFF/#000 pair is what makes
  // an interface read as "generic tech"; a few degrees of warmth in the
  // ground and the ink is most of what separates this from that.
  paper: '#FAF7F2',
  paperSubtle: '#F3EEE6',
  paperSunken: '#EDE7DC',
  surface: '#FFFFFF',
  ink: '#141210',
  inkMuted: '#6B635A',
  inkSubtle: '#9A9088',
  hairline: '#E4DCD0',
  hairlineStrong: '#D2C7B8',

  // --- Dark: its own palette, not an inversion ---------------------------
  // Deep warm charcoal rather than pure black, warm off-white rather than
  // pure white. Inverting the light ramp would give cold grey-blue on
  // black — technically "dark mode", visually a different product.
  inkDeep: '#12100E',
  inkDeepSubtle: '#1A1715',
  inkDeepSunken: '#0D0B0A',
  surfaceDark: '#211D19',
  fgDark: '#F5EFE7',
  fgDarkMuted: '#A9A099',
  fgDarkSubtle: '#7C736C',

  // --- The one accent ----------------------------------------------------
  // Deep saffron: culturally the right note (kesar, marigold) and dark
  // enough to carry white text at AA on the paper ground, which a bright
  // marigold cannot.
  saffron: '#C2410C',
  saffronHover: '#9A3412',
  saffronSubtle: '#FBEDE4',
  /** Lifted for dark mode, where the deep saffron loses contrast. */
  saffronDark: '#FB923C',
  saffronDarkHover: '#FDBA74',
  saffronDarkSubtle: '#2A1A12',

  // --- Semantic ----------------------------------------------------------
  // `like` is the saved/favourite rose. It is a *state* colour, not a second
  // brand accent — it only ever appears inside a heart.
  like: '#D6336C',
  success: '#1E7A55',
  successBg: '#E4F2EB',
  successDark: '#4ADE80',
  successBgDark: '#12241B',
  warn: '#A9670B',
  warnBg: '#FBF0DC',
  warnDark: '#FBBF24',
  warnBgDark: '#2A2010',
  error: '#B42318',
  errorBg: '#FBEAE7',
  errorDark: '#FB7185',
  errorBgDark: '#2C1416',

  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * The brand mark's gradient. Now used *only* on the logo — it was
 * previously on buttons, badges and banners too, which is how three hues
 * ended up reading as three competing accents.
 */
export const brandGradient = ['#FF8A00', '#F0446F', '#7B35D6'] as const;

/**
 * Category identity colours — a designed set, like a transit map's lines,
 * not twelve arbitrary hues.
 *
 * Two rules hold it together. Every hue sits at a similar perceptual depth,
 * so no category shouts louder than another. And the whole set deliberately
 * avoids the orange band, so a category mark can never be mistaken for the
 * saffron accent — categories identify, the accent acts.
 */
export const categoryPalette = {
  indigo: { base: '#3F4EA8', soft: '#ECEEF8', onDark: '#8D9AE0' },
  violet: { base: '#6D4AA8', soft: '#F1ECF8', onDark: '#B49BE0' },
  plum: { base: '#96276E', soft: '#F8EBF3', onDark: '#DE8FBE' },
  jade: { base: '#0E7A63', soft: '#E6F3F0', onDark: '#5FC8AE' },
  ocean: { base: '#2A6F97', soft: '#E9F1F6', onDark: '#7EBAD9' },
  rose: { base: '#A63D5E', soft: '#F9ECEF', onDark: '#E093A8' },
} as const;

export type CategoryHue = keyof typeof categoryPalette;

/**
 * Semantic colour roles, per theme. Both themes define the complete set —
 * a role that exists in only one theme is the classic unreadable-in-dark
 * bug.
 */
export const colorRoles = {
  light: {
    bg: palette.paper,
    bgSubtle: palette.paperSubtle,
    bgSunken: palette.paperSunken,
    surface: palette.surface,
    surfaceHover: palette.paperSubtle,
    border: palette.hairline,
    borderStrong: palette.hairlineStrong,
    fg: palette.ink,
    fgMuted: palette.inkMuted,
    fgSubtle: palette.inkSubtle,
    accent: palette.saffron,
    accentHover: palette.saffronHover,
    accentFg: palette.white,
    accentSubtle: palette.saffronSubtle,
    like: palette.like,
    success: palette.success,
    successBg: palette.successBg,
    warn: palette.warn,
    warnBg: palette.warnBg,
    error: palette.error,
    errorBg: palette.errorBg,
    /** Scrim over photography, so overlaid text is legible on any image. */
    scrim: 'rgba(12, 10, 9, 0.58)',
  },
  dark: {
    bg: palette.inkDeep,
    bgSubtle: palette.inkDeepSubtle,
    bgSunken: palette.inkDeepSunken,
    surface: palette.surfaceDark,
    surfaceHover: '#2A2521',
    border: 'rgba(245, 239, 231, 0.12)',
    borderStrong: 'rgba(245, 239, 231, 0.22)',
    fg: palette.fgDark,
    fgMuted: palette.fgDarkMuted,
    fgSubtle: palette.fgDarkSubtle,
    accent: palette.saffronDark,
    accentHover: palette.saffronDarkHover,
    // The lifted saffron is bright, so it takes dark text — white on it
    // would fail contrast.
    accentFg: '#1A0F08',
    accentSubtle: palette.saffronDarkSubtle,
    like: '#F06595',
    success: palette.successDark,
    successBg: palette.successBgDark,
    warn: palette.warnDark,
    warnBg: palette.warnBgDark,
    error: palette.errorDark,
    errorBg: palette.errorBgDark,
    scrim: 'rgba(0, 0, 0, 0.62)',
  },
} as const;

/**
 * Type scale in px: 12 / 14 / 16 / 18 / 24 / 32 / 48 / 64.
 *
 * The old scale jumped 20 → 28 → 40 → 56, which left no comfortable size
 * for a card title or a section heading and pushed every heading to the
 * same weight. Eight steps give headings somewhere to actually step down to.
 */
export const fontSize = {
  xs: '0.75rem', // 12 — labels, eyebrows, meta
  sm: '0.875rem', // 14 — secondary text, chips
  base: '1rem', // 16 — body
  lg: '1.125rem', // 18 — lead paragraph, card title
  xl: '1.5rem', // 24 — section heading
  '2xl': '2rem', // 32 — page heading
  '3xl': '3rem', // 48 — hero (mobile)
  '4xl': '4rem', // 64 — hero (desktop)
} as const;

/**
 * Unitless ratios, not fixed rem heights. The old values were absolute, so
 * a 56px headline was locked to 60px leading whatever the context. Display
 * sizes get tight leading (1.05–1.15) because that is what makes large type
 * read as designed rather than merely big; body stays at 1.5–1.6.
 */
export const lineHeight = {
  xs: '1.5',
  sm: '1.5',
  base: '1.6',
  lg: '1.5',
  xl: '1.25',
  '2xl': '1.15',
  '3xl': '1.08',
  '4xl': '1.05',
} as const;

/**
 * Tracking. Large display type needs negative tracking to hold together;
 * small uppercase labels need positive tracking to stay readable.
 */
export const letterSpacing = {
  tight: '-0.03em',
  snug: '-0.015em',
  normal: '0',
  wide: '0.08em',
} as const;

/**
 * Two families: Fraunces (warm, characterful serif) carries headlines and
 * event titles; Inter carries everything read at UI density. The pairing is
 * the product's editorial signature, not a neutral default.
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

/** 4/8-based spacing scale: 4 8 12 16 24 32 48 64 96. */
export const spacing = {
  0: '0',
  1: '0.25rem', // 4
  2: '0.5rem', // 8
  3: '0.75rem', // 12
  4: '1rem', // 16
  5: '1.25rem', // 20
  6: '1.5rem', // 24
  8: '2rem', // 32
  10: '2.5rem', // 40
  12: '3rem', // 48
  16: '4rem', // 64
  20: '5rem', // 80
  24: '6rem', // 96
  32: '8rem', // 128
} as const;

/**
 * One radius, 16px, on everything with a visible box — cards, buttons,
 * inputs, modals. The old system had five values in play at once, which is
 * the kind of inconsistency that reads as unfinished without anyone being
 * able to say why.
 *
 * `sm` survives for elements under ~28px tall (a badge, a date chip), where
 * 16px would round into a pill and lose its shape. `pill` is for genuine
 * pills — filter chips, category tags.
 */
export const radius = {
  none: '0',
  sm: '8px',
  md: '16px',
  lg: '16px',
  xl: '16px',
  pill: '999px',
} as const;

/**
 * Soft, warm-tinted shadows — the tint matters, a neutral grey shadow on
 * warm paper reads as dirt. Used sparingly: elevation is for things that
 * genuinely float (menus, the sticky bar), never a default on every card.
 */
export const shadow = {
  none: 'none',
  elevation: '0 2px 8px rgba(20, 18, 16, 0.05)',
  elevationLg: '0 12px 32px rgba(20, 18, 16, 0.10)',
} as const;

/** Motion: 150–250ms ease-out, restrained (no bounce/glow). */
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
