import { test, expect } from './fixtures';

/**
 * Critical path for the listings layer: discover → browse → filter → event →
 * submit. Payments/wallet/scan arrive in later phases; this covers everything
 * Phase 1 ships. Runs against both mobile and desktop projects.
 */

test('home shows the season strip and event sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Trending now' })).toBeVisible();
  // At least one event card links to an event page.
  await expect(page.locator('a[href^="/e/"]').first()).toBeVisible();
  // The section heading plus at least one card badge both say "Trending".
  await expect(page.getByText('Trending', { exact: false }).nth(1)).toBeVisible();
});

test('quick-filter pills swap the rail below them in place, without navigating', async ({
  page,
}) => {
  await page.goto('/');
  const freePill = page.getByRole('button', { name: 'Free entry' });
  await freePill.click();
  // Still on the home page — no navigation happened.
  await expect(page).toHaveURL('/');
  // The pill stays visible and marked active, and the section below relabels.
  await expect(freePill).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Free entry' })).toBeVisible();
  // The pill row's own "See all" link is still a real, shareable browse URL.
  await expect(page.getByRole('link', { name: /see all/i }).first()).toHaveAttribute(
    'href',
    '/browse?price=free',
  );
});

test('browse filters are URL-driven and shareable', async ({ page }) => {
  await page.goto('/browse');
  await expect(page.getByRole('heading', { name: 'All events' })).toBeVisible();

  await page.goto('/browse?category=garba_dandiya');
  // The page title reflects the active category, not a generic label.
  await expect(page.getByRole('heading', { name: 'Garba & Dandiya' })).toBeVisible();
  await expect(page.getByTestId('event-grid')).toBeVisible();
  await expect(page.locator('a[href^="/e/"]').first()).toBeVisible();
  // The URL carries the filter, so the view is shareable.
  expect(page.url()).toContain('category=garba_dandiya');
});

test('browse shows a designed empty state for impossible filters', async ({ page }) => {
  await page.goto('/browse?city=Groningen&category=holi');
  await expect(page.getByText(/No events match these filters/i)).toBeVisible();
});

test('event detail shows title, price, calendar, share and JSON-LD', async ({ page }) => {
  await page.goto('/e/sufi-night-kavita-seth');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sufi Night with Kavita Seth' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /Add to calendar/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Share/i })).toBeVisible();
  await expect(page.getByText('Standard')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select tickets' })).toBeVisible();

  // JSON-LD Event schema is present for SEO.
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().innerText();
  const parsed = JSON.parse(jsonLd);
  expect(parsed['@type']).toBe('Event');
  expect(parsed.name).toBe('Sufi Night with Kavita Seth');
});

test('a free event shows the free-entry state, not a ticket CTA', async ({ page }) => {
  await page.goto('/e/ganesh-chaturthi-aarti');
  await expect(page.getByText('Free entry — no ticket needed')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get tickets' })).toHaveCount(0);
});

test('submit form validates and accepts the three required fields', async ({ page }) => {
  await page.goto('/submit');
  await expect(page.getByRole('heading', { name: /List your event/i })).toBeVisible();

  await page.getByLabel('Event title').fill('Playwright Test Garba');
  await page.getByLabel('Date & time').fill('2027-10-10T18:30');
  await page.locator('select#city').selectOption('Amsterdam');
  await page.getByRole('button', { name: /^Submit event$/i }).click();

  await expect(page.getByText(/submitted for review/i)).toBeVisible();
});

test('organiser page lists their events with a follow button', async ({ page }) => {
  await page.goto('/o/desibeats');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: /Follow/i })).toBeVisible();
  await expect(page.locator('a[href^="/e/"]').first()).toBeVisible();
});

test('admin import extracts fields from pasted text (text-only)', async ({ page }) => {
  await page.goto('/admin/import');
  await page.getByRole('button', { name: 'Use sample' }).click();
  await page.getByRole('button', { name: 'Extract fields' }).click();
  // Assert on the extracted-draft definition list, not the whole page.
  await expect(page.locator('dd').filter({ hasText: 'Amsterdam' })).toBeVisible();
  await expect(page.locator('dd').filter({ hasText: 'Garba & Dandiya' })).toBeVisible();
  // The copyright guardrail is always shown.
  await expect(page.getByText(/never copy images/i)).toBeVisible();
});
