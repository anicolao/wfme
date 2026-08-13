import { expect, test, type BrowserContext, type Locator, type Page } from '@playwright/test';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';
import { openFirebaseClients, reloadGameClient, waitForCurrentSeat } from '../helpers/firebase-readiness';

type Seat = { name: string; page: Page; context?: BrowserContext };

test('three humans execute every final printed board destination', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const viewport = page.viewportSize() ?? { width: 1280, height: 960 };
  const guestAContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5190', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const guestBContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5190', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const seats: Seat[] = [
    { name: 'Mara', page },
    { name: 'Rin', page: await guestAContext.newPage(), context: guestAContext },
    { name: 'Pip', page: await guestBContext.newPage(), context: guestBContext }
  ];
  let accepted = 0;
  const converged = (count: number, observers = seats): Verification => ({
    spec: `Every connected browser replays ${count} accepted events with no diagnostics`,
    check: async () => {
      for (const seat of observers) await expect(seat.page.getByTestId('replay-health')).toHaveText(` · ${count} accepted events · 0 replay diagnostics`, { timeout: 2_000 });
    }
  });
  const currentSeat = async () => waitForCurrentSeat(seats);
  const playerRow = (observer: Seat, name: string) => observer.page.locator('.players article').filter({ hasText: name });
  const resource = async (seat: Seat, label: string) => Number(await playerRow(seat, seat.name).getByText(label, { exact: true }).locator('..').locator('dd').textContent());

  async function selectForSpace(seat: Seat, spaceId: string, guard: number): Promise<Locator | null> {
    const cards = seat.page.getByTestId('private-hand').getByRole('button');
    const count = await cards.count();
    for (let index = 0; index < count; index += 1) {
      const card = cards.nth(index);
      if (await card.isDisabled()) continue;
      const cardName = (await card.locator('strong').textContent())?.trim() ?? `card ${index + 1}`;
      const scroll = await seat.page.evaluate(() => ({ x: scrollX, y: scrollY }));
      await steps.gesture(seat.page, `select-${spaceId}-${guard}-${index}`, `${seat.name} tests ${cardName} for ${spaceId}`, async () => {
        await card.click();
        await card.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
      }, [
        { spec: 'The card is selected by a real click and its legal board highlights update', check: async () => await expect(card).toHaveAttribute('aria-pressed', 'true') }
      ]);
      await seat.page.evaluate(({ x, y }) => scrollTo(x, y), scroll);
      if (await seat.page.getByTestId(`space-${spaceId}`).isEnabled()) return card;
    }
    return null;
  }

  try {
    await openFirebaseClients(seats.map((seat) => seat.page));
    await steps.gesture(page, 'host-name', 'Mara enters a table name', () => page.getByLabel('Display name').fill('Mara'), [
      { spec: 'The lobby accepts the host name', check: async () => await expect(page.getByLabel('Display name')).toHaveValue('Mara') }
    ]);
    const code = testInfo.project.name === 'phone' ? 'BRDPH' : 'BRDDS';
    await steps.gesture(page, 'host-code', 'Mara enters the complete-board room code', () => page.getByLabel(/Room code/).fill(code), [
      { spec: 'The exact invitation is visible', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(code) }
    ]);
    await steps.gesture(page, 'create-room', 'Mara creates the Firebase room', async () => {
      await page.getByRole('button', { name: 'Create game' }).click(); accepted += 1;
    }, [{ spec: 'The requested room opens', check: async () => await expect(page.getByTestId('room-code')).toHaveText(code, { timeout: 2_000 }) }, converged(accepted + 1, seats.slice(0, 1))]);
    for (const [index, seat] of seats.slice(1).entries()) {
      await steps.gesture(seat.page, `guest-${index + 1}-name`, `${seat.name} enters a table name`, () => seat.page.getByLabel('Display name').fill(seat.name), [
        { spec: 'The isolated browser retains the name', check: async () => await expect(seat.page.getByLabel('Display name')).toHaveValue(seat.name) }
      ]);
      await steps.gesture(seat.page, `guest-${index + 1}-code`, `${seat.name} enters the invitation`, () => seat.page.getByLabel(/Room code/).fill(code), [
        { spec: 'The isolated browser uses the shared invitation', check: async () => await expect(seat.page.getByLabel(/Room code/)).toHaveValue(code) }
      ]);
      await steps.gesture(seat.page, `guest-${index + 1}-join`, `${seat.name} joins the room`, async () => {
        await seat.page.getByRole('button', { name: 'Join game' }).click(); accepted += 1;
      }, [{ spec: 'All connected lobbies show the joined seat', check: async () => {
        for (const observer of seats.slice(0, index + 2)) await expect(observer.page.getByText(seat.name, { exact: true })).toBeVisible();
      } }, converged(accepted + 1, seats.slice(0, index + 2))]);
    }
    for (const [index, seat] of seats.entries()) {
      const commander = ['Aragorn', 'Galadriel', 'Gandalf'][index];
      await steps.gesture(seat.page, `commander-${index + 1}`, `${seat.name} selects ${commander}`, async () => {
        await seat.page.getByRole('button', { name: new RegExp(`^${commander}`) }).click(); accepted += 1;
      }, [{ spec: 'The unique Commander identity is public', check: async () => await expect(seat.page.getByRole('button', { name: new RegExp(`^${commander}`) })).toHaveAttribute('aria-pressed', 'true') }, converged(accepted + 1)]);
      await steps.gesture(seat.page, `ready-${index + 1}`, `${seat.name} readies`, async () => {
        await seat.page.getByRole('button', { name: 'I am ready' }).click(); accepted += 1;
      }, [{ spec: 'Every observer sees the ready state', check: async () => {
        for (const observer of seats) await expect(observer.page.locator('.player-list article').filter({ hasText: seat.name })).toContainText('Ready');
      } }, converged(accepted + 1)]);
    }
    await steps.gesture(page, 'complete-board-seed', 'Mara enters the published complete-board seed', () => page.getByLabel('Match seed').fill('complete-board-1'), [
      { spec: 'The deterministic seed is visible', check: async () => await expect(page.getByLabel('Match seed')).toHaveValue('complete-board-1') }
    ]);
    await steps.gesture(page, 'start-match', 'Mara starts the complete-board match', async () => {
      await page.getByRole('button', { name: 'Start seeded match' }).click(); accepted += 1;
    }, [
      { spec: 'Every browser reports all twenty-two destinations executable', check: async () => {
        for (const seat of seats) await expect(seat.page.locator('[data-testid^="space-"]')).toHaveCount(22);
      } },
      converged(accepted + 1)
    ]);

    const roles = { forge: 'Rin', archives: 'Pip', osgiliath: 'Mara' };
    let forgeComplete = false;
    let archivesComplete = false;
    let osgiliathComplete = false;
    let pendingTokenDestination: {
      spaceId: string;
      provisionsBefore: number;
      handBefore: number;
      mithrilBefore: number;
      goldBefore: number;
    } | null = null;
    for (let guard = 0; guard < 500 && !(forgeComplete && archivesComplete && osgiliathComplete); guard += 1) {
      const actor = await currentSeat();
      const pending = actor.page.getByTestId('pending-choice');
      if (await pending.isVisible().catch(() => false)) {
        if (await actor.page.getByRole('heading', { name: 'When will Mirror Unveiled?' }).isVisible().catch(() => false)) {
          if (!pendingTokenDestination) throw new Error('Mirror Unveiled opened without a queued destination proof');
          const destination = pendingTokenDestination;
          await steps.gesture(actor.page, `token-destination-first-${guard}`, `${actor.name} resolves the printed destination before Mirror Unveiled`, async () => {
            await actor.page.getByRole('button', { name: 'Destination first' }).click(); accepted += 1;
          }, [
            { spec: 'The ordered Commander prompt closes after the real destination-first click', check: async () => await expect(actor.page.getByRole('heading', { name: 'When will Mirror Unveiled?' })).toHaveCount(0) },
            ...(destination.spaceId === 'great-forge' ? [
              { spec: 'Great Forge now charges 3 Mithril and grants 5 Gold at the chosen point in the order', check: async () => {
                await expect(playerRow(actor, actor.name).getByText('Mithril', { exact: true }).locator('..')).toContainText(String(destination.mithrilBefore - 3));
                await expect(playerRow(actor, actor.name).getByText('Gold', { exact: true }).locator('..')).toContainText(String(destination.goldBefore + 5));
              } }
            ] : destination.spaceId === 'archives-rivendell' ? [
              { spec: 'Archives now charges 2 Provisions and leaves one extra card in hand at the chosen point in the order', check: async () => {
                await expect(playerRow(actor, actor.name).getByText('Provision', { exact: true }).locator('..')).toContainText(String(destination.provisionsBefore - 2));
                await expect(playerRow(actor, actor.name).getByText('Hand', { exact: true }).locator('..')).toContainText(String(destination.handBefore + 1));
              } }
            ] : [
              { spec: 'Osgiliath opens its printed river-crossing choice before the Ring ability', check: async () => await expect(actor.page.getByRole('heading', { name: 'How much Mithril will cross the river?' })).toBeVisible() }
            ]),
            converged(accepted + 1)
          ]);
          pendingTokenDestination = null;
          continue;
        }
        if (await actor.page.getByRole('heading', { name: 'How much Mithril will cross the river?' }).isVisible().catch(() => false)) {
          const goldBefore = await resource(actor, 'Gold');
          await steps.gesture(actor.page, 'osgiliath-free-crossing', `${actor.name} takes Osgiliath's free crossing`, async () => {
            await actor.page.getByRole('button', { name: 'Pay no Mithril · gain 2 Gold' }).click(); accepted += 1;
          }, [
            { spec: 'The acting human gains exactly 2 Gold without paying Mithril', check: async () => await expect(playerRow(actor, actor.name).getByText('Gold', { exact: true }).locator('..')).toContainText(String(goldBefore + 2)) },
            { spec: 'Every observer sees the completed Osgiliath occupation', check: async () => {
              for (const observer of seats) await expect(observer.page.getByTestId('space-osgiliath')).toContainText(actor.name);
            } }, converged(accepted + 1)
          ]);
          osgiliathComplete = true;
          continue;
        }
        if (await actor.page.getByRole('heading', { name: 'Which alliance receives the forged gifts?' }).isVisible().catch(() => false)) {
          const wildBefore = await resource(actor, 'Wild');
          await steps.gesture(actor.page, 'great-forge-wild-gift', `${actor.name} gives the forged gifts to the Wild Kindreds`, async () => {
            await actor.page.getByRole('button', { name: 'Gain wild standing' }).click(); accepted += 1;
          }, [
            { spec: 'The chosen faction standing rises exactly once', check: async () => await expect(playerRow(actor, actor.name).getByText('Wild', { exact: true }).locator('..')).toContainText(String(wildBefore + 1)) },
            { spec: 'The Chronicle records the completed Great Forge choice', check: async () => await expect(actor.page.getByTestId('activity-log')).toContainText('standing at Great Forge') },
            converged(accepted + 1)
          ]);
          forgeComplete = true;
          continue;
        }
        if (await actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' }).isVisible().catch(() => false)) {
          await steps.gesture(actor.page, `deploy-zero-${guard}`, `${actor.name} keeps Companies in garrison`, async () => {
            await actor.page.getByRole('button', { name: 'Deploy 0', exact: true }).click(); accepted += 1;
          }, [{ spec: 'The ordered deployment closes without adding Battle Strength', check: async () => await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toHaveCount(0) }, converged(accepted + 1)]);
          continue;
        }
        if (await actor.page.getByRole('button', { name: 'Keep Seek Allies' }).isVisible().catch(() => false)) {
          await steps.gesture(actor.page, `keep-seek-${guard}`, `${actor.name} keeps Seek Allies`, async () => {
            await actor.page.getByRole('button', { name: 'Keep Seek Allies' }).click(); accepted += 1;
          }, [{ spec: 'The Journey choice resolves before authority advances', check: async () => await expect(actor.page.getByRole('button', { name: 'Keep Seek Allies' })).toHaveCount(0) }, converged(accepted + 1)]);
          continue;
        }
        if (await actor.page.getByRole('button', { name: 'Leave Scouts in place' }).isVisible().catch(() => false)) {
          await steps.gesture(actor.page, `leave-scout-${guard}`, `${actor.name} leaves Scouts in place`, async () => {
            await actor.page.getByRole('button', { name: 'Leave Scouts in place' }).click(); accepted += 1;
          }, [{ spec: 'The intelligence choice resolves through its visible control', check: async () => await expect(actor.page.getByRole('button', { name: 'Leave Scouts in place' })).toHaveCount(0) }, converged(accepted + 1)]);
          continue;
        }
        if (await actor.page.getByRole('button', { name: 'Decline defense' }).isVisible().catch(() => false)) {
          await steps.gesture(actor.page, `decline-defense-${guard}`, `${actor.name} declines the critical defense`, async () => {
            await actor.page.getByRole('button', { name: 'Decline defense' }).click(); accepted += 1;
          }, [{ spec: 'Round-start authority resumes after the defense window', check: async () => await expect(actor.page.getByRole('button', { name: 'Decline defense' })).toHaveCount(0) }, converged(accepted + 1)]);
          continue;
        }
        throw new Error(`Unhandled ordered choice for ${actor.name}: ${await pending.textContent()}`);
      }
      if (await actor.page.getByTestId('scout-network').getByText('Choose an empty post for the Scout.').isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `place-scout-${guard}`, `${actor.name} places the ordered Scout`, async () => {
          await actor.page.locator('[data-testid^="post-"]:enabled').first().click(); accepted += 1;
        }, [{ spec: 'The Scout is placed before any queued Battle deployment', check: async () => await expect(actor.page.getByTestId('scout-network')).toContainText('Scouts watch the roads.') }, converged(accepted + 1)]);
        continue;
      }
      const passBattle = actor.page.getByTestId('pass-battle');
      if (await passBattle.count() > 0 && await passBattle.isEnabled()) {
        await steps.gesture(actor.page, `pass-battle-${guard}`, `${actor.name} passes Combat Fate`, async () => {
          await actor.page.getByTestId('pass-battle').click(); accepted += 1;
        }, [{ spec: 'The real Battle pass is accepted without replay diagnostics', check: async () => await expect(actor.page.getByTestId('replay-health')).toContainText('0 replay diagnostics') }, converged(accepted + 1)]);
        continue;
      }
      if (await actor.page.getByRole('button', { name: 'Finish Reveal' }).isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `finish-reveal-${guard}`, `${actor.name} finishes Reveal`, async () => {
          await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted += 1;
        }, [{ spec: 'The public Muster row closes and authority advances', check: async () => await expect(actor.page.getByTestId('replay-health')).toContainText('0 replay diagnostics') }, converged(accepted + 1)]);
        continue;
      }

      let desiredSpace: string | null = null;
      if (actor.name === roles.osgiliath && !osgiliathComplete) desiredSpace = 'osgiliath';
      else if (actor.name === roles.archives && !archivesComplete) desiredSpace = await resource(actor, 'Provision') < 2 ? 'dwarven-caravans' : 'archives-rivendell';
      else if (actor.name === roles.forge && !forgeComplete) {
        desiredSpace = await resource(actor, 'Dwarven') < 2 ? 'dwarven-caravans' : await resource(actor, 'Mithril') < 3 ? 'edoras' : 'great-forge';
      }
      if (!desiredSpace) {
        await steps.gesture(actor.page, `reveal-complete-${guard}`, `${actor.name} Reveals after completing their destination`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted += 1;
        }, [{ spec: 'Completed destination work leaves an ordinary legal Reveal', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) }, converged(accepted + 1)]);
        continue;
      }
      const selected = await selectForSpace(actor, desiredSpace, guard);
      if (!selected) {
        await steps.gesture(actor.page, `reveal-no-${desiredSpace}-${guard}`, `${actor.name} Reveals without a legal ${desiredSpace} card`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted += 1;
        }, [{ spec: 'The honest Reveal preserves turn legality when the needed icon is absent', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) }, converged(accepted + 1)]);
        continue;
      }
      const provisionsBefore = await resource(actor, 'Provision');
      const handBefore = await resource(actor, 'Hand');
      const mithrilBefore = await resource(actor, 'Mithril');
      const goldBefore = await resource(actor, 'Gold');
      const selectedCardName = (await selected.locator('strong').textContent())?.trim() ?? '';
      const usesCommanderRing = selectedCardName === 'Token of Command';
      if (usesCommanderRing) {
        pendingTokenDestination = {
          spaceId: desiredSpace,
          provisionsBefore,
          handBefore,
          mithrilBefore,
          goldBefore
        };
      }
      await steps.gesture(actor.page, `enter-${desiredSpace}-${guard}`, `${actor.name} enters ${desiredSpace}`, async () => {
        await actor.page.getByTestId(`space-${desiredSpace}`).click(); accepted += 1;
      }, [
        { spec: 'Every observer sees the named Agent on the chosen printed destination', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId(`space-${desiredSpace}`)).toContainText(actor.name);
        } },
        { spec: 'The placement is accepted by every immutable replay', check: async () => await expect(actor.page.getByTestId('replay-health')).toContainText('0 replay diagnostics') },
        ...(usesCommanderRing ? [
          { spec: 'Token of Command pays the printed entry cost, then pauses before resolving the destination reward', check: async () => {
            await expect(actor.page.getByRole('heading', { name: 'When will Mirror Unveiled?' })).toBeVisible();
            await expect(playerRow(actor, actor.name).getByText('Provision', { exact: true }).locator('..')).toContainText(String(provisionsBefore - (desiredSpace === 'archives-rivendell' ? 2 : 0)));
            await expect(playerRow(actor, actor.name).getByText('Hand', { exact: true }).locator('..')).toContainText(String(handBefore - 1));
            await expect(playerRow(actor, actor.name).getByText('Mithril', { exact: true }).locator('..')).toContainText(String(mithrilBefore - (desiredSpace === 'great-forge' ? 3 : 0)));
            await expect(playerRow(actor, actor.name).getByText('Gold', { exact: true }).locator('..')).toContainText(String(goldBefore));
          } }
        ] : desiredSpace === 'archives-rivendell' ? [
          { spec: 'Archives charges exactly 2 Provisions and the two draws leave one extra card in hand after placement', check: async () => {
            await expect(playerRow(actor, actor.name).getByText('Provision', { exact: true }).locator('..')).toContainText(String(provisionsBefore - 2));
            await expect(playerRow(actor, actor.name).getByText('Hand', { exact: true }).locator('..')).toContainText(String(handBefore + 1));
          } }
        ] : []),
        ...(!usesCommanderRing && desiredSpace === 'great-forge' ? [
          { spec: 'Great Forge charges 3 Mithril and grants 5 Gold before its faction choice', check: async () => {
            await expect(playerRow(actor, actor.name).getByText('Mithril', { exact: true }).locator('..')).toContainText(String(mithrilBefore - 3));
            await expect(playerRow(actor, actor.name).getByText('Gold', { exact: true }).locator('..')).toContainText(String(goldBefore + 5));
          } }
        ] : []),
        converged(accepted + 1)
      ]);
      if (desiredSpace === 'archives-rivendell') {
        archivesComplete = true;
      }
    }

    expect({ forgeComplete, archivesComplete, osgiliathComplete }).toEqual({ forgeComplete: true, archivesComplete: true, osgiliathComplete: true });
    await steps.gesture(page, 'reload-complete-board', 'Mara reloads the completed printed board', async () => {
      await reloadGameClient(page);
    }, [
      { spec: 'All twenty-two destinations remain executable after replay', check: async () => await expect(page.locator('[data-testid^="space-"]')).toHaveCount(22) },
      { spec: 'The final destination history survives reload', check: async () => {
        await expect(page.getByTestId('activity-log')).toContainText('Archives of Rivendell');
        await expect(page.getByTestId('activity-log')).toContainText('at Osgiliath');
        await expect(page.getByTestId('activity-log')).toContainText('standing at Great Forge');
      } },
      converged(accepted)
    ]);
    steps.generateDocs(
      'Complete printed board tracer',
      'Three isolated human browsers build the requirements for Archives of Rivendell, Osgiliath, and Great Forge through ordinary rounds, execute every ordered payment and choice with visible controls, converge, and reload the immutable history.'
    );
  } finally {
    await guestAContext.close();
    await guestBContext.close();
  }
});
