import { expect, type Page } from '@playwright/test';

export async function waitForFirebase(page: Page) {
  await expect(page.getByTestId('firebase-status')).toHaveText('Live Firebase ready', {
    timeout: 2_000
  });
}

export async function openFirebaseClients(pages: readonly Page[]) {
  for (const page of pages) await page.emulateMedia({ reducedMotion: 'reduce' });
  await Promise.all(pages.map((page) => page.goto('/')));
  for (const page of pages) await waitForFirebase(page);
}

export async function reloadGameClient(page: Page) {
  const replayHealthBefore = await page.getByTestId('replay-health').textContent({
    timeout: 2_000
  });
  await page.evaluate(() => { history.scrollRestoration = 'manual'; });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 2_000 });
  await waitForFirebase(page);
  if (replayHealthBefore !== null) {
    await expect(page.getByTestId('replay-health')).toHaveText(replayHealthBefore, {
      timeout: 2_000
    });
  }
  await page.evaluate(() => scrollTo(0, 0));
}
