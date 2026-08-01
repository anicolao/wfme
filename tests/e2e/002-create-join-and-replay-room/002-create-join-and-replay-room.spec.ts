import { expect, test } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';

test('two independent players create, join, ready, start, and take a synchronized turn', async ({ browser, baseURL }, testInfo) => {
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  await host.goto(`${baseURL}/`); await guest.goto(`${baseURL}/`);
  await expect(host.getByTestId('firebase-status')).toHaveText('Live multiplayer ready');
  await expect(guest.getByTestId('firebase-status')).toHaveText('Live multiplayer ready');
  const hostSteps = new TestStepHelper(host, testInfo, '002-create-join-and-replay-room', 'host');
  const guestSteps = new TestStepHelper(guest, testInfo, '002-create-join-and-replay-room', 'guest');

  await hostSteps.gesture('host-name', () => host.getByLabel('Display name').fill('Mara'), async () => expect(host.getByLabel('Display name')).toHaveValue('Mara'));
  await hostSteps.gesture('create-room', () => host.getByRole('button', { name: 'Create game' }).click(), async () => { await expect(host.getByTestId('room-code')).toHaveText(/^[A-Z0-9]{5}$/); await expect(host.getByText('Mara')).toBeVisible(); });
  const code = await host.getByTestId('room-code').innerText();
  await guestSteps.gesture('guest-name', () => guest.getByLabel('Display name').fill('Rin'), async () => expect(guest.getByLabel('Display name')).toHaveValue('Rin'));
  await guestSteps.gesture('guest-room-code', () => guest.getByLabel('Room code').fill(code), async () => expect(guest.getByLabel('Room code')).toHaveValue(code));
  await guestSteps.gesture('join-room', () => guest.getByRole('button', { name: 'Join game' }).click(), async () => { await expect(guest.getByText('Rin')).toBeVisible(); await expect(guest.getByText('2/4')).toBeVisible(); });
  await hostSteps.gesture('host-commander', () => host.getByRole('button', { name: /Aragorn/ }).click(), async () => expect(host.getByRole('button', { name: /Aragorn/ })).toHaveAttribute('aria-pressed', 'true'));
  await hostSteps.gesture('host-ready', () => host.getByRole('button', { name: 'I am ready' }).click(), async () => expect(host.getByRole('button', { name: 'Withdraw readiness' })).toBeVisible());
  await guestSteps.gesture('guest-commander', () => guest.getByRole('button', { name: /Galadriel/ }).click(), async () => expect(guest.getByRole('button', { name: /Galadriel/ })).toHaveAttribute('aria-pressed', 'true'));
  await guestSteps.gesture('guest-ready', () => guest.getByRole('button', { name: 'I am ready' }).click(), async () => expect(guest.getByText('Ready').first()).toBeVisible());
  await hostSteps.gesture('start-game', () => host.getByRole('button', { name: 'Start game' }).click(), async () => { await expect(host.getByRole('heading', { name: "Mara's turn" })).toBeVisible(); await expect(guest.getByRole('heading', { name: "Mara's turn" })).toBeVisible(); });
  await hostSteps.gesture('take-turn', () => host.getByRole('button', { name: 'Travel to Edoras' }).click(), async () => { await expect(host.getByText('Mara: Travel to Edoras')).toBeVisible(); await expect(guest.getByText('Mara: Travel to Edoras')).toBeVisible(); await expect(guest.getByRole('heading', { name: "Rin's turn" })).toBeVisible(); });

  await hostContext.close(); await guestContext.close();
});
