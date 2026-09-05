import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { buildTokensCss } from './css';
import { colorRoles, categoryPalette } from './tokens';

const here = dirname(fileURLToPath(import.meta.url));
const kebab = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

describe('tokens.css', () => {
  it('committed file matches the generated output (no drift from tokens.ts)', () => {
    const onDisk = readFileSync(resolve(here, 'tokens.css'), 'utf8');
    expect(onDisk).toBe(buildTokensCss());
  });

  it('defines every role in the bare :root block', () => {
    // The classic unreadable-artifact bug is a colour whose only definition
    // sits inside a media query: in the un-stamped default state it never
    // applies, and the page renders one theme's text on the other's ground.
    const rootBlock = buildTokensCss().split('/* Dark by system preference')[0]!;
    for (const role of Object.keys(colorRoles.light)) {
      expect(rootBlock).toContain(`--color-${kebab(role)}:`);
    }
  });

  it('redefines every role again in both dark blocks', () => {
    const css = buildTokensCss();
    const mediaBlock = css.split('@media (prefers-color-scheme: dark)')[1]!.split('}')[0]!;
    const explicitBlock = css.split(":root[data-theme='dark']")[1]!.split('\n}')[0]!;
    for (const role of Object.keys(colorRoles.dark)) {
      expect(mediaBlock).toContain(`--color-${kebab(role)}:`);
      expect(explicitBlock).toContain(`--color-${kebab(role)}:`);
    }
  });

  it('lets an explicit light choice beat a dark OS', () => {
    // Without the :not() guard, a viewer who picked light on a dark OS still
    // gets dark — the media query would keep winning.
    expect(buildTokensCss()).toContain(":root:not([data-theme='light'])");
  });

  it('lets an explicit dark choice beat a light OS', () => {
    const css = buildTokensCss();
    // The explicit block must come *after* the media query to win the cascade.
    expect(css.indexOf(":root[data-theme='dark']")).toBeGreaterThan(
      css.indexOf('@media (prefers-color-scheme: dark)'),
    );
  });

  it('has exactly one accent, not three competing ones', () => {
    // The previous system exposed accent/accent-pink/accent-purple as
    // co-equal roles, so nothing on a page read as *the* action.
    const css = buildTokensCss();
    expect(css).not.toContain('--color-accent-pink');
    expect(css).not.toContain('--color-accent-purple');
    expect(css).toContain('--color-accent:');
  });

  it('exposes every category hue in both themes', () => {
    const css = buildTokensCss();
    for (const hue of Object.keys(categoryPalette)) {
      expect(css).toContain(`--category-${hue}:`);
    }
  });

  it('sets color-scheme in both themes so form controls follow', () => {
    const css = buildTokensCss();
    expect(css).toContain('color-scheme: light');
    expect(css).toContain('color-scheme: dark');
  });
});
