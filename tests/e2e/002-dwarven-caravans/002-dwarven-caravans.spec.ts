import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

type Seat = { name: string; page: Page; context?: BrowserContext };

test('three humans create a room and complete Dwarven Caravans', async ({ browser, page }, testInfo) => {
  test.setTimeout(180_000);
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

  const convergedLobby = (count: number): Verification => ({
    spec: `All connected seats converge on ${count} public player${count === 1 ? '' : 's'}`,
    check: async () => {
      for (const seat of seats.slice(0, count)) {
        await expect(seat.page.locator('.player-list article')).toHaveCount(count);
      }
    }
  });
  const convergedEvents = (count: number, connectedSeats = seats): Verification => ({
    spec: `Every connected replay has accepted exactly ${count} events with no diagnostics`,
    check: async () => {
      for (const seat of connectedSeats) {
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
      [{ spec: 'The entered name is visible and the create action remains available', check: async () => {
        await expect(page.getByLabel('Display name')).toHaveValue('Mara');
        await expect(page.getByRole('button', { name: 'Create game' })).toBeEnabled();
      } }]
    );
    const requestedRoomCode = testInfo.project.name === 'phone' ? 'DWARF' : 'ELVEN';
    await steps.gesture(page, 'host-room-code', 'Mara chooses a private invitation code',
      () => page.getByLabel(/Room code/).fill(requestedRoomCode),
      [{ spec: 'The five-character code is entered through the real lobby control', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(requestedRoomCode) }]
    );
    await steps.gesture(page, 'create-room', 'Mara creates the shared room',
      () => page.getByRole('button', { name: 'Create game' }).click(),
      [
        { spec: 'The requested invitation code is displayed', check: async () => await expect(page.getByTestId('room-code')).toHaveText(requestedRoomCode, { timeout: 30_000 }) },
        convergedLobby(1),
        convergedEvents(1, seats.slice(0, 1))
      ]
    );
    const roomCode = (await page.getByTestId('room-code').textContent())!;

    for (const [index, seat] of seats.slice(1).entries()) {
      await steps.gesture(seat.page, `guest-${index + 1}-name`, `${seat.name} enters a table name`,
        () => seat.page.getByLabel('Display name').fill(seat.name),
        [{ spec: `${seat.name}'s name is visible`, check: async () => await expect(seat.page.getByLabel('Display name')).toHaveValue(seat.name) }]
      );
      await steps.gesture(seat.page, `guest-${index + 1}-code`, `${seat.name} enters the room code`,
        () => seat.page.getByLabel(/Room code/).fill(roomCode),
        [{ spec: 'The exact host invitation code is entered', check: async () => await expect(seat.page.getByLabel(/Room code/)).toHaveValue(roomCode) }]
      );
      await steps.gesture(seat.page, `guest-${index + 1}-join`, `${seat.name} joins from an independent browser`,
        () => seat.page.getByRole('button', { name: 'Join game' }).click(),
        [
          { spec: `${seat.name} receives a real seat in the room`, check: async () => await expect(seat.page.getByText(seat.name, { exact: true })).toBeVisible() },
          convergedLobby(index + 2),
          convergedEvents(index + 2, seats.slice(0, index + 2))
        ]
      );
    }

    const commanderChoices = ['Aragorn', 'Galadriel', 'Gandalf'];
    for (const [index, seat] of seats.entries()) {
      const commander = commanderChoices[index];
      await steps.gesture(seat.page, `seat-${index + 1}-commander`, `${seat.name} claims ${commander}`,
        () => seat.page.getByRole('button', { name: new RegExp(`^${commander}`) }).click(),
        [
          { spec: `${commander} is selected for ${seat.name}`, check: async () => await expect(seat.page.getByRole('button', { name: new RegExp(`^${commander}`) })).toHaveAttribute('aria-pressed', 'true') },
          { spec: 'Commander powers are visibly identified as inactive', check: async () => await expect(seat.page.getByText('Commander powers are explicitly inactive')).toBeVisible() },
          convergedEvents(4 + index * 2)
        ]
      );
      await steps.gesture(seat.page, `seat-${index + 1}-ready`, `${seat.name} readies their seat`,
        () => seat.page.getByRole('button', { name: 'I am ready' }).click(),
        [
          { spec: `${seat.name}'s public row reports Ready`, check: async () => {
            const row = seat.page.locator('.player-list article').filter({ hasText: seat.name });
            await expect(row.getByText('Ready', { exact: true })).toBeVisible();
          } },
          { spec: 'Every browser converges on the same ready state', check: async () => {
            for (const observer of seats) {
              const row = observer.page.locator('.player-list article').filter({ hasText: seat.name });
              await expect(row.getByText('Ready', { exact: true })).toBeVisible();
            }
          } },
          convergedEvents(5 + index * 2)
        ]
      );
    }

    await steps.gesture(page, 'start-seeded-match', 'The host starts the deterministic match',
      () => page.getByRole('button', { name: 'Start seeded match' }).click(),
      [
        { spec: 'All three browsers transition to the production board', check: async () => {
          for (const seat of seats) await expect(seat.page.getByRole('heading', { name: 'The living board' })).toBeVisible();
        } },
        { spec: 'All 22 final board destinations are structurally present', check: async () => await expect(page.locator('.spaces button')).toHaveCount(22) },
        { spec: 'Exactly three complete destinations are advertised as playable', check: async () => {
          await expect(page.getByText('Playable spaces').locator('..').getByText('3 / 22')).toBeVisible();
          await expect(page.getByTestId('space-dwarven-caravans')).toContainText('+1 standing');
          await expect(page.getByTestId('space-tribute-shadow')).toContainText('+1 standing');
        } },
        { spec: 'Each seat exposes exactly its own five-card hand', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('private-hand').getByRole('button')).toHaveCount(5);
        } },
        convergedEvents(10)
      ]
    );

    const roadName = ((await page.locator('footer').textContent())?.match(/Current actor ([^·]+)/)?.[1] ?? '').trim();
    const roadActor = seats.find((seat) => seat.name === roadName);
    expect(roadActor).toBeDefined();
    await steps.gesture(roadActor!.page, 'play-open-road', `${roadActor!.name} chooses The Open Road`,
      () => roadActor!.page.getByTestId('private-hand').getByRole('button', { name: /^The Open Road/ }).first().click(),
      [
        { spec: 'The Open Road is selected through the private hand', check: async () => await expect(roadActor!.page.getByRole('button', { name: /^The Open Road/ }).first()).toHaveAttribute('aria-pressed', 'true') },
        { spec: 'Take Up a War Effort is the sole legal Roads destination', check: async () => {
          await expect(roadActor!.page.getByTestId('space-take-war-effort')).toBeEnabled();
          await expect(roadActor!.page.locator('.spaces button:enabled')).toHaveCount(1);
        } }
      ]
    );
    await steps.gesture(roadActor!.page, 'take-war-effort', `${roadActor!.name} takes up the road in the base game`,
      () => roadActor!.page.getByTestId('space-take-war-effort').click(),
      [
        { spec: 'Every client sees the named Agent occupying the Roads space', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${roadActor!.name}`);
        } },
        { spec: 'The public reward is exactly two Gold while War Efforts are disabled', check: async () => {
          const player = roadActor!.page.locator('.players article').filter({ hasText: roadActor!.name });
          await expect(player).toContainText('Gold2');
        } },
        { spec: 'The actor privately draws Armed Escort and still has five cards', check: async () => {
          await expect(roadActor!.page.getByTestId('private-hand').getByRole('button')).toHaveCount(5);
          await expect(roadActor!.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ })).toBeVisible();
        } },
        convergedEvents(11)
      ]
    );

    const currentName = ((await page.locator('footer').textContent())?.match(/Current actor ([^·]+)/)?.[1] ?? '').trim();
    const actor = seats.find((seat) => seat.name === currentName);
    expect(actor, `current player ${currentName} must be one of the human seats`).toBeDefined();
    await steps.gesture(actor!.page, 'play-diplomatic-mission', `${actor!.name} chooses Diplomatic Mission`,
      () => actor!.page.getByTestId('private-hand').getByRole('button', { name: /^Diplomatic Mission/ }).click(),
      [
        { spec: 'Diplomatic Mission is visibly selected', check: async () => await expect(actor!.page.getByRole('button', { name: /^Diplomatic Mission/ })).toHaveAttribute('aria-pressed', 'true') },
        { spec: 'Both matching, unoccupied faction destinations become legal', check: async () => {
          await expect(actor!.page.getByTestId('space-dwarven-caravans')).toBeEnabled();
          await expect(actor!.page.getByTestId('space-tribute-shadow')).toBeEnabled();
          await expect(actor!.page.locator('.spaces button:enabled')).toHaveCount(2);
        } }
      ]
    );
    await steps.gesture(actor!.page, 'place-dwarven-agent', `${actor!.name} sends an Agent to Dwarven Caravans`,
      () => actor!.page.getByTestId('space-dwarven-caravans').click(),
      [
        { spec: 'Every player sees the same named Agent occupation', check: async () => {
          await expect(
            actor!.page.getByTestId('space-dwarven-caravans'),
            `${actor!.name}: ${await actor!.page.getByTestId('replay-health').textContent()} · ${await actor!.page.getByTestId('replay-health').getAttribute('title')}`
          ).toContainText(`Agent · ${actor!.name}`);
          for (const seat of seats) await expect(seat.page.getByTestId('space-dwarven-caravans'), `${seat.name}: ${await seat.page.getByTestId('replay-health').textContent()}`).toContainText(`Agent · ${actor!.name}`);
        } },
        { spec: 'The acting seat gains exactly one Provision and one Dwarven standing', check: async () => {
          const player = actor!.page.locator('.players article').filter({ hasText: actor!.name });
          await expect(player).toContainText('Provision2');
          await expect(player).toContainText('Dwarven1');
        } },
        { spec: 'The Chronicle narrates the resolved shared action', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('activity-log')).toContainText(`${actor!.name} sends an Agent to Dwarven Caravans`);
        } },
        { spec: 'The turn advances to another human', check: async () => {
          for (const seat of seats) await expect(seat.page.locator('footer')).not.toContainText(`Current actor ${actor!.name}`);
        } }
      ]
    );

    await steps.gesture(actor!.page, 'reload-replay', `${actor!.name} reloads and the immutable history replays`,
      async () => { await actor!.page.reload(); },
      [
        { spec: 'The anonymous seat reconnects directly to the board', check: async () => await expect(actor!.page.getByRole('heading', { name: 'The living board' })).toBeVisible() },
        { spec: 'The committed Agent and rewards survive reload', check: async () => {
          await expect(actor!.page.getByTestId('space-dwarven-caravans')).toContainText(`Agent · ${actor!.name}`);
          const player = actor!.page.locator('.players article').filter({ hasText: actor!.name });
          await expect(player).toContainText('Provision2');
          await expect(player).toContainText('Dwarven1');
        } }
      ]
    );

    const shadowName = ((await page.locator('footer').textContent())?.match(/Current actor ([^·]+)/)?.[1] ?? '').trim();
    const shadowActor = seats.find((seat) => seat.name === shadowName);
    expect(shadowActor).toBeDefined();
    await steps.gesture(shadowActor!.page, 'play-shadow-mission', `${shadowActor!.name} chooses Diplomatic Mission`,
      () => shadowActor!.page.getByTestId('private-hand').getByRole('button', { name: /^Diplomatic Mission/ }).click(),
      [
        { spec: 'Diplomatic Mission is selected through the private hand', check: async () => await expect(shadowActor!.page.getByRole('button', { name: /^Diplomatic Mission/ })).toHaveAttribute('aria-pressed', 'true') },
        { spec: 'The occupied Dwarven space is unavailable and Tribute is the sole legal destination', check: async () => {
          await expect(shadowActor!.page.getByTestId('space-dwarven-caravans')).toBeDisabled();
          await expect(shadowActor!.page.getByTestId('space-tribute-shadow')).toBeEnabled();
          await expect(shadowActor!.page.locator('.spaces button:enabled')).toHaveCount(1);
        } }
      ]
    );
    await steps.gesture(shadowActor!.page, 'tribute-shadow', `${shadowActor!.name} pays Tribute to the Shadow`,
      () => shadowActor!.page.getByTestId('space-tribute-shadow').click(),
      [
        { spec: 'Every client sees the named Agent occupying Tribute to the Shadow', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('space-tribute-shadow')).toContainText(`Agent · ${shadowActor!.name}`);
        } },
        { spec: 'The acting seat gains exactly two Gold and one Shadow standing', check: async () => {
          const player = shadowActor!.page.locator('.players article').filter({ hasText: shadowActor!.name });
          await expect(player).toContainText('Gold2');
          await expect(player).toContainText('Shadow1');
        } },
        { spec: 'All replays accept the twelfth event without diagnostics', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('replay-health')).toHaveText(' · 13 accepted events · 0 replay diagnostics');
        } },
        { spec: 'The next human receives the turn', check: async () => {
          for (const seat of seats) await expect(seat.page.locator('footer')).not.toContainText(`Current actor ${shadowActor!.name}`);
        } }
      ]
    );
    await steps.gesture(shadowActor!.page, 'reload-shadow', `${shadowActor!.name} reloads the completed Shadow tribute`,
      async () => { await shadowActor!.page.reload(); },
      [
        { spec: 'The Shadow occupation survives immutable replay', check: async () => await expect(shadowActor!.page.getByTestId('space-tribute-shadow')).toContainText(`Agent · ${shadowActor!.name}`) },
        { spec: 'Shadow rewards remain exact after reload', check: async () => {
          const player = shadowActor!.page.locator('.players article').filter({ hasText: shadowActor!.name });
          await expect(player).toContainText('Gold2');
          await expect(player).toContainText('Shadow1');
        } }
      ]
    );

    steps.generateDocs(
      'Three-player ordinary Agent destinations tracer',
      'Three isolated human browser sessions create and join a Firebase room, choose power-free Commander identities, start a seeded game on the final board, then resolve a Roads draw and base-game reward plus Dwarven and Shadow faction actions with convergence and replay.'
    );
  } finally {
    await guestAContext.close();
    await guestBContext.close();
  }
});
