import type { Config } from 'tailwindcss';
import {
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing,
  radius,
  spacing,
  colorRoles,
  categoryPalette,
} from './tokens';

/**
 * Shared Tailwind preset consumed by both apps/web (Tailwind v4) and
 * apps/mobile (NativeWind). Colour utilities resolve to CSS variables so a
 * single set of class names renders identically on both platforms; the
 * variables themselves are defined in tokens.css (web) and via the
 * NativeWind vars() root style (mobile).
 *
 * Because every colour resolves to a CSS variable rather than a literal,
 * dark mode needs no `dark:` variants anywhere in the app — `bg-surface`
 * is already the right colour in both themes. Variants stay for the few
 * places where a *treatment*, not just a value, differs.
 */

const colorVar = (role: string) => `var(--color-${kebab(role)})`;

const colors = {
  ...Object.fromEntries(Object.keys(colorRoles.light).map((role) => [kebab(role), colorVar(role)])),
  // `text-category-indigo`, `bg-category-jade`, … Theme-aware for free:
  // tokens.css swaps these to the lifted on-dark values in dark mode.
  category: Object.fromEntries(
    Object.keys(categoryPalette).map((hue) => [hue, `var(--category-${hue})`]),
  ),
};

export const tokenPreset = {
  theme: {
    extend: {
      colors,
      fontFamily: {
        display: [...fontFamily.display],
        sans: [...fontFamily.sans],
        mono: [...fontFamily.mono],
      },
      // Leading and tracking travel with the size: a 64px headline set at
      // body leading is the single most common way large type looks
      // undesigned, and it is not something each call site should have to
      // remember to correct.
      fontSize: {
        xs: [fontSize.xs, { lineHeight: lineHeight.xs }],
        sm: [fontSize.sm, { lineHeight: lineHeight.sm }],
        base: [fontSize.base, { lineHeight: lineHeight.base }],
        lg: [fontSize.lg, { lineHeight: lineHeight.lg }],
        xl: [fontSize.xl, { lineHeight: lineHeight.xl, letterSpacing: letterSpacing.snug }],
        '2xl': [
          fontSize['2xl'],
          { lineHeight: lineHeight['2xl'], letterSpacing: letterSpacing.snug },
        ],
        '3xl': [
          fontSize['3xl'],
          { lineHeight: lineHeight['3xl'], letterSpacing: letterSpacing.tight },
        ],
        '4xl': [
          fontSize['4xl'],
          { lineHeight: lineHeight['4xl'], letterSpacing: letterSpacing.tight },
        ],
      },
      letterSpacing: { ...letterSpacing },
      spacing: { ...spacing },
      borderRadius: {
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
        xl: radius.xl,
        pill: radius.pill,
      },
      boxShadow: {
        elevation: 'var(--shadow-elevation)',
        'elevation-lg': 'var(--shadow-elevation-lg)',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      maxWidth: {
        // The reading/grid column. Wider than this and card rows stretch
        // into six-across on a large monitor, which no reference platform
        // does — they cap and centre.
        content: '1280px',
        prose: '68ch',
      },
    },
  },
} satisfies Partial<Config>;

function kebab(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export default tokenPreset;
