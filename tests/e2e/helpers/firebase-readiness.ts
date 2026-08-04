import { expect, type Page } from '@playwright/test';

const firebaseReadinessTimeout = 60_000;

export async function waitForFirebase(page: Page) {
  await expect(page.getByTestId('firebase-status')).toHaveText('Live Firebase ready', {
    timeout: firebaseReadinessTimeout
  });
}

export async function reloadGameClient(page: Page) {
  const replayHealthBefore = await page.getByTestId('replay-health').textContent({
    timeout: firebaseReadinessTimeout
  });
  await page.evaluate(() => { history.scrollRestoration = 'manual'; });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: firebaseReadinessTimeout });
  await waitForFirebase(page);
  if (replayHealthBefore !== null) {
    await expect(page.getByTestId('replay-health')).toHaveText(replayHealthBefore, {
      timeout: firebaseReadinessTimeout
    });
  }
  await page.evaluate(() => scrollTo(0, 0));
}
