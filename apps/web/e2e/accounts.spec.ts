import { test, expect, demoEmail } from './fixtures';

/**
 * Phase 2 — accounts. These run against the mock account adapter (no
 * Supabase env in CI/dev), which is exactly the path a contributor gets
 * locally: demo sign-in, in-memory account, real RLS-shaped behaviour.
 *
 * Each test signs in with its own email so the in-memory accounts don't
 * collide across the parallel mobile/desktop projects.
 */

async function signIn(page: import('@playwright/test').Page, email: string) {
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL('**/account');
}

test('account pages require signing in, and send you back afterwards', async ({ page }) => {
  await page.goto('/account/saved');
  await expect(page).toHaveURL(/\/sign-in\?next=/);
  await expect(page.getByRole('heading', { name: 'Sign in to DesiHub' })).toBeVisible();
});

test('demo sign-in creates an account and the header reflects it', async ({ page }, testInfo) => {
  const email = demoEmail('header', testInfo.project.name);

  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();

  await signIn(page, email);

  await expect(page.getByRole('heading', { name: 'Your account' })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  // The header swaps the sign-in link for the account avatar.
  await expect(page.getByRole('link', { name: `Account — ${email}` })).toBeVisible();
});

test('an event saved before signing in follows you into the account', async ({
  page,
}, testInfo) => {
  const email = demoEmail('merge', testInfo.project.name);

  await page.goto('/browse');
  const heart = page.getByRole('button', { name: 'Save to favourites' }).first();
  await heart.click();
  await expect(page.getByRole('button', { name: 'Remove from favourites' }).first()).toBeVisible();

  await signIn(page, email);
  await page.goto('/account/saved');

  // The anonymous save became an account save — the Phase 1 promise that
  // saving without an account would not be wasted effort.
  await expect(page.getByRole('heading', { name: /Coming up|Already happened/ })).toBeVisible();
  await expect(page.locator('a[href^="/e/"]').first()).toBeVisible();
});

test('saving while signed in survives a full page reload', async ({ page }, testInfo) => {
  await signIn(page, demoEmail('persist', testInfo.project.name));

  await page.goto('/browse');
  await page.getByRole('button', { name: 'Save to favourites' }).first().click();
  await expect(page.getByRole('button', { name: 'Remove from favourites' }).first()).toBeVisible();

  await page.goto('/account/saved');
  await expect(page.locator('a[href^="/e/"]').first()).toBeVisible();
});

test('profile edits persist', async ({ page }, testInfo) => {
  await signIn(page, demoEmail('profile', testInfo.project.name));

  await page.getByLabel('Name').fill('Rehan');
  await page.getByLabel('Your city').selectOption('Utrecht');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Profile saved.')).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('Name')).toHaveValue('Rehan');
  await expect(page.getByLabel('Your city')).toHaveValue('Utrecht');
  // The heading picks up the saved name.
  await expect(page.getByRole('heading', { name: 'Rehan' })).toBeVisible();
});

test('following an organiser shows up under Following', async ({ page }, testInfo) => {
  await signIn(page, demoEmail('follow', testInfo.project.name));

  await page.goto('/o/desibeats');
  await page.getByRole('button', { name: /^Follow / }).click();
  await expect(page.getByRole('button', { name: 'Following' })).toBeVisible();

  await page.goto('/account/following');
  await expect(page.locator('a[href^="/o/"]').first()).toBeVisible();
});

test('signing out returns to the anonymous experience', async ({ page }, testInfo) => {
  await signIn(page, demoEmail('signout', testInfo.project.name));

  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL('/');

  await page.goto('/account');
  await expect(page).toHaveURL(/\/sign-in/);
});
