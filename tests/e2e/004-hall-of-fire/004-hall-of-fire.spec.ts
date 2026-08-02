import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

type Seat = { name: string; page: Page; context?: BrowserContext };

test('Hall of Fire grants private Fate and temporary Reveal Influence', async ({ browser, page }, testInfo) => {
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
  const convergedEvents = (count: number, connectedSeats = seats): Verification => ({
    spec: `All three immutable replays accept exactly ${count} events with no diagnostics`,
    check: async () => {
      for (const seat of connectedSeats) {
        await expect(seat.page.getByTestId('replay-health')).toHaveText(` · ${count} accepted events · 0 replay diagnostics`, { timeout: 30_000 });
      }
    }
  });
  const musterInfluence: Record<string, number> = {
    'Rallying Words': 2,
    'Armed Escort': 0,
    'The Open Road': 1,
    'Diplomatic Mission': 1,
    Reconnaissance: 1,
    'Seek Allies': 1,
    'Token of Command': 1,
    'Muster the Host': 1
  };
  const handInfluence = async (seat: Seat) => (await seat.page.getByTestId('private-hand').locator('strong').allTextContents())
    .reduce((total, name) => total + (musterInfluence[name] ?? 0), 0);

  try {
    for (const seat of seats) {
      await seat.page.emulateMedia({ reducedMotion: 'reduce' });
      await seat.page.goto('/');
      await expect(seat.page.getByTestId('firebase-status')).toHaveText('Live Firebase ready', { timeout: 30_000 });
    }

    await steps.gesture(page, 'host-name', 'Mara enters a table name',
      () => page.getByLabel('Display name').fill('Mara'),
      [{ spec: 'The host name is entered through the real lobby field', check: async () => await expect(page.getByLabel('Display name')).toHaveValue('Mara') }]
    );
    const roomCode = testInfo.project.name === 'phone' ? 'FIRES' : 'HALLS';
    await steps.gesture(page, 'host-room-code', 'Mara chooses a Hall of Fire invitation',
      () => page.getByLabel(/Room code/).fill(roomCode),
      [{ spec: 'The five-character invitation is visible', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(roomCode) }]
    );
    await steps.gesture(page, 'create-room', 'Mara creates the shared room',
      () => page.getByRole('button', { name: 'Create game' }).click(),
      [
        { spec: 'The live room opens with the requested invitation', check: async () => await expect(page.getByTestId('room-code')).toHaveText(roomCode, { timeout: 30_000 }) },
        convergedEvents(1, seats.slice(0, 1))
      ]
    );

    for (const [index, seat] of seats.slice(1).entries()) {
      await steps.gesture(seat.page, `guest-${index + 1}-name`, `${seat.name} enters a table name`,
        () => seat.page.getByLabel('Display name').fill(seat.name),
        [{ spec: `${seat.name}'s entered name is visible`, check: async () => await expect(seat.page.getByLabel('Display name')).toHaveValue(seat.name) }]
      );
      await steps.gesture(seat.page, `guest-${index + 1}-code`, `${seat.name} enters the invitation`,
        () => seat.page.getByLabel(/Room code/).fill(roomCode),
        [{ spec: 'The exact shared invitation is entered', check: async () => await expect(seat.page.getByLabel(/Room code/)).toHaveValue(roomCode) }]
      );
      await steps.gesture(seat.page, `guest-${index + 1}-join`, `${seat.name} joins from an isolated browser`,
        () => seat.page.getByRole('button', { name: 'Join game' }).click(),
        [
          { spec: `Every connected browser sees ${index + 2} public seats`, check: async () => {
            for (const observer of seats.slice(0, index + 2)) await expect(observer.page.locator('.player-list article')).toHaveCount(index + 2);
          } },
          convergedEvents(index + 2, seats.slice(0, index + 2))
        ]
      );
    }

    const commanders = ['Aragorn', 'Galadriel', 'Gandalf'];
    for (const [index, seat] of seats.entries()) {
      await steps.gesture(seat.page, `seat-${index + 1}-commander`, `${seat.name} claims ${commanders[index]}`,
        () => seat.page.getByRole('button', { name: new RegExp(`^${commanders[index]}`) }).click(),
        [
          { spec: 'The unique power-free Commander is visibly selected', check: async () => await expect(seat.page.getByRole('button', { name: new RegExp(`^${commanders[index]}`) })).toHaveAttribute('aria-pressed', 'true') },
          convergedEvents(4 + index * 2)
        ]
      );
      await steps.gesture(seat.page, `seat-${index + 1}-ready`, `${seat.name} readies their seat`,
        () => seat.page.getByRole('button', { name: 'I am ready' }).click(),
        [
          { spec: 'Every observer sees the seat as Ready', check: async () => {
            for (const observer of seats) await expect(observer.page.locator('.player-list article').filter({ hasText: seat.name }).getByText('Ready', { exact: true })).toBeVisible();
          } },
          convergedEvents(5 + index * 2)
        ]
      );
    }

    await steps.gesture(page, 'choose-hall-seed', 'Mara chooses the published Hall of Fire seed',
      () => page.getByLabel('Match seed').fill('road-2'),
      [{ spec: 'The deterministic seed is entered through the host control', check: async () => await expect(page.getByLabel('Match seed')).toHaveValue('road-2') }]
    );
    await steps.gesture(page, 'start-match', 'Mara starts the deterministic match',
      () => page.getByRole('button', { name: 'Start seeded match' }).click(),
      [
        { spec: 'All three humans reach the canonical production board', check: async () => {
          for (const seat of seats) {
            await expect(seat.page.getByRole('heading', { name: 'The living board' })).toBeVisible();
            await expect(seat.page.getByText('Playable spaces').locator('..').getByText('8 / 22')).toBeVisible();
          }
        } },
        convergedEvents(10)
      ]
    );

    const firstName = ((await page.locator('footer').textContent())?.match(/Current actor ([^·]+)/)?.[1] ?? '').trim();
    const fireActor = seats.find((seat) => seat.name === firstName)!;
    await steps.gesture(fireActor.page, 'choose-open-road', `${fireActor.name} chooses The Open Road`,
      () => fireActor.page.getByTestId('private-hand').getByRole('button', { name: /^The Open Road/ }).first().click(),
      [{ spec: 'The real Roads card enables Take Up a War Effort', check: async () => await expect(fireActor.page.getByTestId('space-take-war-effort')).toBeEnabled() }]
    );
    await steps.gesture(fireActor.page, 'draw-council-escort', `${fireActor.name} travels the road to draw a Council card`,
      () => fireActor.page.getByTestId('space-take-war-effort').click(),
      [
        { spec: 'The board draw adds Armed Escort to the private hand', check: async () => await expect(fireActor.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ })).toBeVisible() },
        { spec: 'All observers see the public Roads Agent and two Gold', check: async () => {
          for (const seat of seats) {
            await expect(seat.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${fireActor.name}`);
            await expect(seat.page.locator('.players article').filter({ hasText: fireActor.name })).toContainText('Gold2');
          }
        } },
        convergedEvents(11)
      ]
    );

    const revealAndFinish = async (seat: Seat, prefix: string, revealEvent: number, finishEvent: number) => {
      await steps.gesture(seat.page, `${prefix}-reveal`, `${seat.name} Reveals rather than placing an Agent`,
        () => seat.page.getByRole('button', { name: 'Reveal remaining hand' }).click(),
        [
          { spec: `${seat.name}'s actual hand becomes the public Muster row`, check: async () => {
            for (const observer of seats) await expect(observer.page.getByTestId('reveal-panel')).toContainText(`${seat.name} Reveals`);
          } },
          convergedEvents(revealEvent)
        ]
      );
      await steps.gesture(seat.page, `${prefix}-finish`, `${seat.name} finishes the Reveal`,
        () => seat.page.getByRole('button', { name: 'Finish Reveal' }).click(),
        [
          { spec: 'The public Muster row closes before play advances', check: async () => {
            for (const observer of seats) await expect(observer.page.getByTestId('reveal-panel')).toHaveCount(0);
          } },
          convergedEvents(finishEvent)
        ]
      );
    };

    const firstOtherName = ((await page.locator('footer').textContent())?.match(/Current actor ([^·]+)/)?.[1] ?? '').trim();
    const firstOther = seats.find((seat) => seat.name === firstOtherName)!;
    await revealAndFinish(firstOther, 'first-other', 12, 13);
    const secondOtherName = ((await page.locator('footer').textContent())?.match(/Current actor ([^·]+)/)?.[1] ?? '').trim();
    const secondOther = seats.find((seat) => seat.name === secondOtherName)!;
    await revealAndFinish(secondOther, 'second-other', 14, 15);
    await steps.gesture(fireActor.page, 'choose-armed-escort', `${fireActor.name} chooses Armed Escort for Hall of Fire`,
      () => fireActor.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click(),
      [
        { spec: 'Hall of Fire is a genuine legal Council destination', check: async () => await expect(fireActor.page.getByTestId('space-hall-fire')).toBeEnabled() },
        { spec: 'Both reviewed Council destinations are presented without enabling the paid seat', check: async () => {
          await expect(fireActor.page.getByTestId('space-muster-free-peoples')).toBeEnabled();
          await expect(fireActor.page.getByTestId('space-white-council-seat')).toBeDisabled();
        } }
      ]
    );
    await steps.gesture(fireActor.page, 'enter-hall-of-fire', `${fireActor.name} sends an Agent to Hall of Fire`,
      () => fireActor.page.getByTestId('space-hall-fire').click(),
      [
        { spec: 'Every board shows the named Hall of Fire Agent', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('space-hall-fire')).toContainText(`Agent · ${fireActor.name}`);
        } },
        { spec: 'One private Fate and Armed Escort recruitment resolve exactly once', check: async () => {
          for (const seat of seats) {
            const player = seat.page.locator('.players article').filter({ hasText: fireActor.name });
            await expect(player).toContainText('Fate1');
            await expect(player).toContainText('Garrison4');
          }
        } },
        { spec: 'The Chronicle states the conditional Reveal reward without exposing Fate identity', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('activity-log')).toContainText("drawing 1 Fate and gaining 1 Influence during this round's Reveal while the Agent remains");
        } },
        convergedEvents(16)
      ]
    );
    await steps.gesture(fireActor.page, 'reload-hall-of-fire', `${fireActor.name} reloads the occupied Hall`,
      async () => { await fireActor.page.reload(); },
      [
        { spec: 'Hall occupation, Fate count, and recruitment replay exactly', check: async () => {
          await expect(fireActor.page.getByTestId('space-hall-fire')).toContainText(`Agent · ${fireActor.name}`);
          const player = fireActor.page.locator('.players article').filter({ hasText: fireActor.name });
          await expect(player).toContainText('Fate1');
          await expect(player).toContainText('Garrison4');
        } },
        convergedEvents(16)
      ]
    );

    const firstRoundBase = await handInfluence(fireActor);
    await steps.gesture(fireActor.page, 'reveal-with-hall-fire', `${fireActor.name} Reveals while the Hall Agent remains`,
      () => fireActor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(),
      [
        { spec: 'The public total is exactly the card total plus one Hall Influence', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('reveal-panel')).toContainText(`${firstRoundBase + 1} Influence`);
        } },
        convergedEvents(17)
      ]
    );
    await steps.gesture(fireActor.page, 'finish-hall-reveal', `${fireActor.name} finishes the Hall-supported Reveal`,
      () => fireActor.page.getByRole('button', { name: 'Finish Reveal' }).click(),
      [
        { spec: 'Recall opens round two and returns the Hall Agent', check: async () => {
          for (const seat of seats) {
            await expect(seat.page.getByText('Round 2 · Agent turns')).toBeVisible();
            await expect(seat.page.getByTestId('space-hall-fire')).not.toContainText('Agent ·');
            await expect(seat.page.locator('.players article').filter({ hasText: fireActor.name })).toContainText('Fate1');
          }
        } },
        convergedEvents(18)
      ]
    );

    await revealAndFinish(firstOther, 'round-two-first-other', 19, 20);
    await revealAndFinish(secondOther, 'round-two-second-other', 21, 22);
    const secondRoundBase = await handInfluence(fireActor);
    await steps.gesture(fireActor.page, 'reveal-without-hall-fire', `${fireActor.name} Reveals after the Hall Agent returned`,
      () => fireActor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(),
      [
        { spec: 'The expired Hall bonus is absent from the exact card-only total', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('reveal-panel')).toContainText(`${secondRoundBase} Influence`);
        } },
        { spec: 'The private Fate instance remains conserved across Recall', check: async () => {
          for (const seat of seats) await expect(seat.page.locator('.players article').filter({ hasText: fireActor.name })).toContainText('Fate1');
        } },
        convergedEvents(23)
      ]
    );
    await steps.gesture(fireActor.page, 'finish-plain-reveal', `${fireActor.name} finishes the Reveal without Hall support`,
      () => fireActor.page.getByRole('button', { name: 'Finish Reveal' }).click(),
      [
        { spec: 'All three humans enter round three with the Fate instance intact', check: async () => {
          for (const seat of seats) {
            await expect(seat.page.getByText('Round 3 · Agent turns')).toBeVisible();
            await expect(seat.page.locator('.players article').filter({ hasText: fireActor.name })).toContainText('Fate1');
          }
        } },
        convergedEvents(24)
      ]
    );
    await steps.gesture(fireActor.page, 'reload-expired-hall-bonus', `${fireActor.name} reloads after the Hall bonus expires`,
      async () => { await fireActor.page.reload(); },
      [
        { spec: 'The empty Hall, persistent Fate, and round-three replay remain exact', check: async () => {
          await expect(fireActor.page.getByText('Round 3 · Agent turns')).toBeVisible();
          await expect(fireActor.page.getByTestId('space-hall-fire')).not.toContainText('Agent ·');
          await expect(fireActor.page.locator('.players article').filter({ hasText: fireActor.name })).toContainText('Fate1');
        } },
        convergedEvents(24)
      ]
    );

    steps.generateDocs(
      'Hall of Fire Fate and temporary Reveal tracer',
      'Three isolated humans start a real Firebase match. One draws a private Fate at Hall of Fire, Reveals for exactly one extra Influence while the Agent remains, then proves after Recall and reload that Fate persists while the temporary bonus does not.'
    );
  } finally {
    await guestAContext.close();
    await guestBContext.close();
  }
});
