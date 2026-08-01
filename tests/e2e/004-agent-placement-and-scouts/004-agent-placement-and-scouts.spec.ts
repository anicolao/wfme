import { expect, test } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('card icons and occupied spaces constrain Agent placement', async ({ page }, testInfo) => {
  await page.goto('/board/');
  const steps = new TestStepHelper(page, testInfo, '004-agent-placement-and-scouts', 'placement');
  await steps.gesture('choose-road-card', () => page.getByLabel('The Open Road').click(), async () => {
    await expect(page.getByLabel('The Open Road')).toBeChecked();
    await expect(page.getByRole('button', { name: /Edoras/ })).toBeEnabled();
  });
  await steps.gesture('place-edoras', () => page.getByRole('button', { name: /Edoras/ }).click(), async () => {
    await expect(page.getByTestId('placement-message')).toHaveText('Agent placed at Edoras.');
    await expect(page.getByLabel('Resources').getByText('Occupied').locator('..')).toContainText('1');
  });
});
