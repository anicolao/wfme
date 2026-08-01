import { expect, test } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('standing thresholds unlock Council and Captain upgrades', async ({ page }, testInfo) => {
  await page.goto('/factions/');
  const steps = new TestStepHelper(page, testInfo, '006-factions-council-and-captain', 'factions');
  const elven = page.locator('article').filter({ hasText: 'Elven Realms' });
  const gainElven = page.getByRole('link', { name: 'Gain 1 standing' }).nth(2);
  await steps.gesture('elven-standing-one', () => gainElven.click(), async () => {
    await expect(elven).toContainText('1 / 6');
  });
  await steps.gesture('elven-standing-two', () => page.getByRole('link', { name: 'Gain 1 standing' }).nth(2).click(), async () => {
    await expect(page.getByText('Council seat: Unlocked')).toBeVisible();
  });
  await steps.gesture('elven-standing-three', () => page.getByRole('link', { name: 'Gain 1 standing' }).nth(2).click(), async () => {
    await expect(elven).toContainText('3 / 6');
  });
  await steps.gesture('elven-alliance', () => page.getByRole('link', { name: 'Gain 1 standing' }).nth(2).click(), async () => {
    await expect(elven).toContainText('Alliance');
    await expect(page.getByText('Renown: 1')).toBeVisible();
  });
  await steps.gesture('claim-captain', () => page.getByRole('link', { name: 'Claim Captain of the Host' }).click(), async () => {
    await expect(page.getByText('Captain of the Host: Unlocked')).toBeVisible();
  });
});
