import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildTokensCss } from '../src/css';

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, '../src/tokens.css');
writeFileSync(target, buildTokensCss(), 'utf8');
// eslint-disable-next-line no-console
console.log(`Wrote ${target}`);
