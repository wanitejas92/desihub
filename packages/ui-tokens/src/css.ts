import {
  colorRoles,
  categoryPalette,
  fontSize,
  lineHeight,
  letterSpacing,
  radius,
  shadow,
  motion,
} from './tokens';

/**
 * Builds the canonical `tokens.css` from the TypeScript tokens so the web
 * app's CSS variables can never drift from the source of truth. A vitest
 * test asserts the committed file matches this output.
 *
 * Theme handling covers the three states a viewer can actually be in, which
 * is the part that is easy to get wrong:
 *
 *   1. no explicit choice, light OS   → bare `:root`
 *   2. no explicit choice, dark OS    → `@media (prefers-color-scheme: dark)`
 *   3. an explicit choice             → `[data-theme="light"|"dark"]`
 *
 * The media query is guarded with `:not([data-theme='light'])` so choosing
 * light on a dark OS actually wins, and the `[data-theme='dark']` block is
 * repeated after it so choosing dark on a light OS wins too. Every role is
 * declared in the bare `:root` block first — a colour whose only definition
 * lives inside a media query is the classic "unreadable in one theme" bug.
 */
export function buildTokensCss(): string {
  const roleVars = (theme: 'light' | 'dark', indent: string) =>
    Object.entries(colorRoles[theme])
      .map(([role, value]) => `${indent}--color-${kebab(role)}: ${value};`)
      .join('\n');

  const categoryVars = (variant: 'base' | 'soft' | 'onDark', indent: string) =>
    Object.entries(categoryPalette)
      .map(([hue, values]) => `${indent}--category-${hue}: ${values[variant]};`)
      .join('\n');

  const scaleVars = (prefix: string, values: Record<string, string>, indent = '  ') =>
    Object.entries(values)
      .map(([key, value]) => `${indent}--${prefix}-${key}: ${value};`)
      .join('\n');

  return `/* GENERATED FILE — do not edit by hand.
 * Source: packages/ui-tokens/src/tokens.ts
 * Regenerate: pnpm --filter @desihub/ui-tokens gen:css
 */

:root {
${roleVars('light', '  ')}
${categoryVars('base', '  ')}
${categoryVars('soft', '  ')}
${scaleVars('font-size', fontSize)}
${scaleVars('line-height', lineHeight)}
${scaleVars('tracking', letterSpacing)}
${scaleVars('radius', radius)}
  --shadow-elevation: ${shadow.elevation};
  --shadow-elevation-lg: ${shadow.elevationLg};
  --motion-fast: ${motion.fast};
  --motion-base: ${motion.base};
  --motion-slow: ${motion.slow};
  --motion-ease: ${motion.ease};
  color-scheme: light;
}

/* Dark by system preference — unless the viewer explicitly chose light. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${roleVars('dark', '    ')}
${categoryVars('onDark', '    ')}
    --shadow-elevation: 0 2px 8px rgba(0, 0, 0, 0.4);
    --shadow-elevation-lg: 0 12px 32px rgba(0, 0, 0, 0.55);
    color-scheme: dark;
  }
}

/* Dark by explicit choice — wins on a light OS too. */
:root[data-theme='dark'] {
${roleVars('dark', '  ')}
${categoryVars('onDark', '  ')}
  --shadow-elevation: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-elevation-lg: 0 12px 32px rgba(0, 0, 0, 0.55);
  color-scheme: dark;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-fast: 0ms;
    --motion-base: 0ms;
    --motion-slow: 0ms;
  }
}
`;
}

function kebab(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
