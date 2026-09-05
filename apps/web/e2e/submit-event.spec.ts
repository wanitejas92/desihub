import { test, expect } from './fixtures';

/**
 * End-to-end cover for public event submission — the flow that was returning
 * "Something went wrong. Please try again." for every logged-out visitor.
 *
 * The database half of that bug (RLS refusing an anonymous insert) is pinned
 * down in supabase/tests/submit_public_event.test.sql, which runs against a
 * real Postgres with the real policies. What is checked here is the half that
 * lives in the browser: that the form collects every field the schema now
 * requires, that a failure is *reported* rather than swallowed, and that a
 * success is confirmed.
 */

const REQUIRED = {
  title: 'Playwright Diwali Night',
  startsAt: '2027-10-10T18:30',
  city: 'Amsterdam',
  organiser: 'Playwright Events NL',
  description: 'An end-to-end test event with everything the schema asks for.',
  highlights: 'Live dhol, street food, dandiya floor',
  terms: 'Entry by ticket only. No refunds within 48 hours.',
};

async function fillRequiredFields(page: import('@playwright/test').Page, title = REQUIRED.title) {
  await page.getByLabel('Event title').fill(title);
  await page.getByLabel('Date & time').fill(REQUIRED.startsAt);
  await page.locator('select#city').selectOption(REQUIRED.city);
  await page.getByLabel('Your / organiser name').fill(REQUIRED.organiser);
  await page.getByLabel('About event').fill(REQUIRED.description);
  await page.getByLabel('Highlights').fill(REQUIRED.highlights);
  await page.getByLabel('Terms and conditions').fill(REQUIRED.terms);
}

test('a logged-out visitor can submit an event and is told it worked', async ({ page }) => {
  await page.goto('/submit');
  await expect(page.getByRole('heading', { name: /List your event/i })).toBeVisible();

  // No sign-in step anywhere above: this is the anonymous path, which is the
  // one that was broken.
  await fillRequiredFields(page);
  await page.getByRole('button', { name: /^Submit event$/i }).click();

  await expect(page.getByText(/submitted for review/i)).toBeVisible();
  await expect(page.getByText(/review every submission/i)).toBeVisible();
});

test('every field the schema requires is present on the form', async ({ page }) => {
  // The previous version of this suite filled three fields and called the
  // form covered, while the schema had grown to seven — so four required
  // fields had no test at all. Assert the set explicitly.
  await page.goto('/submit');
  for (const label of [
    'Event title',
    'Date & time',
    'Your / organiser name',
    'About event',
    'Highlights',
    'Terms and conditions',
  ]) {
    await expect(page.getByLabel(label)).toBeVisible();
  }
  await expect(page.locator('select#city')).toBeVisible();
});

test('an incomplete submission does not report success', async ({ page }) => {
  await page.goto('/submit');

  // Title only. Whether the browser blocks this natively or the server
  // rejects it, the one outcome that must never happen is a success screen.
  await page.getByLabel('Event title').fill('Incomplete Event');
  await page.getByRole('button', { name: /^Submit event$/i }).click();

  await expect(page.getByText(/submitted for review/i)).not.toBeVisible();
  await expect(page.getByRole('button', { name: /^Submit event$/i })).toBeVisible();
});

test('a submitted event stays out of public listings until it is reviewed', async ({ page }) => {
  // A submission becomes a draft. If one ever showed up on /browse straight
  // away, the review queue would be decorative and the site would be
  // publishing unmoderated content.
  const title = `Unreviewed Draft ${Date.now()}`;

  await page.goto('/submit');
  await fillRequiredFields(page, title);
  await page.getByRole('button', { name: /^Submit event$/i }).click();
  await expect(page.getByText(/submitted for review/i)).toBeVisible();

  await page.goto(`/browse?q=${encodeURIComponent(title)}`);
  await expect(page.getByText(title)).toHaveCount(0);
});

test('the submit page is reachable from the header on every page', async ({ page }) => {
  // The form being unreachable is the same outcome as the form being broken.
  await page.goto('/');
  const link = page.locator('a[href="/submit"]').first();
  await expect(link).toBeAttached();
});
