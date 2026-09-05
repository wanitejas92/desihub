import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3210);
const executablePath = process.env.PW_CHROME || undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // DesiHub's own ticketing is off by default (MVP sends people to the
    // organiser's booking page). E2E runs with it on so both booking providers
    // stay covered — the external redirect and our native checkout.
    command: `NEXT_PUBLIC_DESIHUB_TICKETING=1 pnpm build && E2E_PORT=${PORT} PORT=${PORT} NEXT_PUBLIC_DESIHUB_TICKETING=1 pnpm start`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      // Force the in-memory repository, whatever `.env.local` says.
      //
      // Without this the suite inherits a developer's real Supabase
      // credentials, which means the tests either fail at build time (that
      // host is unreachable from CI and from sandboxes) or, worse, succeed —
      // and every run then writes test events into the production catalogue.
      // `hasSupabase()` treats an empty string as absent.
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
    },
  },
});
