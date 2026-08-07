import { expect, test } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';
import { waitForFirebaseSession } from '../helpers/firebase-readiness';

test('the game opens directly at a responsive construction lobby', async ({ page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await steps.observe(page, 'construction-lobby', 'The game opens at the playable lobby', [
    { spec: 'The page is the game, not a marketing interstitial', check: async () => await expect(page).toHaveTitle('Play — The War for Middle-earth') },
    { spec: 'The Firebase session is ready before room controls are enabled', check: async () => await waitForFirebaseSession(page) },
    { spec: 'A player can immediately create or join a room', check: async () => {
      await expect(page.getByRole('button', { name: 'Create game' })).toBeEnabled();
      await expect(page.getByRole('button', { name: 'Join game' })).toBeEnabled();
    } },
    { spec: 'The current tracer boundary is explicit', check: async () => await expect(page.getByText('Tracer 1 supports a real seeded room')).toBeVisible() },
    { spec: 'The viewport has no horizontal document overflow', check: async () => {
      const size = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(size.scroll).toBeLessThanOrEqual(size.client);
    } }
  ]);

  const manifest = await page.request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({ name: 'The War for Middle-earth', display: 'standalone' });
  steps.generateDocs(
    'Responsive construction lobby',
    'A human arrives at the root URL and can begin a real multiplayer game without navigating through an advertisement or prototype index.'
  );
});
