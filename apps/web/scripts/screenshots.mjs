import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:3100';
const OUT = process.env.OUT ?? '/tmp/shots';
const EXE =
  process.env.PW_CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
mkdirSync(OUT, { recursive: true });

const pages = [
  ['home', '/'],
  ['browse', '/browse'],
  ['browse-filtered', '/browse?category=garba_dandiya'],
  ['event', '/e/sufi-night-kavita-seth'],
  ['event-free', '/e/ganesh-chaturthi-aarti'],
  ['organiser', '/o/desibeats'],
  ['submit', '/submit'],
  ['admin-import', '/admin/import'],
];

const viewports = [
  ['390', 390, 844],
  ['1440', 1440, 900],
];

const browser = await chromium.launch({ executablePath: EXE });
for (const theme of ['light', 'dark']) {
  for (const [vpName, width, height] of viewports) {
    const ctx = await browser.newContext({
      viewport: { width, height },
      colorScheme: theme,
    });
    // Force the app's theme attribute before any script runs.
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem('desihub-theme', t);
      } catch {}
    }, theme);
    const page = await ctx.newPage();
    // Block external requests (fonts) so pages settle fast; the app degrades to
    // its fallback font stack, which is what an offline/slow user sees anyway.
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith(BASE) || url.startsWith('data:')) route.continue();
      else route.abort();
    });
    for (const [name, path] of pages) {
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${OUT}/${name}-${vpName}-${theme}.png`, fullPage: true });
    }
    await ctx.close();
  }
}
await browser.close();
console.log('done');
