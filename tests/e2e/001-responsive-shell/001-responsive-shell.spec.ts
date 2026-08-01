import { expect, test } from '@playwright/test';

test('the landing page is a responsive live-game lobby', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Play — The War for Middle-earth');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gather your fellowship.');
  await expect(page.getByTestId('firebase-status')).toHaveText('Live multiplayer ready');
  await expect(page.getByRole('button', { name: 'Create game' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Join game' })).toBeEnabled();
  const manifest = await page.request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({ name: 'The War for Middle-earth', display: 'standalone' });
  const viewport = page.viewportSize();
  expect(viewport).toEqual(testInfo.project.name === 'phone' ? { width: 393, height: 852 } : { width: 1280, height: 960 });
  const geometry = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
});
