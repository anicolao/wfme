import { expect, test } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('a seed fixes public setup while private hands stay seat-scoped', async ({ page }, testInfo) => {
  await page.goto('/setup/');
  const steps = new TestStepHelper(page, testInfo, '003-seeded-setup-and-private-views', 'setup');
  await steps.gesture('seed', () => page.getByLabel('Match seed').fill('second-age-042'), async () => {
    await expect(page.getByLabel('Match seed')).toHaveValue('second-age-042');
  });
  await steps.gesture('generate', () => page.getByRole('link', { name: 'Generate setup' }).click(), async () => {
    await expect(page.getByTestId('setup-seed')).toHaveText('second-age-042');
    await expect(page.getByTestId('chronicle-row').locator('span')).toHaveCount(5);
    await expect(page.getByTestId('private-hand').locator('span')).toHaveCount(5);
  });
  await steps.gesture('switch-seat', () => page.getByRole('tab', { name: 'galadriel-seat' }).click(), async () => {
    await expect(page.getByRole('tab', { name: 'galadriel-seat' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('private-hand').locator('span')).toHaveCount(5);
    await expect(page.getByTestId('chronicle-row').locator('span')).toHaveCount(5);
  });
});
