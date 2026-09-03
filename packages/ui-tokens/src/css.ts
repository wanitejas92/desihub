import { colorRoles, fontSize, lineHeight, radius, shadow, motion } from './tokens.js';

/**
 * Builds the canonical `tokens.css` from the TypeScript tokens so the web
 * app's CSS variables can never drift from the source of truth. A vitest
 * test asserts the committed file matches this output.
 */
export function buildTokensCss(): string {
  const lightVars = Object.entries(colorRoles.light)
    .map(([role, value]) => `  --color-${kebab(role)}: ${value};`)
    .join('\n');

  const darkVars = Object.entries(colorRoles.dark)
    .map(([role, value]) => `    --color-${kebab(role)}: ${value};`)
    .join('\n');

  const fontSizeVars = Object.entries(fontSize)
    .map(([key, value]) => `  --font-size-${key}: ${value};`)
    .join('\n');

  const lineHeightVars = Object.entries(lineHeight)
    .map(([key, value]) => `  --line-height-${key}: ${value};`)
    .join('\n');

  const radiusVars = Object.entries(radius)
    .map(([key, value]) => `  --radius-${key}: ${value};`)
    .join('\n');

  return `/* GENERATED FILE — do not edit by hand.
 * Source: packages/ui-tokens/src/tokens.ts
 * Regenerate: pnpm --filter @desihub/ui-tokens gen:css
 */

:root {
${lightVars}
${fontSizeVars}
${lineHeightVars}
${radiusVars}
  --shadow-elevation: ${shadow.elevation};
  --motion-fast: ${motion.fast};
  --motion-base: ${motion.base};
  --motion-slow: ${motion.slow};
  --motion-ease: ${motion.ease};
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${darkVars}
    color-scheme: dark;
  }
}

:root[data-theme='dark'] {
${darkVars.replace(/^ {4}/gm, '  ')}
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
