import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5189',
    trace: 'retain-on-failure',
    serviceWorkers: 'block',
    deviceScaleFactor: 1,
    timezoneId: 'America/Toronto',
    locale: 'en-CA',
    actionTimeout: 10_000,
    launchOptions: {
      args: [
        '--font-render-hinting=none',
        '--disable-font-subpixel-positioning',
        '--disable-lcd-text',
        '--force-device-scale-factor=1'
      ]
    }
  },
  projects: [
    {
      name: 'phone',
      use: { browserName: 'chromium', viewport: { width: 393, height: 852 } }
    },
    {
      name: 'desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 960 } }
    }
  ],
  webServer: {
    command: 'bun run dev:e2e',
    url: 'http://127.0.0.1:5189',
    reuseExistingServer: false,
    env: { VITE_GIT_HASH: 'e2e-test-commit' }
  },
  timeout: 60_000,
  expect: { timeout: 10_000 }
});
