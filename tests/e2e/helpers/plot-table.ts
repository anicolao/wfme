import { expect, type Browser, type BrowserContext, type Page, type TestInfo } from '@playwright/test';
import { TestStepHelper, type Verification } from './test-step-helper';
import { waitForFirebase } from './firebase-readiness';

export type PlotSeat = { name: string; page: Page; context?: BrowserContext };

export async function startPlotTable(
  browser: Browser,
  page: Page,
  testInfo: TestInfo,
  steps: TestStepHelper,
  seed: string,
  roomCodes: { phone: string; desktop: string }
) {
  const viewport = page.viewportSize() ?? { width: 1280, height: 960 };
  const guestAContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5189', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const guestBContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5189', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const seats: PlotSeat[] = [
    { name: 'Mara', page },
    { name: 'Rin', page: await guestAContext.newPage(), context: guestAContext },
    { name: 'Pip', page: await guestBContext.newPage(), context: guestBContext }
  ];
  const accepted = { value: 0 };
  const converged = (count: number, observers = seats): Verification => ({
    spec: `Every connected browser replays ${count} accepted events with no diagnostics`,
    check: async () => {
      for (const seat of observers) await expect(seat.page.getByTestId('replay-health')).toHaveText(` · ${count} accepted events · 0 replay diagnostics`, { timeout: 2_000 });
    }
  });
  const currentSeat = async () => {
    const footer = await page.locator('footer').textContent();
    const seat = seats.find((candidate) => footer?.includes(`Current actor ${candidate.name}`));
    if (!seat) throw new Error(`No current human in ${footer}`);
    return seat;
  };
  const row = (observer: PlotSeat, name: string) => observer.page.locator('.players article').filter({ hasText: name });

  for (const seat of seats) {
    await seat.page.emulateMedia({ reducedMotion: 'reduce' });
    await seat.page.goto('/');
    await waitForFirebase(seat.page);
  }
  await steps.gesture(page, 'host-name', 'Mara enters a table name', () => page.getByLabel('Display name').fill('Mara'), [
    { spec: 'The real lobby accepts the host name', check: async () => await expect(page.getByLabel('Display name')).toHaveValue('Mara') }
  ]);
  const code = testInfo.project.name === 'phone' ? roomCodes.phone : roomCodes.desktop;
  await steps.gesture(page, 'host-code', 'Mara enters the Plot Fate room code', () => page.getByLabel(/Room code/).fill(code), [
    { spec: 'The exact invitation is visible', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(code) }
  ]);
  await steps.gesture(page, 'create-room', 'Mara creates the Firebase room', async () => {
    await page.getByRole('button', { name: 'Create game' }).click(); accepted.value += 1;
  }, [{ spec: 'The requested room opens', check: async () => await expect(page.getByTestId('room-code')).toHaveText(code, { timeout: 2_000 }) }, converged(accepted.value + 1, seats.slice(0, 1))]);
  for (const [index, seat] of seats.slice(1).entries()) {
    await steps.gesture(seat.page, `guest-${index + 1}-name`, `${seat.name} enters a table name`, () => seat.page.getByLabel('Display name').fill(seat.name), [
      { spec: 'The isolated browser retains the name', check: async () => await expect(seat.page.getByLabel('Display name')).toHaveValue(seat.name) }
    ]);
    await steps.gesture(seat.page, `guest-${index + 1}-code`, `${seat.name} enters the invitation`, () => seat.page.getByLabel(/Room code/).fill(code), [
      { spec: 'The isolated browser uses the shared invitation', check: async () => await expect(seat.page.getByLabel(/Room code/)).toHaveValue(code) }
    ]);
    await steps.gesture(seat.page, `guest-${index + 1}-join`, `${seat.name} joins the room`, async () => {
      await seat.page.getByRole('button', { name: 'Join game' }).click(); accepted.value += 1;
    }, [{ spec: 'Every connected lobby sees the joined seat', check: async () => {
      for (const observer of seats.slice(0, index + 2)) await expect(observer.page.getByText(seat.name, { exact: true })).toBeVisible();
    } }, converged(accepted.value + 1, seats.slice(0, index + 2))]);
  }
  for (const [index, seat] of seats.entries()) {
    const commander = ['Aragorn', 'Galadriel', 'Gandalf'][index];
    await steps.gesture(seat.page, `commander-${index + 1}`, `${seat.name} selects ${commander}`, async () => {
      await seat.page.getByRole('button', { name: new RegExp(`^${commander}`) }).click(); accepted.value += 1;
    }, [{ spec: 'The unique identity is public', check: async () => await expect(seat.page.getByRole('button', { name: new RegExp(`^${commander}`) })).toHaveAttribute('aria-pressed', 'true') }, converged(accepted.value + 1)]);
    await steps.gesture(seat.page, `ready-${index + 1}`, `${seat.name} readies`, async () => {
      await seat.page.getByRole('button', { name: 'I am ready' }).click(); accepted.value += 1;
    }, [{ spec: 'Every observer sees the ready state', check: async () => {
      for (const observer of seats) await expect(observer.page.locator('.player-list article').filter({ hasText: seat.name })).toContainText('Ready');
    } }, converged(accepted.value + 1)]);
  }
  await steps.gesture(page, 'plot-seed', 'Mara enters the published Plot Fate seed', () => page.getByLabel('Match seed').fill(seed), [
    { spec: 'The deterministic seed is visible', check: async () => await expect(page.getByLabel('Match seed')).toHaveValue(seed) }
  ]);
  await steps.gesture(page, 'start-match', 'Mara starts the Plot Fate match', async () => {
    await page.getByRole('button', { name: 'Start seeded match' }).click(); accepted.value += 1;
  }, [{ spec: 'Every human reaches the complete production board', check: async () => {
    for (const seat of seats) await expect(seat.page.getByText('22 / 22')).toBeVisible();
  } }, converged(accepted.value + 1)]);

  return {
    seats,
    accepted,
    converged,
    currentSeat,
    row,
    close: async () => {
      await guestAContext.close();
      await guestBContext.close();
    }
  };
}
