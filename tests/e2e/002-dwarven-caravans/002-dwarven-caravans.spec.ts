import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

type Seat = { name: string; page: Page; context?: BrowserContext };

test('three humans create a room and complete Dwarven Caravans', async ({ browser, page }, testInfo) => {
  test.setTimeout(210_000);
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
        { spec: 'Exactly four complete destinations are advertised as playable', check: async () => {
          await expect(page.getByText('Playable spaces').locator('..').getByText('4 / 22')).toBeVisible();
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

    await steps.gesture(roadActor!.page, 'play-armed-escort', `${roadActor!.name} chooses the drawn Armed Escort`,
      () => roadActor!.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).click(),
      [
        { spec: 'The genuinely drawn Armed Escort is selected from the private hand', check: async () => await expect(roadActor!.page.getByRole('button', { name: /^Armed Escort/ })).toHaveAttribute('aria-pressed', 'true') },
        { spec: 'Muster the Free Peoples is the sole legal Council destination', check: async () => {
          await expect(roadActor!.page.getByTestId('space-muster-free-peoples')).toBeEnabled();
          await expect(roadActor!.page.locator('.spaces button:enabled')).toHaveCount(1);
        } }
      ]
    );
    await steps.gesture(roadActor!.page, 'muster-free-peoples', `${roadActor!.name} musters the Free Peoples`,
      () => roadActor!.page.getByTestId('space-muster-free-peoples').click(),
      [
        { spec: 'Every client sees the named Agent occupying the Council space', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('space-muster-free-peoples')).toContainText(`Agent · ${roadActor!.name}`);
        } },
        { spec: 'Armed Escort and the space recruit exactly three Companies before the choice', check: async () => {
          const player = roadActor!.page.locator('.players article').filter({ hasText: roadActor!.name });
          await expect(player).toContainText('Garrison6');
          await expect(player).toContainText('Supply6');
        } },
        { spec: 'All clients see the ordered payment choice but only the actor may resolve it', check: async () => {
          await expect(roadActor!.page.getByTestId('pending-choice').getByRole('button', { name: 'Pay 2 Gold' })).toBeEnabled();
          for (const observer of seats.filter((seat) => seat !== roadActor)) {
            await expect(observer.page.getByTestId('pending-choice').getByRole('button', { name: 'Pay 2 Gold' })).toBeDisabled();
          }
        } },
        { spec: 'The turn remains with the actor until the choice is resolved', check: async () => {
          for (const seat of seats) await expect(seat.page.locator('footer')).toContainText(`Current actor ${roadActor!.name}`);
        } },
        convergedEvents(14)
      ]
    );
    await steps.gesture(roadActor!.page, 'pay-muster-gold', `${roadActor!.name} pays the optional Muster cost`,
      () => roadActor!.page.getByTestId('pending-choice').getByRole('button', { name: 'Pay 2 Gold' }).click(),
      [
        { spec: 'The ordered choice closes for every client', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('pending-choice')).toHaveCount(0);
        } },
        { spec: 'Exactly two Gold become one Provision', check: async () => {
          const player = roadActor!.page.locator('.players article').filter({ hasText: roadActor!.name });
          await expect(player).toContainText('Gold0');
          await expect(player).toContainText('Provision2');
        } },
        { spec: 'The completed choice advances to another human', check: async () => {
          for (const seat of seats) await expect(seat.page.locator('footer')).not.toContainText(`Current actor ${roadActor!.name}`);
        } },
        convergedEvents(15)
      ]
    );
    await steps.gesture(roadActor!.page, 'reload-muster', `${roadActor!.name} reloads the completed Council action`,
      async () => { await roadActor!.page.reload(); },
      [
        { spec: 'The Council occupation and resolved payment survive replay', check: async () => {
          await expect(roadActor!.page.getByTestId('space-muster-free-peoples')).toContainText(`Agent · ${roadActor!.name}`);
          const player = roadActor!.page.locator('.players article').filter({ hasText: roadActor!.name });
          await expect(player).toContainText('Garrison6');
          await expect(player).toContainText('Gold0');
          await expect(player).toContainText('Provision2');
        } },
        convergedEvents(15)
      ]
    );

    await steps.gesture(actor!.page, 'reveal-first-hand', `${actor!.name} Reveals the remaining hand`,
      () => actor!.page.getByRole('button', { name: 'Reveal remaining hand' }).click(),
      [
        { spec: 'Every client sees the same four-card public Muster row', check: async () => {
          for (const seat of seats) {
            await expect(seat.page.getByTestId('reveal-panel')).toContainText(`${actor!.name} Reveals`);
            await expect(seat.page.getByTestId('reveal-panel').locator('.muster-row article')).toHaveCount(4);
          }
        } },
        { spec: 'Muster totals are exactly four Influence and one sword', check: async () => {
          await expect(actor!.page.getByTestId('reveal-panel')).toContainText('4 Influence remaining · 1 sword');
        } },
        { spec: 'The reviewed Muster the Host Reserve batch is affordable and unavailable content is absent', check: async () => {
          await expect(actor!.page.getByRole('button', { name: /^Muster the Host/ })).toBeEnabled();
          await expect(actor!.page.getByRole('button', { name: /^Deed Worthy of Song/ })).toHaveCount(0);
        } },
        convergedEvents(16)
      ]
    );
    await steps.gesture(actor!.page, 'acquire-muster-host', `${actor!.name} acquires Muster the Host`,
      () => actor!.page.getByRole('button', { name: /^Muster the Host/ }).click(),
      [
        { spec: 'The shared Reserve count falls from eight to seven', check: async () => {
          for (const seat of seats) await expect(seat.page.getByRole('button', { name: /^Muster the Host/ })).toContainText('7 remain');
        } },
        { spec: 'Exactly two Influence remains', check: async () => await expect(actor!.page.getByTestId('reveal-panel')).toContainText('2 Influence remaining') },
        { spec: 'The acquired private instance enters the actor discard pile', check: async () => {
          const player = actor!.page.locator('.players article').filter({ hasText: actor!.name });
          await expect(player).toContainText('Discard1');
        } },
        convergedEvents(17)
      ]
    );
    await steps.gesture(actor!.page, 'finish-first-reveal', `${actor!.name} finishes the Reveal turn`,
      () => actor!.page.getByRole('button', { name: 'Finish Reveal' }).click(),
      [
        { spec: 'The public Muster row closes after cards move to discard', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('reveal-panel')).toHaveCount(0);
        } },
        { spec: 'The public seat reports Reveal complete', check: async () => {
          for (const seat of seats) await expect(seat.page.locator('.players article').filter({ hasText: actor!.name })).toContainText('Reveal complete');
        } },
        { spec: 'The next unrevealed human gets the Agent-or-Reveal decision', check: async () => {
          for (const seat of seats) await expect(seat.page.locator('footer')).toContainText(`Current actor ${shadowActor!.name}`);
        } },
        convergedEvents(18)
      ]
    );

    const revealAndFinish = async (seat: Seat, prefix: string, revealCount: number, finishCount: number) => {
      await steps.gesture(seat.page, `${prefix}-reveal`, `${seat.name} Reveals without buying`,
        () => seat.page.getByRole('button', { name: 'Reveal remaining hand' }).click(),
        [
          { spec: `${seat.name}'s real remaining hand becomes the public Muster row`, check: async () => {
            for (const observer of seats) await expect(observer.page.getByTestId('reveal-panel')).toContainText(`${seat.name} Reveals`);
          } },
          convergedEvents(revealCount)
        ]
      );
      await steps.gesture(seat.page, `${prefix}-finish`, `${seat.name} finishes Reveal without an acquisition`,
        () => seat.page.getByRole('button', { name: 'Finish Reveal' }).click(),
        [
          { spec: `${seat.name}'s cards leave Muster and remain conserved`, check: async () => {
            for (const observer of seats) await expect(observer.page.getByTestId('reveal-panel')).toHaveCount(0);
          } },
          convergedEvents(finishCount)
        ]
      );
    };

    await revealAndFinish(shadowActor!, 'round-1-seat-3', 19, 20);
    await revealAndFinish(roadActor!, 'round-1-seat-1', 21, 22);
    await steps.observe(roadActor!.page, 'round-2-recall', 'Recall opens round 2', [
      { spec: 'All Agents return and every seat redraws five cards', check: async () => {
        for (const seat of seats) {
          await expect(seat.page.getByText('Round 2 · Agent turns')).toBeVisible();
          await expect(seat.page.locator('.spaces button.occupied')).toHaveCount(0);
          for (const player of seats) {
            const area = seat.page.locator('.players article').filter({ hasText: player.name });
            await expect(area).toContainText('Agents2');
            await expect(area).toContainText('Hand5');
          }
        }
      } },
      { spec: 'First player rotates to the next seat', check: async () => {
        for (const seat of seats) await expect(seat.page.locator('footer')).toContainText(`Current actor ${actor!.name}`);
      } }
    ]);

    await revealAndFinish(actor!, 'round-2-seat-2', 23, 24);
    await revealAndFinish(shadowActor!, 'round-2-seat-3', 25, 26);
    await revealAndFinish(roadActor!, 'round-2-seat-1', 27, 28);
    await steps.observe(roadActor!.page, 'round-3-reshuffle', 'The deterministic reshuffle opens round 3', [
      { spec: 'Round 3 begins from real Recall with five-card hands', check: async () => {
        for (const seat of seats) await expect(seat.page.getByText('Round 3 · Agent turns')).toBeVisible();
      } }
    ]);

    await revealAndFinish(shadowActor!, 'round-3-seat-3', 29, 30);
    await revealAndFinish(roadActor!, 'round-3-seat-1', 31, 32);
    await steps.gesture(actor!.page, 'play-acquired-muster-host', `${actor!.name} plays the acquired Muster the Host`,
      () => actor!.page.getByTestId('private-hand').getByRole('button', { name: /^Muster the Host/ }).click(),
      [
        { spec: 'The card acquired two rounds earlier was genuinely drawn after reshuffle', check: async () => await expect(actor!.page.getByRole('button', { name: /^Muster the Host/ })).toHaveAttribute('aria-pressed', 'true') },
        { spec: 'Its complete Stronghold and Roads placement icons make the available Roads space legal', check: async () => await expect(actor!.page.getByTestId('space-take-war-effort')).toBeEnabled() }
      ]
    );
    await steps.gesture(actor!.page, 'use-acquired-muster-host', `${actor!.name} uses the acquired card on the board`,
      () => actor!.page.getByTestId('space-take-war-effort').click(),
      [
        { spec: 'The acquired card recruits one Company before the board reward', check: async () => {
          const player = actor!.page.locator('.players article').filter({ hasText: actor!.name });
          await expect(player).toContainText('Garrison4');
          await expect(player).toContainText('Supply8');
        } },
        { spec: 'Every client sees the new occupation and base-game Gold reward', check: async () => {
          for (const seat of seats) {
            await expect(seat.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${actor!.name}`);
            await expect(seat.page.locator('.players article').filter({ hasText: actor!.name })).toContainText('Gold2');
          }
        } },
        convergedEvents(33)
      ]
    );
    await steps.gesture(actor!.page, 'reload-acquired-card', `${actor!.name} reloads after using the acquired card`,
      async () => { await actor!.page.reload(); },
      [
        { spec: 'Acquisition, reshuffle, draw, Journey effect, and occupation replay identically', check: async () => {
          await expect(actor!.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${actor!.name}`);
          const player = actor!.page.locator('.players article').filter({ hasText: actor!.name });
          await expect(player).toContainText('Garrison4');
          await expect(player).toContainText('Gold2');
        } },
        convergedEvents(33)
      ]
    );

    await revealAndFinish(actor!, 'round-3-seat-2', 34, 35);
    await steps.observe(actor!.page, 'round-4-recall', 'Recall opens round 4 with accumulated standing', [
      { spec: 'The first-player marker rotates and prior standing persists', check: async () => {
        for (const seat of seats) {
          await expect(seat.page.getByText('Round 4 · Agent turns')).toBeVisible();
          await expect(seat.page.locator('.players article').filter({ hasText: actor!.name })).toContainText('Dwarven1');
          await expect(seat.page.locator('footer')).toContainText(`Current actor ${roadActor!.name}`);
        }
      } }
    ]);
    await revealAndFinish(roadActor!, 'round-4-seat-1', 36, 37);
    await steps.gesture(actor!.page, 'play-second-diplomatic-mission', `${actor!.name} chooses a reshuffled Diplomatic Mission`,
      () => actor!.page.getByTestId('private-hand').getByRole('button', { name: /^Diplomatic Mission/ }).click(),
      [
        { spec: 'The reshuffled faction card is visibly selected', check: async () => await expect(actor!.page.getByRole('button', { name: /^Diplomatic Mission/ })).toHaveAttribute('aria-pressed', 'true') },
        { spec: 'Recalled Dwarven Caravans is legal again', check: async () => await expect(actor!.page.getByTestId('space-dwarven-caravans')).toBeEnabled() }
      ]
    );
    await steps.gesture(actor!.page, 'earn-dwarven-respect', `${actor!.name} earns Dwarven respect`,
      () => actor!.page.getByTestId('space-dwarven-caravans').click(),
      [
        { spec: 'Crossing to standing two awards exactly one Renown', check: async () => {
          for (const seat of seats) {
            const player = seat.page.locator('.players article').filter({ hasText: actor!.name });
            await expect(player).toContainText('Dwarven2');
            await expect(player).toContainText('Renown1');
            await expect(player).toContainText('Provision3');
          }
        } },
        { spec: 'Every client sees the second-round Dwarven occupation', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('space-dwarven-caravans')).toContainText(`Agent · ${actor!.name}`);
        } },
        convergedEvents(38)
      ]
    );
    await steps.gesture(actor!.page, 'reload-dwarven-respect', `${actor!.name} reloads the standing threshold`,
      async () => { await actor!.page.reload(); },
      [
        { spec: 'Standing, Renown, Provision, and occupation replay exactly', check: async () => {
          const player = actor!.page.locator('.players article').filter({ hasText: actor!.name });
          await expect(player).toContainText('Dwarven2');
          await expect(player).toContainText('Renown1');
          await expect(player).toContainText('Provision3');
          await expect(actor!.page.getByTestId('space-dwarven-caravans')).toContainText(`Agent · ${actor!.name}`);
        } },
        convergedEvents(38)
      ]
    );

    await revealAndFinish(shadowActor!, 'round-4-seat-3', 39, 40);
    await steps.gesture(actor!.page, 'play-seek-allies', `${actor!.name} chooses Seek Allies`,
      () => actor!.page.getByTestId('private-hand').getByRole('button', { name: /^Seek Allies/ }).click(),
      [
        { spec: 'Seek Allies is selected from the genuine round-4 hand', check: async () => await expect(actor!.page.getByRole('button', { name: /^Seek Allies/ })).toHaveAttribute('aria-pressed', 'true') },
        { spec: 'The remaining Shadow faction destination is legal', check: async () => await expect(actor!.page.getByTestId('space-tribute-shadow')).toBeEnabled() }
      ]
    );
    await steps.gesture(actor!.page, 'seek-shadow-allies', `${actor!.name} seeks allies in the Shadow`,
      () => actor!.page.getByTestId('space-tribute-shadow').click(),
      [
        { spec: 'The board reward resolves before the Journey choice', check: async () => {
          const player = actor!.page.locator('.players article').filter({ hasText: actor!.name });
          await expect(player).toContainText('Shadow1');
          await expect(player).toContainText('Gold4');
        } },
        { spec: 'Every client sees the blocking self-trash choice', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('pending-choice')).toContainText('Trash Seek Allies?');
        } },
        { spec: 'Only the actor can trash the card', check: async () => {
          await expect(actor!.page.getByRole('button', { name: 'Trash Seek Allies' })).toBeEnabled();
          for (const observer of seats.filter((seat) => seat !== actor)) await expect(observer.page.getByRole('button', { name: 'Trash Seek Allies' })).toBeDisabled();
        } },
        convergedEvents(41)
      ]
    );
    await steps.gesture(actor!.page, 'trash-seek-allies', `${actor!.name} trashes Seek Allies`,
      () => actor!.page.getByRole('button', { name: 'Trash Seek Allies' }).click(),
      [
        { spec: 'The pending choice closes everywhere', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('pending-choice')).toHaveCount(0);
        } },
        { spec: 'Exactly one card moves permanently to Trash', check: async () => {
          for (const seat of seats) await expect(seat.page.locator('.players article').filter({ hasText: actor!.name })).toContainText('Trash1');
        } },
        { spec: 'The Chronicle records the irreversible choice', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('activity-log')).toContainText(`${actor!.name} trashes Seek Allies`);
        } },
        convergedEvents(42)
      ]
    );
    await steps.gesture(actor!.page, 'reload-seek-trash', `${actor!.name} reloads the trashed card`,
      async () => { await actor!.page.reload(); },
      [
        { spec: 'Trash, Shadow reward, and occupation replay exactly', check: async () => {
          const player = actor!.page.locator('.players article').filter({ hasText: actor!.name });
          await expect(player).toContainText('Trash1');
          await expect(player).toContainText('Shadow1');
          await expect(player).toContainText('Gold4');
          await expect(actor!.page.getByTestId('space-tribute-shadow')).toContainText(`Agent · ${actor!.name}`);
        } },
        convergedEvents(42)
      ]
    );

    await revealAndFinish(actor!, 'round-4-seat-2', 43, 44);
    await steps.observe(actor!.page, 'round-5-observation-network', 'Recall opens round 5 with the observation network ready', [
      { spec: 'The first-player marker rotates to the next actor', check: async () => {
        for (const seat of seats) {
          await expect(seat.page.getByText('Round 5 · Agent turns')).toBeVisible();
          await expect(seat.page.locator('footer')).toContainText(`Current actor ${actor!.name}`);
        }
      } },
      { spec: 'All nine named observation posts and their board connections are present', check: async () => {
        await expect(actor!.page.getByTestId('scout-network').locator('.posts button')).toHaveCount(9);
        await expect(actor!.page.getByTestId('post-old-south-road')).toContainText('Take Up a War Effort');
        await expect(actor!.page.getByTestId('post-seeing-stone-road')).toContainText('Minas Tirith');
      } }
    ]);
    await revealAndFinish(actor!, 'round-5-seat-2', 45, 46);
    await revealAndFinish(shadowActor!, 'round-5-seat-3', 47, 48);
    await revealAndFinish(roadActor!, 'round-5-seat-1', 49, 50);
    await steps.observe(shadowActor!.page, 'round-6-second-deck-half', 'Recall opens round 6 from the second half of each deck', [
      { spec: 'Round 6 begins with five real cards for every human', check: async () => {
        for (const seat of seats) {
          await expect(seat.page.getByText('Round 6 · Agent turns')).toBeVisible();
          await expect(seat.page.locator('.players article').filter({ hasText: seat.name })).toContainText('Hand5');
        }
      } }
    ]);
    await revealAndFinish(shadowActor!, 'round-6-seat-3', 51, 52);
    await revealAndFinish(roadActor!, 'round-6-seat-1', 53, 54);
    await steps.observe(actor!.page, 'round-6-scout-hand', 'The Scout actor receives the turn with Reconnaissance', [
      { spec: 'Reconnaissance was genuinely drawn from the deterministic deck', check: async () => {
        await expect(actor!.page.getByTestId('private-hand').getByRole('button', { name: /^Reconnaissance/ })).toBeVisible();
      } },
      { spec: 'The acting human has the Agent-or-Reveal decision', check: async () => {
        for (const seat of seats) await expect(seat.page.locator('footer')).toContainText(`Current actor ${actor!.name}`);
      } }
    ]);
    await steps.gesture(actor!.page, 'play-reconnaissance', `${actor!.name} chooses Reconnaissance`,
      () => actor!.page.getByTestId('private-hand').getByRole('button', { name: /^Reconnaissance/ }).click(),
      [
        { spec: 'Reconnaissance is visibly selected from the genuine round-6 hand', check: async () => await expect(actor!.page.getByRole('button', { name: /^Reconnaissance/ })).toHaveAttribute('aria-pressed', 'true') },
        { spec: 'Its Stronghold and Roads icons make the available Roads destination legal', check: async () => await expect(actor!.page.getByTestId('space-take-war-effort')).toBeEnabled() }
      ]
    );
    await steps.gesture(actor!.page, 'reconnoitre-war-effort', `${actor!.name} reconnoitres the War Effort road`,
      () => actor!.page.getByTestId('space-take-war-effort').click(),
      [
        { spec: 'The board reward resolves before Scout placement', check: async () => {
          const player = actor!.page.locator('.players article').filter({ hasText: actor!.name });
          await expect(player).toContainText('Gold6');
          await expect(actor!.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${actor!.name}`);
        } },
        { spec: 'Every client sees the blocking nine-post Scout choice', check: async () => {
          for (const seat of seats) {
            await expect(seat.page.getByTestId('scout-network')).toContainText('Choose an empty post for the Scout.');
            await expect(seat.page.getByTestId('scout-network').locator('.posts button')).toHaveCount(9);
          }
        } },
        { spec: 'Only the acting human can choose a post', check: async () => {
          await expect(actor!.page.getByTestId('post-old-south-road')).toBeEnabled();
          for (const observer of seats.filter((seat) => seat !== actor)) await expect(observer.page.getByTestId('post-old-south-road')).toBeDisabled();
        } },
        { spec: 'The turn cannot advance until the Scout is placed', check: async () => {
          for (const seat of seats) await expect(seat.page.locator('footer')).toContainText(`Current actor ${actor!.name}`);
        } },
        convergedEvents(55)
      ]
    );
    await steps.gesture(actor!.page, 'place-old-south-road-scout', `${actor!.name} places a Scout on the Old South Road`,
      () => actor!.page.getByTestId('post-old-south-road').click(),
      [
        { spec: 'Every client sees the named Scout on the selected observation post', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('post-old-south-road')).toContainText(`Scout · ${actor!.name}`);
        } },
        { spec: 'Exactly one Scout leaves the actor supply', check: async () => {
          for (const seat of seats) await expect(seat.page.locator('.players article').filter({ hasText: actor!.name })).toContainText('Scouts2 supply');
        } },
        { spec: 'The Scout choice closes and returns the only unrevealed human to their normal decision', check: async () => {
          for (const seat of seats) {
            await expect(seat.page.getByTestId('scout-network')).toContainText('Scouts watch the roads.');
            await expect(seat.page.locator('footer')).toContainText(`Current actor ${actor!.name}`);
          }
          await expect(actor!.page.getByRole('button', { name: 'Reveal remaining hand' })).toBeEnabled();
        } },
        { spec: 'The Chronicle names the persistent Scout post', check: async () => {
          for (const seat of seats) await expect(seat.page.getByTestId('activity-log')).toContainText(`${actor!.name} places a Scout at Old South Road`);
        } },
        convergedEvents(56)
      ]
    );
    await steps.gesture(actor!.page, 'reload-scout-post', `${actor!.name} reloads the observation network`,
      async () => { await actor!.page.reload(); },
      [
        { spec: 'Scout, Agent, and board reward replay identically', check: async () => {
          await expect(actor!.page.getByTestId('post-old-south-road')).toContainText(`Scout · ${actor!.name}`);
          await expect(actor!.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${actor!.name}`);
          const player = actor!.page.locator('.players article').filter({ hasText: actor!.name });
          await expect(player).toContainText('Scouts2 supply');
          await expect(player).toContainText('Gold6');
        } },
        convergedEvents(56)
      ]
    );

    steps.generateDocs(
      'Three-player Agent, deck-building, and Scout tracer',
      'Three isolated human browser sessions create and join a Firebase room, resolve ordinary actions, Reveal, acquire, Recall, reshuffle, use an acquired card, cross a faction threshold, trash a card, and place a persistent Scout with convergence and replay.'
    );
  } finally {
    await guestAContext.close();
    await guestBContext.close();
  }
});
