import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

type Seat = { name: string; page: Page; context?: BrowserContext };

test('Hidden Counsel draws private Fate on the shared Elven track', async ({ browser, page }, testInfo) => {
  test.setTimeout(90_000);
  const steps = new TestStepHelper(testInfo);
  const viewport = page.viewportSize() ?? { width: 1280, height: 960 };
  const guestAContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5189', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const guestBContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5189', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const seats: Seat[] = [
    { name: 'Mara', page },
    { name: 'Rin', page: await guestAContext.newPage(), context: guestAContext },
    { name: 'Pip', page: await guestBContext.newPage(), context: guestBContext }
  ];
  const converged = (count: number, connected = seats): Verification => ({
    spec: `Every connected immutable replay accepts ${count} events with no diagnostics`,
    check: async () => {
      for (const seat of connected) await expect(seat.page.getByTestId('replay-health')).toHaveText(` · ${count} accepted events · 0 replay diagnostics`, { timeout: 30_000 });
    }
  });

  try {
    for (const seat of seats) {
      await seat.page.emulateMedia({ reducedMotion: 'reduce' });
      await seat.page.goto('/');
      await expect(seat.page.getByTestId('firebase-status')).toHaveText('Live Firebase ready', { timeout: 30_000 });
    }
    await steps.gesture(page, 'host-name', 'Mara enters a table name',
      () => page.getByLabel('Display name').fill('Mara'),
      [{ spec: 'The host name is entered through the lobby', check: async () => await expect(page.getByLabel('Display name')).toHaveValue('Mara') }]);
    const roomCode = testInfo.project.name === 'phone' ? 'ELVPH' : 'ELVDS';
    await steps.gesture(page, 'host-room-code', 'Mara enters a private Elven invitation',
      () => page.getByLabel(/Room code/).fill(roomCode),
      [{ spec: 'The exact invitation is visible', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(roomCode) }]);
    await steps.gesture(page, 'create-room', 'Mara creates the room',
      () => page.getByRole('button', { name: 'Create game' }).click(),
      [{ spec: 'The requested room opens', check: async () => await expect(page.getByTestId('room-code')).toHaveText(roomCode, { timeout: 30_000 }) }, converged(1, seats.slice(0, 1))]);

    for (const [index, seat] of seats.slice(1).entries()) {
      await steps.gesture(seat.page, `guest-${index + 1}-name`, `${seat.name} enters a table name`,
        () => seat.page.getByLabel('Display name').fill(seat.name),
        [{ spec: `${seat.name}'s name is visible`, check: async () => await expect(seat.page.getByLabel('Display name')).toHaveValue(seat.name) }]);
      await steps.gesture(seat.page, `guest-${index + 1}-code`, `${seat.name} enters the invitation`,
        () => seat.page.getByLabel(/Room code/).fill(roomCode),
        [{ spec: 'The shared invitation is visible', check: async () => await expect(seat.page.getByLabel(/Room code/)).toHaveValue(roomCode) }]);
      await steps.gesture(seat.page, `guest-${index + 1}-join`, `${seat.name} joins in an isolated browser`,
        () => seat.page.getByRole('button', { name: 'Join game' }).click(),
        [{ spec: `The room shows ${index + 2} human seats`, check: async () => {
          for (const observer of seats.slice(0, index + 2)) await expect(observer.page.locator('.player-list article')).toHaveCount(index + 2);
        } }, converged(index + 2, seats.slice(0, index + 2))]);
    }

    const commanders = ['Aragorn', 'Galadriel', 'Gandalf'];
    for (const [index, seat] of seats.entries()) {
      await steps.gesture(seat.page, `seat-${index + 1}-commander`, `${seat.name} claims ${commanders[index]}`,
        () => seat.page.getByRole('button', { name: new RegExp(`^${commanders[index]}`) }).click(),
        [{ spec: 'The unique Commander identity is selected', check: async () => await expect(seat.page.getByRole('button', { name: new RegExp(`^${commanders[index]}`) })).toHaveAttribute('aria-pressed', 'true') }, converged(4 + index * 2)]);
      await steps.gesture(seat.page, `seat-${index + 1}-ready`, `${seat.name} readies their seat`,
        () => seat.page.getByRole('button', { name: 'I am ready' }).click(),
        [{ spec: 'Every observer sees the ready seat', check: async () => {
          for (const observer of seats) await expect(observer.page.locator('.player-list article').filter({ hasText: seat.name }).getByText('Ready', { exact: true })).toBeVisible();
        } }, converged(5 + index * 2)]);
    }

    await steps.gesture(page, 'choose-elven-seed', 'Mara chooses the reviewed deterministic seed',
      () => page.getByLabel('Match seed').fill('road-2'),
      [{ spec: 'The seed is entered through the real setup control', check: async () => await expect(page.getByLabel('Match seed')).toHaveValue('road-2') }]);
    await steps.gesture(page, 'start-match', 'Mara starts the match',
      () => page.getByRole('button', { name: 'Start seeded match' }).click(),
      [{ spec: 'Every human sees nine fully playable spaces', check: async () => {
        for (const seat of seats) {
          await expect(seat.page.getByRole('heading', { name: 'The living board' })).toBeVisible();
          await expect(seat.page.getByText('Playable spaces').locator('..').getByText('15 / 22')).toBeVisible();
        }
      } }, converged(10)]);

    const actorName = ((await page.locator('footer').textContent())?.match(/Current actor ([^·]+)/)?.[1] ?? '').trim();
    const actor = seats.find((seat) => seat.name === actorName)!;
    await steps.gesture(actor.page, 'choose-diplomatic-mission', `${actor.name} chooses Diplomatic Mission`,
      () => actor.page.getByTestId('private-hand').getByRole('button', { name: /^Diplomatic Mission/ }).click(),
      [
        { spec: 'Hidden Counsel is a real enabled Elven destination', check: async () => await expect(actor.page.getByTestId('space-hidden-counsel')).toBeEnabled() },
        { spec: 'The other reviewed faction destinations remain legal', check: async () => {
          await expect(actor.page.getByTestId('space-dwarven-caravans')).toBeEnabled();
          await expect(actor.page.getByTestId('space-tribute-shadow')).toBeEnabled();
        } }
      ]);
    await steps.gesture(actor.page, 'enter-hidden-counsel', `${actor.name} sends an Agent to Hidden Counsel`,
      () => actor.page.getByTestId('space-hidden-counsel').click(),
      [
        { spec: 'Every client shows the public Agent at Hidden Counsel', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('space-hidden-counsel')).toContainText(`Agent · ${actor.name}`);
        } },
        { spec: 'Every player area exposes only the public Fate count and Elven standing', check: async () => {
          for (const seat of seats) {
            const area = seat.page.locator('.players article').filter({ hasText: actor.name });
            await expect(area).toContainText('Elven1');
            await expect(area).toContainText('Fate1');
          }
        } },
        { spec: 'The Chronicle records the exact zero-transfer outcome without revealing a Fate identity', check: async () => {
          for (const seat of seats) {
            const log = seat.page.getByTestId('activity-log');
            await expect(log).toContainText('gaining 1 Elven standing, drawing 1 Fate, and receiving 0 Fate from opponents holding four or more');
            await expect(log).not.toContainText('fate:');
          }
        } },
        converged(11)
      ]);
    await steps.gesture(actor.page, 'reload-hidden-counsel', `${actor.name} reloads the private Fate state`,
      async () => { await actor.page.reload(); },
      [
        { spec: 'The board, count, and standing replay without exposing the card', check: async () => {
          await expect(actor.page.getByTestId('space-hidden-counsel')).toContainText(`Agent · ${actor.name}`);
          const area = actor.page.locator('.players article').filter({ hasText: actor.name });
          await expect(area).toContainText('Elven1');
          await expect(area).toContainText('Fate1');
          await expect(actor.page.locator('body')).not.toContainText('fate:');
        } },
        converged(11)
      ]);
    steps.generateDocs(
      'Hidden Counsel draws private Fate on the shared Elven track',
      'Three isolated human clients prove the first complete Elven-space tracer: real faction-icon placement, synchronized standing and Fate counts, hidden card identity, exact Chronicle wording, immutable replay, and reload.'
    );
  } finally {
    await Promise.all(seats.slice(1).map((seat) => seat.context?.close()));
  }
});
