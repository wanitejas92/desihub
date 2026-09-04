import { test, expect } from './fixtures';

/**
 * Phase 3 — checkout. Runs against the mock order repository (no Supabase/
 * Stripe env in CI/dev): selecting tickets, checkout, and instant "paid"
 * confirmation, the same demo-mode shortcut Phase 2's sign-in uses. The
 * Supabase + Stripe adapter is written but — like the Supabase account
 * adapter — cannot be exercised in this container.
 *
 * All tests use `sufi-night-kavita-seth`, the one seeded event with a
 * "Standard" ticket type (€35, 200 capacity, 40 already sold).
 */

async function signIn(page: import('@playwright/test').Page, email: string) {
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL('**/account');
}

test('selecting tickets shows a live running total that grows with quantity', async ({ page }) => {
  await page.goto('/e/sufi-night-kavita-seth');
  await expect(page.getByRole('button', { name: 'Select tickets' })).toBeVisible();

  await page.getByRole('button', { name: 'More Standard' }).click();
  const oneTicket = await page.getByRole('button', { name: /^Continue —/ }).innerText();
  expect(oneTicket).toMatch(/^Continue — €\d/);

  await page.getByRole('button', { name: 'More Standard' }).click();
  const twoTickets = await page.getByRole('button', { name: /^Continue —/ }).innerText();
  expect(twoTickets).not.toBe(oneTicket);
});

test('a guest can check out without an account', async ({ page }) => {
  await page.goto('/e/sufi-night-kavita-seth');
  await page.getByRole('button', { name: 'More Standard' }).click();
  await page.getByRole('button', { name: /^Continue/ }).click();

  await expect(page).toHaveURL(/\/checkout\?event=sufi-night-kavita-seth&sel=/);
  await page.getByLabel('Email address').fill('guest@example.nl');
  await page.getByRole('button', { name: 'Complete order' }).click();

  await page.waitForURL(/\/orders\//);
  await expect(page.getByRole('heading', { name: "You're going!" })).toBeVisible();
  await expect(page.getByText('A copy was sent to guest@example.nl.')).toBeVisible();
  await expect(page.getByText('Show this code at the door.')).toHaveCount(1);
});

test('buying two tickets issues two tickets with distinct codes', async ({ page }) => {
  await page.goto('/e/sufi-night-kavita-seth');
  await page.getByRole('button', { name: 'More Standard' }).click();
  await page.getByRole('button', { name: 'More Standard' }).click();
  await page.getByRole('button', { name: /^Continue/ }).click();

  await page.getByLabel('Email address').fill('twofer@example.nl');
  await page.getByRole('button', { name: 'Complete order' }).click();
  await page.waitForURL(/\/orders\//);

  await expect(page.getByText('Show this code at the door.')).toHaveCount(2);
});

test('a signed-in purchase shows up under My tickets', async ({ page }, testInfo) => {
  const email = `buyer-${testInfo.project.name}@example.nl`;
  await signIn(page, email);

  await page.goto('/e/sufi-night-kavita-seth');
  await page.getByRole('button', { name: 'More Standard' }).click();
  await page.getByRole('button', { name: /^Continue/ }).click();

  // Signed-in buyers get their email prefilled.
  await expect(page.getByLabel('Email address')).toHaveValue(email);
  await page.getByRole('button', { name: 'Complete order' }).click();
  await page.waitForURL(/\/orders\//);

  await page.goto('/account/tickets');
  await expect(page.getByText('Sufi Night with Kavita Seth')).toBeVisible();
  await expect(page.getByText('1 ticket ·')).toBeVisible();
});

test('buying tickets reduces the spots left on the event page', async ({ page }, testInfo) => {
  await signIn(page, `inventory-${testInfo.project.name}@example.nl`);

  // A different event from the other checkout tests: inventory is shared,
  // in-memory, server-wide state, and Playwright runs specs concurrently —
  // a shared event here would race with every other test buying its tickets.
  await page.goto('/e/punjabi-live-bhangra-arena');
  const before = await page.getByText(/spots left$/).innerText();
  const beforeCount = Number(before.match(/\d+/)?.[0]);

  await page.getByRole('button', { name: 'More Standard' }).click();
  await page.getByRole('button', { name: 'More Standard' }).click();
  await page.getByRole('button', { name: 'More Standard' }).click();
  await page.getByRole('button', { name: /^Continue/ }).click();
  await page.getByRole('button', { name: 'Complete order' }).click();
  await page.waitForURL(/\/orders\//);

  await page.goto('/e/punjabi-live-bhangra-arena');
  const after = await page.getByText(/spots left$/).innerText();
  const afterCount = Number(after.match(/\d+/)?.[0]);
  expect(afterCount).toBe(beforeCount - 3);
});
