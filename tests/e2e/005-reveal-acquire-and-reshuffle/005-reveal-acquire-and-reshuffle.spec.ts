import { expect, test } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Reveal resolves Muster, acquires a card, and refills the Chronicle Row', async ({ page }, testInfo) => {
  await page.goto('/reveal/');
  const steps = new TestStepHelper(page, testInfo, '005-reveal-acquire-and-reshuffle', 'reveal');
  await steps.gesture('reveal-hand', () => page.getByLabel('Reveal remaining hand').click(), async () => {
    await expect(page.getByText(/Muster effects resolved/)).toBeVisible();
  });
  await steps.gesture('acquire-rider', () => page.getByRole('button', { name: /rider-rohan/ }).click({ force: true }), async () => {
    await expect(page.getByTestId('acquire-message')).toHaveText(/Acquired rider-rohan/);
    await expect(page.getByText('lady-golden-wood')).toBeVisible();
    await expect(page.getByLabel('Card zones').getByText('Influence').locator('..')).toContainText('1');
  });
});
