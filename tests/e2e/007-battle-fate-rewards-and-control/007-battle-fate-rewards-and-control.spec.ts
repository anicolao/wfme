import { expect, test } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('an ordinary Battle ranks strength and locks rewards', async ({ page }, testInfo) => {
  await page.goto('/battle/');
  const steps = new TestStepHelper(page, testInfo, '007-battle-fate-rewards-and-control', 'battle');
  const aragorn = page.locator('.fighter').filter({ hasText: 'aragorn' });
  const galadriel = page.locator('.fighter').filter({ hasText: 'galadriel' });
  await steps.gesture('deploy-recruit', () => page.getByRole('link', { name: 'Deploy Aragorn recruit' }).click(), async () => {
    await expect(aragorn).toContainText('= 3');
  });
  await steps.gesture('reveal-sword', () => page.getByRole('link', { name: 'Reveal Galadriel sword' }).click(), async () => {
    await expect(galadriel).toContainText('= 2');
  });
  await steps.gesture('resolve-battle', () => page.getByRole('link', { name: 'Resolve Battle' }).click(), async () => {
    await expect(page.getByTestId('rank-1')).toContainText('Standard');
    await expect(page.getByTestId('rank-2')).toContainText('Renown');
  });
});
