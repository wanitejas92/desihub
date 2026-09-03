import type { Config } from 'tailwindcss';
import { fontFamily, fontSize, lineHeight, radius, spacing, colorRoles } from './tokens';

/**
 * Shared Tailwind preset consumed by both apps/web (Tailwind v4) and
 * apps/mobile (NativeWind). Colour utilities resolve to CSS variables so a
 * single set of class names renders identically on both platforms; the
 * variables themselves are defined in tokens.css (web) and via the
 * NativeWind vars() root style (mobile). Light-only — no dark theme.
 */

const colorVar = (role: string) => `var(--color-${kebab(role)})`;

const colors = Object.fromEntries(
  Object.keys(colorRoles.light).map((role) => [kebab(role), colorVar(role)]),
);

export const tokenPreset = {
  theme: {
    extend: {
      colors,
      fontFamily: {
        display: [...fontFamily.display],
        sans: [...fontFamily.sans],
        mono: [...fontFamily.mono],
      },
      fontSize: {
        xs: [fontSize.xs, { lineHeight: lineHeight.xs }],
        sm: [fontSize.sm, { lineHeight: lineHeight.sm }],
        base: [fontSize.base, { lineHeight: lineHeight.base }],
        lg: [fontSize.lg, { lineHeight: lineHeight.lg }],
        xl: [fontSize.xl, { lineHeight: lineHeight.xl }],
        '2xl': [fontSize['2xl'], { lineHeight: lineHeight['2xl'] }],
        '3xl': [fontSize['3xl'], { lineHeight: lineHeight['3xl'] }],
      },
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
        content: '1200px',
      },
    },
  },
} satisfies Partial<Config>;

function kebab(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export default tokenPreset;
