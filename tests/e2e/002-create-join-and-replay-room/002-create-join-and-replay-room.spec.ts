import { expect, test } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('players create, join, choose Commanders, and converge on readiness', async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext();
  const host = await context.newPage();
  const guest = await context.newPage();
  await host.goto(`${baseURL}/play/`);
  await guest.goto(`${baseURL}/play/`);
  const hostSteps = new TestStepHelper(host, testInfo, '002-create-join-and-replay-room', 'host');
  const guestSteps = new TestStepHelper(guest, testInfo, '002-create-join-and-replay-room', 'guest');

  await hostSteps.gesture('host-name', () => host.getByLabel('Display name').fill('Mara'), async () => {
    await expect(host.getByLabel('Display name')).toHaveValue('Mara');
  });
  await hostSteps.gesture('create-room', () => host.getByRole('button', { name: 'Create a room' }).click(), async () => {
    await expect(host.getByTestId('room-code')).toHaveText(/^[A-Z0-9]{5}$/);
    await expect(host.getByText('Mara')).toBeVisible();
  });
  const code = await host.getByTestId('room-code').innerText();
  await guestSteps.gesture('guest-name', () => guest.getByLabel('Display name').fill('Rin'), async () => {
    await expect(guest.getByLabel('Display name')).toHaveValue('Rin');
  });
  await guestSteps.gesture('guest-room-code', () => guest.getByLabel('Room code').fill(code), async () => {
    await expect(guest.getByLabel('Room code')).toHaveValue(code);
  });
  await guestSteps.gesture('join-room', () => guest.getByRole('button', { name: 'Join room' }).click(), async () => {
    await expect(guest.getByText('Rin')).toBeVisible();
    await expect(guest.getByText('2/4')).toBeVisible();
  });
  await hostSteps.gesture('host-commander', () => host.getByRole('button', { name: /Aragorn/ }).click(), async () => {
    await expect(host.getByRole('button', { name: /Aragorn/ })).toHaveAttribute('aria-pressed', 'true');
  });
  await hostSteps.gesture('host-ready', () => host.getByRole('button', { name: 'I am ready' }).click(), async () => {
    await expect(host.getByRole('button', { name: 'Withdraw readiness' })).toBeVisible();
  });
  await guestSteps.gesture('guest-commander', () => guest.getByRole('button', { name: /Galadriel/ }).click(), async () => {
    await expect(guest.getByRole('button', { name: /Galadriel/ })).toHaveAttribute('aria-pressed', 'true');
  });
  await guestSteps.gesture('guest-ready', () => guest.getByRole('button', { name: 'I am ready' }).click(), async () => {
    await expect(guest.getByText('Ready').first()).toBeVisible();
    await expect(guest.getByTestId('event-count')).toHaveText('7');
  });

  await expect(host.getByText('Ready').first()).toBeVisible();
  await expect(host.getByText('Ready').nth(1)).toBeVisible();
  await expect(guest.getByText('Ready').first()).toBeVisible();
  await expect(guest.getByText('Ready').nth(1)).toBeVisible();
  await context.close();
});
