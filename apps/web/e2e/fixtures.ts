import { test as base, expect } from '@playwright/test';

/**
 * The app loads Inter from Google Fonts with a render-blocking
 * `<link rel="stylesheet">`. In CI and in sandboxed dev containers that host
 * is unreachable, and because the stylesheet blocks the `load` event every
 * `page.goto` sits there for ~12.6s before giving up (measured) — enough to
 * blow a multi-navigation test's budget for reasons that have nothing to do
 * with the app.
 *
 * No assertion in this suite depends on the webfont, so the request is
 * dropped. Navigations go from ~12.6s to ~0.3s.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
    await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
    await use(page);
  },
});

export { expect };
