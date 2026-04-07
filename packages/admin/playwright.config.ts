/**
 * Playwright test configuration for the admin data-display suites.
 */
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3002';
const reuseExistingServer =
  !process.env.CI && process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === '1';

/**
 * Playwright config for seeded admin shell, data-display, and audit journeys.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html']] : [['list'], ['html']],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command:
      'bash -lc \'pnpm --dir ../.. exec firebase emulators:start --project demo-startup-template --only firestore >/tmp/admin-firestore-emulator.log 2>&1 & EMULATOR_PID=$!; trap "kill $EMULATOR_PID" EXIT; for i in {1..60}; do (echo > /dev/tcp/127.0.0.1/8080) >/dev/null 2>&1 && break; sleep 1; done; APP_URL=http://127.0.0.1:3002 pnpm dev --host 127.0.0.1 --port 3002\'',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer,
  },
});
