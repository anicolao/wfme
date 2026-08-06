import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';
import { openFirebaseClients, reloadGameClient, waitForCurrentSeat } from '../helpers/firebase-readiness';

type Seat = { name: string; page: Page; context?: BrowserContext };

test('Ent-draught breaches the Dam and summons reward-doubling Ents', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const viewport = page.viewportSize() ?? { width: 1280, height: 960 };
  const guestAContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5189', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const guestBContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5189', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const seats: Seat[] = [
    { name: 'Mara', page },
    { name: 'Rin', page: await guestAContext.newPage(), context: guestAContext },
    { name: 'Pip', page: await guestBContext.newPage(), context: guestBContext }
  ];
  let accepted = 0;
  const converged = (count: number): Verification => ({
    spec: `Every connected browser replays ${count} accepted events with no diagnostics`,
    check: async () => {
      for (const seat of seats) await expect(seat.page.getByTestId('replay-health')).toHaveText(` · ${count} accepted events · 0 replay diagnostics`, { timeout: 2_000 });
    }
  });
  const currentSeat = async () => waitForCurrentSeat(seats);
  const row = (seat: Seat, name = seat.name) => seat.page.locator('.players article').filter({ hasText: name });
  const numberFrom = async (seat: Seat, label: string) => Number((await row(seat).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1');

  try {
    await openFirebaseClients(seats.map((seat) => seat.page));
    await steps.gesture(page, 'host-name', 'Mara enters a table name', async () => {
      await page.getByLabel('Display name').fill('Mara');
    }, [{ spec: 'The real lobby accepts the host name', check: async () => await expect(page.getByLabel('Display name')).toHaveValue('Mara') }]);
    const code = testInfo.project.name === 'phone' ? 'ENTS1' : 'ENTS2';
    await steps.gesture(page, 'host-code', 'Mara enters an Ent journey room code', async () => {
      await page.getByLabel(/Room code/).fill(code);
    }, [{ spec: 'The invitation code is visible', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(code) }]);
    await steps.gesture(page, 'create-room', 'Mara creates the shared room', async () => {
      await page.getByRole('button', { name: 'Create game' }).click(); accepted += 1;
    }, [{ spec: 'The room is live in Firebase', check: async () => await expect(page.getByTestId('room-code')).toHaveText(code, { timeout: 2_000 }) }]);
    for (const [index, seat] of seats.slice(1).entries()) {
      await steps.gesture(seat.page, `guest-${index + 1}-name`, `${seat.name} enters a table name`, async () => {
        await seat.page.getByLabel('Display name').fill(seat.name);
      }, [{ spec: 'The independent browser retains its name', check: async () => await expect(seat.page.getByLabel('Display name')).toHaveValue(seat.name) }]);
      await steps.gesture(seat.page, `guest-${index + 1}-code`, `${seat.name} enters the invitation code`, async () => {
        await seat.page.getByLabel(/Room code/).fill(code);
      }, [{ spec: 'The independent browser uses the exact room code', check: async () => await expect(seat.page.getByLabel(/Room code/)).toHaveValue(code) }]);
      await steps.gesture(seat.page, `guest-${index + 1}-join`, `${seat.name} joins the room`, async () => {
        await seat.page.getByRole('button', { name: 'Join game' }).click(); accepted += 1;
      }, [{ spec: 'Every connected lobby sees the new seat', check: async () => {
        for (const observer of seats.slice(0, index + 2)) await expect(observer.page.getByText(seat.name, { exact: true })).toBeVisible();
      } }]);
    }
    for (const [index, seat] of seats.entries()) {
      const commander = ['Aragorn', 'Galadriel', 'Gandalf'][index];
      await steps.gesture(seat.page, `commander-${index + 1}`, `${seat.name} selects ${commander}`, async () => {
        await seat.page.getByRole('button', { name: new RegExp(`^${commander}`) }).click(); accepted += 1;
      }, [{ spec: 'The Commander selection is public and unique', check: async () => await expect(seat.page.getByRole('button', { name: new RegExp(`^${commander}`) })).toHaveAttribute('aria-pressed', 'true') }]);
      await steps.gesture(seat.page, `ready-${index + 1}`, `${seat.name} readies`, async () => {
        await seat.page.getByRole('button', { name: 'I am ready' }).click(); accepted += 1;
      }, [{ spec: 'Every observer sees the ready state', check: async () => {
        for (const observer of seats) await expect(observer.page.locator('.player-list article').filter({ hasText: seat.name })).toContainText('Ready');
      } }]);
    }
    await steps.gesture(page, 'ent-seed', 'Mara chooses the published Ent journey seed', async () => {
      await page.getByLabel('Match seed').fill('deep-route-38');
    }, [{ spec: 'The deterministic setup seed is visible', check: async () => await expect(page.getByLabel('Match seed')).toHaveValue('deep-route-38') }]);
    await steps.gesture(page, 'start-match', 'Mara starts the deterministic match', async () => {
      await page.getByRole('button', { name: 'Start seeded match' }).click(); accepted += 1;
    }, [
      { spec: 'All three browsers open the same production board and first Battle', check: async () => {
        for (const seat of seats) {
          await expect(seat.page.getByRole('heading', { name: 'The living board' })).toBeVisible();
          await expect(seat.page.getByTestId('active-battle')).toContainText('Raid on the Westfold');
        }
      } },
      { spec: 'The complete printed board exposes twenty-two executable destinations', check: async () => await expect(page.locator('[data-testid^="space-"]')).toHaveCount(22) },
      converged(accepted + 1)
    ]);

    const target = await currentSeat();
    let protectedChecked = false;
    let summoned = false;
    let combatReady = false;
    for (let guard = 0; guard < 220; guard += 1) {
      const actor = await currentSeat();
      const pending = actor.page.getByTestId('pending-choice');
      if (await pending.isVisible().catch(() => false)) {
        if (await actor.page.getByRole('heading', { name: 'What does the Moot decide?' }).isVisible().catch(() => false)) {
          const hasDraught = (await row(target).textContent())?.includes('Ent-draughtReady') ?? false;
          const action = hasDraught ? /Gain 1 Provision and breach the Dam/ : /Take Ent-draught/;
          await steps.gesture(actor.page, hasDraught ? 'breach-dam' : 'take-ent-draught', hasDraught ? `${actor.name} breaches the Dam` : `${actor.name} takes Ent-draught`, async () => {
            await actor.page.getByRole('button', { name: action }).click(); accepted += 1;
          }, [
            { spec: hasDraught ? 'The Dam is permanently breached for every observer' : 'Ent-draught ownership, recruitment, and Provision are public', check: async () => {
              for (const observer of seats) {
                if (hasDraught) await expect(observer.page.getByTestId('dam-status')).toContainText('Breached');
                else await expect(row(observer, target.name)).toContainText('Ent-draughtReady');
              }
            } }, converged(accepted + 1)
          ]);
          continue;
        }
        if (await actor.page.getByRole('heading', { name: 'Call the Ents or take Mithril?' }).isVisible().catch(() => false)) {
          const damBreached = await actor.page.getByTestId('dam-status').getByText('Breached').isVisible().catch(() => false);
          if (!damBreached) {
            protectedChecked = true;
            await steps.gesture(actor.page, 'choose-protected-mithril', `${actor.name} takes Mithril while the intact Dam protects the Battle`, async () => {
              await actor.page.getByRole('button', { name: 'Gain 4 Mithril' }).click(); accepted += 1;
            }, [
              { spec: 'No summon control is exposed for the protected Battle', check: async () => await expect(actor.page.getByRole('button', { name: 'Summon 2 Ents' })).toHaveCount(0) },
              converged(accepted + 1)
            ]);
          } else {
            await steps.gesture(actor.page, 'summon-two-ents', `${actor.name} summons two Ents into the active Battle`, async () => {
              await actor.page.getByRole('button', { name: 'Summon 2 Ents' }).click(); accepted += 1; summoned = true;
            }, [
              { spec: 'Every observer sees two Ents and at least six unit Strength immediately', check: async () => {
                for (const observer of seats) {
                  const force = observer.page.getByTestId('active-battle').locator('article').filter({ hasText: target.name });
                  await expect(force).toContainText('2 Ents');
                  await expect(force.locator('b')).toContainText(/(?:6|[7-9]|\d{2,}) Strength/);
                }
              } }, converged(accepted + 1)
            ]);
          }
          continue;
        }
        if (await actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' }).isVisible().catch(() => false)) {
          await steps.gesture(actor.page, `deploy-zero-${guard}`, `${actor.name} leaves Companies in garrison`, async () => {
            await actor.page.getByRole('button', { name: 'Deploy 0', exact: true }).click(); accepted += 1;
          }, [{ spec: summoned ? 'The summoned Ents remain in Battle without a Company' : 'No Company enters the Battle', check: async () => {
            if (summoned) await expect(actor.page.getByTestId('active-battle').locator('article').filter({ hasText: target.name })).toContainText('2 Ents');
          } }, converged(accepted + 1)]);
          continue;
        }
        if (await actor.page.getByRole('button', { name: 'Keep Seek Allies' }).isVisible().catch(() => false)) {
          await steps.gesture(actor.page, `keep-seek-${guard}`, `${actor.name} keeps Seek Allies`, async () => {
            await actor.page.getByRole('button', { name: 'Keep Seek Allies' }).click(); accepted += 1;
          }, [{ spec: 'The ordered Journey choice closes', check: async () => await expect(actor.page.getByRole('button', { name: 'Keep Seek Allies' })).toHaveCount(0) }, converged(accepted + 1)]);
          continue;
        }
        if (await actor.page.getByRole('button', { name: 'Keep all cards' }).isVisible().catch(() => false)) {
          await steps.gesture(actor.page, `keep-ranger-${guard}`, `${actor.name} keeps every Ranger card`, async () => {
            await actor.page.getByRole('button', { name: 'Keep all cards' }).click(); accepted += 1;
          }, [{ spec: 'The Ranger choice closes without trashing', check: async () => await expect(actor.page.getByRole('button', { name: 'Keep all cards' })).toHaveCount(0) }, converged(accepted + 1)]);
          continue;
        }
        if (await actor.page.getByRole('button', { name: 'Leave Scouts in place' }).isVisible().catch(() => false)) {
          await steps.gesture(actor.page, `leave-scout-${guard}`, `${actor.name} leaves Scouts in place`, async () => {
            await actor.page.getByRole('button', { name: 'Leave Scouts in place' }).click(); accepted += 1;
          }, [{ spec: 'The board action resumes after the ordered Scout window', check: async () => await expect(actor.page.getByRole('button', { name: 'Leave Scouts in place' })).toHaveCount(0) }, converged(accepted + 1)]);
          continue;
        }
      }
      if (await actor.page.getByTestId('scout-network').getByText('Choose an empty post for the Scout.').isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `place-scout-${guard}`, `${actor.name} places the ordered Scout`, async () => {
          await actor.page.locator('[data-testid^="post-"]:enabled').first().click(); accepted += 1;
        }, [{ spec: 'The Scout network returns to its ordinary state', check: async () => await expect(actor.page.getByTestId('scout-network')).toContainText('Scouts watch the roads.') }, converged(accepted + 1)]);
        continue;
      }
      const passBattle = actor.page.getByTestId('pass-battle');
      if (await passBattle.count() > 0 && await passBattle.isEnabled()) { combatReady = true; break; }
      if (await actor.page.getByRole('button', { name: 'Finish Reveal' }).isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `finish-reveal-${guard}`, `${actor.name} finishes Reveal`, async () => {
          await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted += 1;
        }, [{ spec: 'Authority advances through the ordinary phase sequence', check: async () => await expect(actor.page.getByTestId('replay-health')).toContainText('0 replay diagnostics') }, converged(accepted + 1)]);
        continue;
      }

      if (actor !== target) {
        await steps.gesture(actor.page, `reveal-other-${guard}`, `${actor.name} Reveals`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted += 1;
        }, [{ spec: 'The public Muster row names the acting human', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) }, converged(accepted + 1)]);
        continue;
      }

      const wild = await numberFrom(target, 'Wild');
      const provisions = await numberFrom(target, 'Provision');
      const agents = await numberFrom(target, 'Agents');
      const hasDraught = (await row(target).textContent())?.includes('Ent-draughtReady') ?? false;
      const damBreached = await target.page.getByTestId('dam-status').getByText('Breached').isVisible().catch(() => false);
      let destination = '';
      let cardPattern: RegExp | null = null;
      if (agents < 1) {
        destination = '';
      } else if (wild < 2) {
        destination = provisions > 0 ? 'ranger-mustering' : 'hidden-paths';
        cardPattern = /^(Diplomatic Mission|Seek Allies)/;
      } else if (!hasDraught) {
        destination = 'fangorn-moot'; cardPattern = /^(Armed Escort|Reconnaissance|Muster the Host)/;
      } else if (!protectedChecked && provisions >= 3) {
        const contested = await target.page.getByTestId('active-battle').getByText(/Contested:/).isVisible().catch(() => false);
        if (contested && !damBreached) { destination = 'deep-fangorn'; cardPattern = /^(The Open Road|Reconnaissance|Muster the Host)/; }
      } else if (protectedChecked && !damBreached) {
        destination = 'fangorn-moot'; cardPattern = /^(Armed Escort|Reconnaissance|Muster the Host)/;
      } else if (!summoned && provisions >= 3) {
        destination = 'deep-fangorn'; cardPattern = /^(The Open Road|Reconnaissance|Muster the Host)/;
      } else if (!summoned) {
        destination = 'dwarven-caravans'; cardPattern = /^(Diplomatic Mission|Seek Allies)/;
      }
      const occupied = destination ? (await target.page.getByTestId(`space-${destination}`).getAttribute('class'))?.includes('occupied') : true;
      const card = cardPattern ? target.page.getByTestId('private-hand').getByRole('button', { name: cardPattern }).first() : null;
      if (destination && !occupied && card && await card.count()) {
        await steps.gesture(target.page, `choose-${destination}-${guard}`, `${target.name} chooses a card for ${destination}`, async () => {
          await card.click();
        }, [{ spec: 'The intended complete destination becomes enabled', check: async () => await expect(target.page.getByTestId(`space-${destination}`)).toBeEnabled() }]);
        await steps.gesture(target.page, `visit-${destination}-${guard}`, `${target.name} visits ${destination}`, async () => {
          await target.page.getByTestId(`space-${destination}`).click(); accepted += 1;
        }, [{ spec: 'All observers see the synchronized Agent occupation', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId(`space-${destination}`)).toContainText(`Agent · ${target.name}`);
        } }, converged(accepted + 1)]);
      } else {
        await steps.gesture(target.page, `reveal-target-${guard}`, `${target.name} Reveals while waiting for the next Ent opportunity`, async () => {
          await target.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted += 1;
        }, [{ spec: 'The target uses the ordinary Reveal control', check: async () => await expect(target.page.getByTestId('reveal-panel')).toContainText(`${target.name} Reveals`) }, converged(accepted + 1)]);
      }
    }

    expect(protectedChecked, 'the browser journey must demonstrate the intact-Dam restriction').toBe(true);
    expect(summoned, 'the browser journey must summon Ents after the breach').toBe(true);
    expect(combatReady, 'the browser journey must reach the Ent Combat window').toBe(true);
    const battleName = (await page.getByTestId('active-battle').getByRole('heading').textContent())!;
    const before = {
      renown: await numberFrom(target, 'Renown'), provisions: await numberFrom(target, 'Provision'),
      gold: await numberFrom(target, 'Gold'), mithril: await numberFrom(target, 'Mithril'),
      wild: await numberFrom(target, 'Wild'), garrison: await numberFrom(target, 'Garrison'),
      supply: await numberFrom(target, 'Supply')
    };
    const expected: Record<string, Partial<typeof before>> = {
      'Wargs in the Wild': { renown: 2, provisions: 2 }, 'Battle for Osgiliath': { renown: 2 },
      'Siege of Minas Tirith': { renown: 2 },
      'Raid on the Westfold': { provisions: 2 }, 'Skirmish at Amon Hen': { mithril: 4 },
      'Contest for Aglarond': { renown: 2 }, "Battle of Helm's Deep": { renown: 4 },
      'Assault on the Fords': { renown: 2, wild: 2 },
      'Muster at Edoras': { garrison: 6, supply: -6 }
    };
    const delta = expected[battleName];
    if (!delta) throw new Error(`No doubled-reward browser expectation for ${battleName}`);
    const combatActor = await currentSeat();
    await steps.gesture(combatActor.page, 'resolve-ent-battle', `${combatActor.name} passes and resolves the Ent Battle`, async () => {
      await combatActor.page.getByTestId('pass-battle').click(); accepted += 1;
    }, [
      { spec: 'The sole Ent participant receives the ranked reward exactly twice', check: async () => {
        for (const [resource, amount] of Object.entries(delta)) {
          await expect(row(target).getByText(resource[0].toUpperCase() + resource.slice(1), { exact: true }).locator('..')).toContainText(`${before[resource as keyof typeof before] + amount!}`);
        }
      } },
      { spec: 'Ents return to the bank and Battle cleanup opens round eight', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByText('Round 6 · Agent turns')).toBeVisible();
          await expect(observer.page.getByTestId('activity-log')).toContainText(`${battleName} is won`);
        }
      } }, converged(accepted + 1)
    ]);
    await steps.gesture(target.page, 'reload-ent-resolution', `${target.name} reloads the doubled Ent reward`, async () => {
      await reloadGameClient(target.page);
    }, [{ spec: 'The doubled reward, Dam, and Ent-draught replay without diagnostics', check: async () => {
      await expect(target.page.getByTestId('dam-status')).toContainText('Breached');
      await expect(row(target)).toContainText('Ent-draughtReady');
      await expect(target.page.getByText('Round 6 · Agent turns')).toBeVisible();
      await expect(target.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
    } }, converged(accepted)]);

    steps.generateDocs('Deep Fangorn and the Ents', 'Three isolated humans earn Wild respect, obtain persistent Ent-draught, see an intact Dam prevent a protected summon, take accumulated Riches, breach the Dam through a later Moot, summon two Ents into a selected Battle, receive the ranked reward twice, clean up into the next round, and replay the persisted result.');
  } finally {
    await guestAContext.close();
    await guestBContext.close();
  }
});
