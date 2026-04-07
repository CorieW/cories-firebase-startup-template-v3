/**
 * Playwright test configuration.
 */
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3001';
const reuseExistingServer =
  !process.env.CI && process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === '1';
const runCrossBrowserMatrix = Boolean(process.env.CI);
const configuredProjects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'msedge',
    use: {
      ...devices['Desktop Edge'],
      channel: 'msedge',
    },
  },
  {
    name: 'mobile-chrome',
    use: { ...devices['Pixel 7'] },
  },
  {
    name: 'mobile-safari',
    use: { ...devices['iPhone 14'] },
  },
];

/**
 * Playwright config for smoke/core journeys across desktop, Edge, and mobile.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html']] : [['list'], ['html']],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: runCrossBrowserMatrix
    ? configuredProjects
    : configuredProjects.filter(project => project.name === 'chromium'),
  webServer: {
    command:
      'bash -lc \'pnpm --dir ../.. exec firebase emulators:start --project demo-startup-template --only firestore >/tmp/dashboard-firestore-emulator.log 2>&1 & EMULATOR_PID=$!; trap "kill $EMULATOR_PID" EXIT; for i in {1..60}; do (echo > /dev/tcp/127.0.0.1/8080) >/dev/null 2>&1 && break; sleep 1; done; APP_URL=http://127.0.0.1:3001 pnpm dev --host 127.0.0.1 --port 3001\'',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer,
  },
});
