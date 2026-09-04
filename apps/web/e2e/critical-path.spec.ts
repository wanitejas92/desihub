import { test, expect, demoEmail } from './fixtures';

/**
 * Critical path for the listings layer: discover → browse → filter → event →
 * submit. Payments/wallet/scan arrive in later phases; this covers everything
 * Phase 1 ships. Runs against both mobile and desktop projects.
 */

/**
 * The mock account adapter reads the role off the address (see
 * `mockRoleFor`), which is the only way to get an admin offline — there is no
 * `profiles` row to promote.
 */
async function signInAsAdmin(page: import('@playwright/test').Page, project: string) {
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(demoEmail('admin', project));
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL('**/account');
}

test('home shows the season strip and event sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Trending events' })).toBeVisible();
  // At least one event card links to an event page, and carries the four
  // things a card is allowed to say: date, title, venue, price. (Cards no
  // longer repeat a "Trending" badge under a heading that already says it.)
  // Scoped to the grid: the promo carousel's slides are also /e/ links, and
  // a banner is not a card.
  const card = page.getByTestId('event-grid').locator('a[href^="/e/"]').first();
  await expect(card).toBeVisible();
  await expect(card.getByRole('heading')).toBeVisible();
});

test('the promo carousel rotates and its dots jump between banners', async ({ page }) => {
  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Featured events' });
  await expect(carousel).toBeVisible();

  // Three demo banners, so three dots, first one current.
  const dots = carousel.getByRole('button', { name: /^Show / });
  await expect(dots).toHaveCount(3);
  await expect(dots.first()).toHaveAttribute('aria-current', 'true');

  // Jumping is immediate — a reader must not have to wait for the rotation.
  await dots.nth(2).click();
  await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true');
  await expect(dots.first()).toHaveAttribute('aria-current', 'false');

  // Every slide carries alt text; a banner with no text alternative would be
  // invisible to screen readers and to search.
  await expect(carousel.getByAltText('Diwali season across the Netherlands')).toBeVisible();
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
  await expect(page.getByRole('button', { name: /Add to calendar/i }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Share/i })).toBeVisible();
  await expect(page.getByText('Standard')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Select tickets' })).toBeVisible();
  // The information grid answers what/when/where without scrolling for it.
  await expect(page.getByRole('heading', { name: 'Event information' })).toBeVisible();

  // JSON-LD Event schema is present for SEO.
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().innerText();
  const parsed = JSON.parse(jsonLd);
  expect(parsed['@type']).toBe('Event');
  expect(parsed.name).toBe('Sufi Night with Kavita Seth');
});

test('a free event offers the calendar, not a ticket CTA', async ({ page }) => {
  await page.goto('/e/ganesh-chaturthi-aarti');
  await expect(page.getByText('No ticket or registration needed')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Book now' })).toHaveCount(0);
});

test('an externally-booked event warns before handing the visitor over', async ({ page }) => {
  await page.goto('/e/bollywood-saturdays-oct');
  // The card states who takes the money, before anything is clicked.
  await expect(page.getByText(/Booking and payment are handled by/i).first()).toBeVisible();

  await page.getByRole('link', { name: 'Book now' }).first().click();

  // A confirmation, not a silent redirect — the visitor must never believe
  // DesiHub is processing their payment.
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText("You're leaving DesiHub")).toBeVisible();
  await expect(dialog.getByText('desibeats.example.org')).toBeVisible();
  await expect(dialog.getByRole('link', { name: /Continue to booking/i })).toHaveAttribute(
    'href',
    /desibeats\.example\.org/,
  );

  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();
  // Cancelling keeps us on DesiHub.
  expect(page.url()).toContain('/e/bollywood-saturdays-oct');
});

test('a free-registration event asks people to register', async ({ page }) => {
  await page.goto('/e/desi-professionals-meetup');
  await expect(page.getByRole('link', { name: 'Register' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Book now' })).toHaveCount(0);
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

test('the admin portal turns away anyone who is not an admin', async ({ page }, testInfo) => {
  // Signed out: sent to sign-in, with the destination preserved.
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/sign-in\?next=/);

  // Signed in as an ordinary attendee: sent home, not to sign-in — they are
  // authenticated, they just lack the role.
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(demoEmail('attendee', testInfo.project.name));
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL('**/account');

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/$/);
});

test('admin import extracts fields from pasted text (text-only)', async ({ page }, testInfo) => {
  await signInAsAdmin(page, testInfo.project.name);
  await page.goto('/admin/import');
  await page.getByRole('button', { name: 'Use sample' }).click();
  await page.getByRole('button', { name: 'Extract fields' }).click();
  // Assert on the extracted-draft definition list, not the whole page.
  await expect(page.locator('dd').filter({ hasText: 'Amsterdam' })).toBeVisible();
  await expect(page.locator('dd').filter({ hasText: 'Garba & Dandiya' })).toBeVisible();
  // The copyright guardrail is always shown.
  await expect(page.getByText(/never copy images/i)).toBeVisible();
});
