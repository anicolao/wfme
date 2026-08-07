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
    actionTimeout: 2_000,
    navigationTimeout: 2_000,
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
  snapshotPathTemplate: '{testDir}/{testFileDir}/screenshots/{arg}.png',
  webServer: {
    // Exercise one production bundle instead of rebuilding Vite's development
    // module graph for every fresh browser context. This keeps application boot
    // and Firebase Auth hydration inside the strict 2-second readiness window.
    command: 'bun run build && bun run preview:e2e',
    url: 'http://127.0.0.1:5189',
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      VITE_FIREBASE_API_KEY: 'e2e-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'wfme-e2e.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'wfme-e2e',
      VITE_FIREBASE_STORAGE_BUCKET: 'wfme-e2e.firebasestorage.app',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
      VITE_FIREBASE_APP_ID: '1:123456789:web:e2e',
      VITE_USE_FIREBASE_EMULATORS: 'true',
      VITE_FIRESTORE_EMULATOR_HOST: '127.0.0.1',
      VITE_FIRESTORE_EMULATOR_PORT: '8190',
      VITE_FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1',
      VITE_FIREBASE_AUTH_EMULATOR_PORT: '9204',
      VITE_GIT_HASH: 'e2e-test-commit'
    }
  },
  timeout: 600_000,
  expect: { timeout: 2_000, toHaveScreenshot: { maxDiffPixels: 0 } }
});
