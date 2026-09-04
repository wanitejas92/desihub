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

/**
 * A per-run suffix for demo sign-in emails.
 *
 * The mock account store is a globalThis singleton in the server process, and
 * `reuseExistingServer` means a local dev server survives between runs — so a
 * fixed address carries last run's follows and orders into this one, and a
 * "Follow DesiBeats" button turns up already reading "Following". Salting the
 * address per run makes each run start from a genuinely new account.
 */
export const RUN_ID = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function demoEmail(prefix: string, project: string): string {
  return `${prefix}-${project}-${RUN_ID}@example.nl`;
}

export { expect };
