import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { buildTokensCss } from './css.js';
import { colorRoles } from './tokens.js';

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

  it('provides a data-theme=dark override for the manual toggle', () => {
    expect(buildTokensCss()).toContain("[data-theme='dark']");
  });
});
