import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

type Seat = { name: string; page: Page; context?: BrowserContext };

test('a Scout infiltrates a space blocked by another human', async ({ browser, page }, testInfo) => {
  test.setTimeout(120_000);
  const steps = new TestStepHelper(testInfo);
  const viewport = page.viewportSize() ?? { width: 1280, height: 960 };
  const guestAContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:5189', viewport, reducedMotion: 'reduce', serviceWorkers: 'block'
  });
  const guestBContext = await browser.newContext({
    baseURL: 'http://127.0.0.1:5189', viewport, reducedMotion: 'reduce', serviceWorkers: 'block'
  });
  const seats: Seat[] = [
    { name: 'Mara', page },
    { name: 'Rin', page: await guestAContext.newPage(), context: guestAContext },
    { name: 'Pip', page: await guestBContext.newPage(), context: guestBContext }
  ];
  const convergedEvents = (count: number): Verification => ({
    spec: `All three immutable replays accept exactly ${count} events with no diagnostics`,
    check: async () => {
      for (const seat of seats) {
        await expect(seat.page.getByTestId('replay-health')).toHaveText(` · ${count} accepted events · 0 replay diagnostics`, { timeout: 30_000 });
      }
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
      [{ spec: 'The host name is entered through the real lobby control', check: async () => await expect(page.getByLabel('Display name')).toHaveValue('Mara') }]
    );
    const requestedRoomCode = testInfo.project.name === 'phone' ? 'SCOUT' : 'INFIL';
    await steps.gesture(page, 'host-room-code', 'Mara chooses an infiltration room code',
      () => page.getByLabel(/Room code/).fill(requestedRoomCode),
      [{ spec: 'The exact five-character invitation is visible', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(requestedRoomCode) }]
    );
    await steps.gesture(page, 'create-room', 'Mara creates the shared room',
      () => page.getByRole('button', { name: 'Create game' }).click(),
      [{ spec: 'The live room opens with one public seat', check: async () => {
        await expect(page.getByTestId('room-code')).toHaveText(requestedRoomCode, { timeout: 30_000 });
        await expect(page.locator('.player-list article')).toHaveCount(1);
      } }]
    );

    for (const [index, seat] of seats.slice(1).entries()) {
      await steps.gesture(seat.page, `guest-${index + 1}-name`, `${seat.name} enters a table name`,
        () => seat.page.getByLabel('Display name').fill(seat.name),
        [{ spec: `${seat.name}'s name is visible`, check: async () => await expect(seat.page.getByLabel('Display name')).toHaveValue(seat.name) }]
      );
      await steps.gesture(seat.page, `guest-${index + 1}-code`, `${seat.name} enters the invitation`,
        () => seat.page.getByLabel(/Room code/).fill(requestedRoomCode),
        [{ spec: 'The shared invitation is entered exactly', check: async () => await expect(seat.page.getByLabel(/Room code/)).toHaveValue(requestedRoomCode) }]
      );
      await steps.gesture(seat.page, `guest-${index + 1}-join`, `${seat.name} joins from an isolated browser`,
        () => seat.page.getByRole('button', { name: 'Join game' }).click(),
        [{ spec: `Every connected browser sees ${index + 2} public seats`, check: async () => {
          for (const observer of seats.slice(0, index + 2)) await expect(observer.page.locator('.player-list article')).toHaveCount(index + 2);
        } }]
      );
    }

    const commanders = ['Aragorn', 'Galadriel', 'Gandalf'];
    for (const [index, seat] of seats.entries()) {
      await steps.gesture(seat.page, `seat-${index + 1}-commander`, `${seat.name} claims ${commanders[index]}`,
        () => seat.page.getByRole('button', { name: new RegExp(`^${commanders[index]}`) }).click(),
        [{ spec: 'The unique power-free Commander is visibly selected', check: async () => await expect(seat.page.getByRole('button', { name: new RegExp(`^${commanders[index]}`) })).toHaveAttribute('aria-pressed', 'true') }]
      );
      await steps.gesture(seat.page, `seat-${index + 1}-ready`, `${seat.name} readies their seat`,
        () => seat.page.getByRole('button', { name: 'I am ready' }).click(),
        [{ spec: 'Every observer sees the seat as Ready', check: async () => {
          for (const observer of seats) await expect(observer.page.locator('.player-list article').filter({ hasText: seat.name }).getByText('Ready', { exact: true })).toBeVisible();
        } }]
      );
    }

    await steps.gesture(page, 'choose-infiltration-seed', 'Mara chooses the published infiltration seed',
      () => page.getByLabel('Match seed').fill('infiltration-20'),
      [{ spec: 'The deterministic seed is entered through the host setup', check: async () => await expect(page.getByLabel('Match seed')).toHaveValue('infiltration-20') }]
    );
    await steps.gesture(page, 'start-match', 'Mara starts the deterministic match',
      () => page.getByRole('button', { name: 'Start seeded match' }).click(),
      [
        { spec: 'All three humans reach the canonical production board', check: async () => {
          for (const seat of seats) await expect(seat.page.getByRole('heading', { name: 'The living board' })).toBeVisible();
        } },
        { spec: 'Pip is the published first actor with a private Reconnaissance card', check: async () => {
          for (const seat of seats) await expect(seat.page.locator('footer')).toContainText('Current actor Pip');
          await expect(seats[2].page.getByTestId('private-hand').getByRole('button', { name: /^Reconnaissance/ })).toBeVisible();
        } },
        convergedEvents(10)
      ]
    );

    const scoutActor = seats[2];
    await steps.gesture(scoutActor.page, 'choose-reconnaissance', 'Pip chooses Reconnaissance',
      () => scoutActor.page.getByTestId('private-hand').getByRole('button', { name: /^Reconnaissance/ }).click(),
      [{ spec: 'Take Up a War Effort is legal through the Roads icon', check: async () => await expect(scoutActor.page.getByTestId('space-take-war-effort')).toBeEnabled() }]
    );
    await steps.gesture(scoutActor.page, 'place-recon-agent', 'Pip sends the Reconnaissance Agent to the road',
      () => scoutActor.page.getByTestId('space-take-war-effort').click(),
      [
        { spec: 'The Roads reward resolves and the blocking Scout-placement choice opens', check: async () => {
          await expect(scoutActor.page.locator('.players article').filter({ hasText: 'Pip' })).toContainText('Gold2');
          await expect(scoutActor.page.getByTestId('scout-network')).toContainText('Choose an empty post for the Scout.');
        } },
        convergedEvents(11)
      ]
    );
    await steps.gesture(scoutActor.page, 'place-redhorn-scout', 'Pip places a Scout at Redhorn Pass',
      () => scoutActor.page.getByTestId('post-redhorn-pass').click(),
      [
        { spec: 'Every human sees Pip at Redhorn Pass and two Scouts in supply', check: async () => {
          for (const seat of seats) {
            await expect(seat.page.getByTestId('post-redhorn-pass')).toContainText('Scout · Pip');
            await expect(seat.page.locator('.players article').filter({ hasText: 'Pip' })).toContainText('Scouts2 supply');
          }
        } },
        convergedEvents(12)
      ]
    );

    const blocker = seats[0];
    await steps.gesture(blocker.page, 'choose-blocking-mission', 'Mara chooses Diplomatic Mission',
      () => blocker.page.getByTestId('private-hand').getByRole('button', { name: /^Diplomatic Mission/ }).click(),
      [{ spec: 'Dwarven Caravans is a normal legal faction destination', check: async () => await expect(blocker.page.getByTestId('space-dwarven-caravans')).toBeEnabled() }]
    );
    await steps.gesture(blocker.page, 'block-dwarven-caravans', 'Mara blocks Dwarven Caravans',
      () => blocker.page.getByTestId('space-dwarven-caravans').click(),
      [
        { spec: 'Every human sees Mara occupying the connected destination', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('space-dwarven-caravans')).toContainText('Agent · Mara');
        } },
        convergedEvents(13)
      ]
    );

    const third = seats[1];
    await steps.gesture(third.page, 'third-reveals', 'Rin Reveals rather than taking an Agent turn',
      () => third.page.getByRole('button', { name: 'Reveal remaining hand' }).click(),
      [
        { spec: 'Rin’s actual hand becomes a public Muster row', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('reveal-panel')).toContainText('Rin Reveals');
        } },
        convergedEvents(14)
      ]
    );
    await steps.gesture(third.page, 'third-finishes', 'Rin finishes the Reveal turn',
      () => third.page.getByRole('button', { name: 'Finish Reveal' }).click(),
      [
        { spec: 'The turn returns to Pip with the blocker still present', check: async () => {
          for (const seat of seats) {
            await expect(seat.page.locator('footer')).toContainText('Current actor Pip');
            await expect(seat.page.getByTestId('space-dwarven-caravans')).toContainText('Agent · Mara');
          }
        } },
        convergedEvents(15)
      ]
    );

    await steps.gesture(scoutActor.page, 'choose-infiltrating-mission', 'Pip chooses a matching Diplomatic Mission',
      () => scoutActor.page.getByTestId('private-hand').getByRole('button', { name: /^Diplomatic Mission/ }).click(),
      [
        { spec: 'The occupied Dwarven space becomes legal only because Redhorn Pass is connected', check: async () => {
          await expect(scoutActor.page.getByTestId('space-dwarven-caravans')).toBeEnabled();
          await expect(scoutActor.page.getByTestId('space-dwarven-caravans')).toContainText('Agent · Mara');
        } }
      ]
    );
    await steps.gesture(scoutActor.page, 'choose-occupied-destination', 'Pip chooses the occupied Dwarven destination',
      () => scoutActor.page.getByTestId('space-dwarven-caravans').click(),
      [
        { spec: 'The UI asks which connected Scout to recall before committing', check: async () => await expect(scoutActor.page.getByTestId('infiltration-choice')).toContainText('Recall a connected Scout to enter Dwarven Caravans?') },
        { spec: 'No immutable event or reward occurs before the recall is confirmed', check: async () => {
          await expect(scoutActor.page.locator('.players article').filter({ hasText: 'Pip' })).toContainText('Dwarven0');
          await expect(scoutActor.page.getByTestId('replay-health')).toHaveText(' · 15 accepted events · 0 replay diagnostics');
          for (const observer of seats.slice(0, 2)) await expect(observer.page.getByTestId('infiltration-choice')).toHaveCount(0);
        } }
      ]
    );
    await steps.gesture(scoutActor.page, 'recall-to-infiltrate', 'Pip recalls Redhorn Pass to infiltrate',
      () => scoutActor.page.getByRole('button', { name: 'Recall Redhorn Pass Scout' }).click(),
      [
        { spec: 'Both named Agents share Dwarven Caravans on every board', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('space-dwarven-caravans')).toContainText('Agent · Mara · Pip');
        } },
        { spec: 'Redhorn Pass empties and Pip’s Scout returns to supply', check: async () => {
          for (const seat of seats) {
            await expect(seat.page.getByTestId('post-redhorn-pass')).not.toContainText('Scout ·');
            await expect(seat.page.locator('.players article').filter({ hasText: 'Pip' })).toContainText('Scouts3 supply');
          }
        } },
        { spec: 'Pip receives the full Dwarven space effect after the infiltration cost', check: async () => {
          for (const seat of seats) {
            const player = seat.page.locator('.players article').filter({ hasText: 'Pip' });
            await expect(player).toContainText('Dwarven1');
            await expect(player).toContainText('Provision2');
          }
        } },
        { spec: 'The Chronicle records Scout recall before the Agent resolution', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('activity-log')).toContainText('Pip recalls their Scout from Redhorn Pass to infiltrate Dwarven Caravans');
        } },
        convergedEvents(16)
      ]
    );
    await steps.gesture(scoutActor.page, 'reload-infiltration', 'Pip reloads the infiltrated board',
      async () => { await scoutActor.page.reload(); },
      [
        { spec: 'Both Agents, recalled Scout, and rewards replay identically', check: async () => {
          await expect(scoutActor.page.getByTestId('space-dwarven-caravans')).toContainText('Agent · Mara · Pip');
          await expect(scoutActor.page.getByTestId('post-redhorn-pass')).not.toContainText('Scout ·');
          const player = scoutActor.page.locator('.players article').filter({ hasText: 'Pip' });
          await expect(player).toContainText('Scouts3 supply');
          await expect(player).toContainText('Dwarven1');
          await expect(player).toContainText('Provision2');
        } },
        convergedEvents(16)
      ]
    );

    steps.generateDocs(
      'Scout infiltration through an occupied destination',
      'Three isolated humans start from the real lobby. One places a Scout, another blocks a connected destination, and the Scout owner later recalls it to place a second Agent without replacing the blocker.'
    );
  } finally {
    await guestAContext.close();
    await guestBContext.close();
  }
});
