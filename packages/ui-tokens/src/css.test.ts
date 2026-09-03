import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { buildTokensCss } from './css';
import { colorRoles } from './tokens';

const here = dirname(fileURLToPath(import.meta.url));

describe('tokens.css', () => {
  it('committed file matches the generated output (no drift from tokens.ts)', () => {
    const onDisk = readFileSync(resolve(here, 'tokens.css'), 'utf8');
    expect(onDisk).toBe(buildTokensCss());
  });

  it('defines every light role as a CSS variable', () => {
    const css = buildTokensCss();
    for (const role of Object.keys(colorRoles.light)) {
      const varName = `--color-${role.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
      expect(css).toContain(varName);
    }
  });

  it('is light-only — no dark theme branching (brief: never a dark background)', () => {
    const css = buildTokensCss();
    expect(css).not.toContain('prefers-color-scheme: dark');
    expect(css).not.toContain('data-theme');
    expect(css).toContain('color-scheme: light');
  });
});
