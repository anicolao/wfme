import { expect, type Page } from '@playwright/test';

const firebaseReadinessTimeout = 60_000;

export async function waitForFirebase(page: Page) {
  await expect(page.getByTestId('firebase-status')).toHaveText('Live Firebase ready', {
    timeout: firebaseReadinessTimeout
  });
}

export async function reloadGameClient(page: Page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: firebaseReadinessTimeout });
  await waitForFirebase(page);
}
