import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('three humans prove the five remaining finite board destinations', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser, page, testInfo, steps, 'final-board-spaces-1',
    { phone: 'FIVEP', desktop: 'FIVED' },
    ['Aragorn', 'Treebeard', 'Gandalf']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const [captain, factions, roads] = seats;
  let gesture = 0;
  let captainPlaced = false;
  let captainArrived = false;
  let hiddenComplete = false;
  let rangerComplete = false;
  let rangerTrashPending = false;
  let pitsFunded = false;
  let pitsComplete = false;
  let deepFangornPending = false;
  let deepFangornComplete = false;
  let deepRoadsComplete = false;
  let deepFangornMithrilBefore = 0;
  let deepFangornRichesBefore = 0;
  let rangerTrashBefore = 0;

  const number = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await row(observer, player.name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const expectNumber = async (observer: PlotSeat, player: PlotSeat, label: string, expected: number) => {
    await expect(row(observer, player.name).getByText(label, { exact: true }).locator('..')).toContainText(String(expected));
  };
  const visible = async (locator: Locator) => await locator.count() > 0 && await locator.first().isVisible() ? locator.first() : null;
  const record = async (actor: PlotSeat, id: string, description: string, action: () => Promise<void>, checks: Parameters<TestStepHelper['gesture']>[4] = []) => {
    gesture += 1;
    await steps.gesture(actor.page, `${id}-${gesture}`, description, action, [...checks, converged(accepted.value + 1)]);
  };
  const cardFor = (actor: PlotSeat, pattern: RegExp) => actor.page.getByTestId('private-hand').getByRole('button', { name: pattern }).first();
  const riches = async (actor: PlotSeat, spaceId: 'edoras' | 'deep-fangorn') => Number(
    (await actor.page.getByTestId(`space-${spaceId}`).textContent())?.match(/(\d+) Riches/)?.[1] ?? '0'
  );

  try {
    for (let guard = 0; guard < 500 && !(captainArrived && hiddenComplete && rangerComplete && pitsComplete && deepRoadsComplete); guard += 1) {
      const actor = await currentSeat();

      const deepChoice = await visible(actor.page.getByRole('button', { name: 'Gain 4 Mithril' }));
      if (deepChoice) {
        await record(actor, 'take-deep-fangorn-mithril', `${actor.name} takes Deep Fangorn’s Mithril`, async () => {
          await deepChoice.click(); accepted.value += 1;
          deepFangornPending = false;
          deepFangornComplete = true;
        }, [{ spec: 'The printed four Mithril and every accumulated Riches token resolve exactly once', check: async () => {
          for (const observer of seats) await expectNumber(observer, roads, 'Mithril', deepFangornMithrilBefore + deepFangornRichesBefore + 4);
        } }]);
        continue;
      }

      const rangerTrash = await visible(actor.page.getByRole('heading', { name: 'Trash a card from hand or discard?' }));
      if (rangerTrash) {
        const trashButton = actor.page.getByTestId('pending-choice').getByRole('button', { name: /^Trash / }).first();
        await record(actor, 'trash-with-rangers', `${actor.name} trashes one physical card with Ranger Mustering`, async () => {
          await trashButton.click(); accepted.value += 1;
          rangerTrashPending = false;
          rangerComplete = true;
        }, [
          { spec: 'The owner-only choice moves exactly one eligible physical card into the permanent Trash zone', check: async () => {
            for (const observer of seats) await expectNumber(observer, factions, 'Trash', rangerTrashBefore + 1);
          } },
          { spec: 'Observers see the following public deployment window but receive no authority over it', check: async () => {
            for (const observer of seats.filter((seat) => seat !== factions)) {
              await expect(observer.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
              await expect(observer.page.getByRole('button', { name: 'Deploy 0', exact: true })).toBeDisabled();
            }
          } }
        ]);
        continue;
      }

      const deployment = await visible(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' }));
      if (deployment) {
        await record(actor, 'decline-deployment', `${actor.name} keeps the newly recruited Companies in garrison`, async () => {
          await actor.page.getByRole('button', { name: 'Deploy 0', exact: true }).click(); accepted.value += 1;
        }, [{ spec: 'The ordered Battle window closes through its real zero-deployment control', check: async () => {
          await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toHaveCount(0);
        } }]);
        continue;
      }

      const keepSeek = await visible(actor.page.getByRole('button', { name: 'Keep Seek Allies' }));
      if (keepSeek) {
        await record(actor, 'keep-seek', `${actor.name} keeps Seek Allies`, async () => {
          await keepSeek.click(); accepted.value += 1;
        });
        continue;
      }

      const scoutHeading = await visible(actor.page.getByRole('heading', { name: /(?:Choose|Where).*(?:post|Scout)/i }));
      if (scoutHeading) {
        await record(actor, 'place-scout', `${actor.name} places an incidental Scout`, async () => {
          await actor.page.getByTestId('scout-network').getByRole('button').filter({ hasNotText: 'Scout ·' }).first().click(); accepted.value += 1;
        });
        continue;
      }

      const leaveScouts = await visible(actor.page.getByRole('button', { name: 'Leave Scouts in place' }));
      if (leaveScouts) {
        await record(actor, 'leave-scouts', `${actor.name} leaves the observation network in place`, async () => {
          await leaveScouts.click(); accepted.value += 1;
        });
        continue;
      }

      const finish = await visible(actor.page.getByRole('button', { name: 'Finish Reveal' }));
      if (finish) {
        await record(actor, 'finish-reveal', `${actor.name} finishes Reveal`, async () => {
          await finish.click(); accepted.value += 1;
        });
        continue;
      }

      const battlePass = actor.page.getByTestId('pass-battle');
      if (await battlePass.count() > 0 && await battlePass.isEnabled()) {
        await record(actor, 'pass-combat', `${actor.name} passes Combat Fate`, async () => {
          await battlePass.click(); accepted.value += 1;
        });
        continue;
      }

      if (actor === captain && captainPlaced && !captainArrived) {
        const captainText = await row(captain, captain.name).getByText('Captain', { exact: true }).locator('..').textContent();
        if (captainText?.includes('Appointed')) {
          await steps.observe(captain.page, `captain-arrives-${gesture}`, `${captain.name} begins the next turn with the appointed Captain`, [
            { spec: 'The first Captain becomes permanent at the beginning of the owner’s next Agent turn', check: async () => {
              for (const observer of seats) await expect(row(observer, captain.name).getByText('Captain', { exact: true }).locator('..')).toContainText('Appointed');
            } },
            { spec: 'One Agent remains on Captain of the Host while two more are immediately available', check: async () => {
              for (const observer of seats) await expectNumber(observer, captain, 'Agents', 2);
            } },
            converged(accepted.value)
          ]);
          captainArrived = true;
        }
      }

      let destination = '';
      let pattern: RegExp | null = null;
      if (actor === captain && !captainPlaced) {
        const gold = await number(captain, captain, 'Gold');
        if (gold >= 8) {
          destination = 'captain-host';
          pattern = /^Armed Escort/;
        } else {
          const warOpen = await captain.page.getByTestId('space-take-war-effort').getByText(/Agent ·/).count() === 0;
          destination = warOpen ? 'take-war-effort' : 'tribute-shadow';
          pattern = warOpen ? /^The Open Road/ : /^Diplomatic Mission/;
        }
      } else if (actor === factions) {
        if (!hiddenComplete) {
          destination = 'hidden-paths'; pattern = /^Diplomatic Mission/;
        } else if (!rangerComplete && !rangerTrashPending) {
          destination = 'ranger-mustering'; pattern = /^Diplomatic Mission/;
        } else if (!pitsFunded) {
          if (await riches(factions, 'edoras') >= 3) {
            destination = 'edoras'; pattern = /^The Open Road/;
          }
        } else if (!pitsComplete) {
          destination = 'pits-isengard'; pattern = /^Diplomatic Mission/;
        }
      } else if (actor === roads) {
        const provisions = await number(roads, roads, 'Provision');
        if (provisions < 3) {
          destination = 'dwarven-caravans'; pattern = /^Diplomatic Mission/;
        } else if (!deepFangornComplete && !deepFangornPending) {
          destination = 'deep-fangorn'; pattern = /^The Open Road/;
        } else if (deepFangornComplete && !deepRoadsComplete) {
          destination = 'deep-roads'; pattern = /^Diplomatic Mission/;
        }
      }

      if (!destination || !pattern) {
        await record(actor, 'reveal-waiting', `${actor.name} Reveals while the finite economy develops`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        });
        continue;
      }

      const card = cardFor(actor, pattern);
      if (await card.count() === 0 || !await card.isEnabled()) {
        await record(actor, `reveal-no-${destination}`, `${actor.name} honestly Reveals without the required ${destination} card`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        });
        continue;
      }

      const space = actor.page.getByTestId(`space-${destination}`);
      gesture += 1;
      await steps.gesture(actor.page, `select-${destination}-${gesture}`, `${actor.name} selects the physical card for ${destination}`, async () => {
        await card.click();
      }, [{ spec: 'The exact printed icon and current resources enable only a legal destination click', check: async () => await expect(space).toBeEnabled() }]);

      const before = {
        agents: await number(actor, actor, 'Agents'),
        gold: await number(actor, actor, 'Gold'),
        mithril: await number(actor, actor, 'Mithril'),
        provision: await number(actor, actor, 'Provision'),
        shadow: await number(actor, actor, 'Shadow'),
        dwarven: await number(actor, actor, 'Dwarven'),
        wild: await number(actor, actor, 'Wild'),
        garrison: await number(actor, actor, 'Garrison'),
        supply: await number(actor, actor, 'Supply'),
        fate: await number(actor, actor, 'Fate'),
        hand: await number(actor, actor, 'Hand'),
        trash: await number(actor, actor, 'Trash')
      };
      const edorasRiches = destination === 'edoras' ? await riches(actor, 'edoras') : 0;
      if (destination === 'deep-fangorn') {
        deepFangornMithrilBefore = before.mithril;
        deepFangornRichesBefore = await riches(actor, 'deep-fangorn');
      }
      if (destination === 'ranger-mustering') rangerTrashBefore = before.trash;

      await record(actor, `visit-${destination}`, `${actor.name} visits ${destination}`, async () => {
        await space.click(); accepted.value += 1;
        if (destination === 'captain-host') captainPlaced = true;
        if (destination === 'hidden-paths') hiddenComplete = true;
        if (destination === 'ranger-mustering') rangerTrashPending = true;
        if (destination === 'edoras') pitsFunded = true;
        if (destination === 'pits-isengard') pitsComplete = true;
        if (destination === 'deep-fangorn') deepFangornPending = true;
        if (destination === 'deep-roads') deepRoadsComplete = true;
      }, [
        { spec: 'Every observer sees the exact shared occupation', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId(`space-${destination}`)).toContainText(`Agent · ${actor.name}`);
        } },
        ...(destination === 'captain-host' ? [
          { spec: 'The global first Captain costs exactly eight Gold and arrives as the owner’s next Agent turn begins', check: async () => {
            for (const observer of seats) {
              await expectNumber(observer, captain, 'Gold', before.gold - 8);
              await expect(row(observer, captain.name).getByText('Captain', { exact: true }).locator('..')).toContainText('Appointed');
              await expectNumber(observer, captain, 'Agents', before.agents);
            }
          } }
        ] : destination === 'hidden-paths' ? [
          { spec: 'Hidden Paths grants exactly one Wild standing and replaces the placed card with one private draw', check: async () => {
            for (const observer of seats) await expectNumber(observer, factions, 'Wild', before.wild + 1);
            await expectNumber(factions, factions, 'Hand', before.hand);
          } }
        ] : destination === 'ranger-mustering' ? [
          { spec: 'Ranger Mustering pays one Provision, grants one Wild standing, and recruits one finite Company before trashing', check: async () => {
            for (const observer of seats) {
              await expectNumber(observer, factions, 'Provision', before.provision - 1);
              await expectNumber(observer, factions, 'Wild', before.wild + 1);
              await expectNumber(observer, factions, 'Garrison', before.garrison + 1);
              await expectNumber(observer, factions, 'Supply', before.supply - 1);
            }
          } },
          { spec: 'The optional hand/discard trash decision pauses before Battle deployment', check: async () => await expect(factions.page.getByRole('heading', { name: 'Trash a card from hand or discard?' })).toBeVisible() }
        ] : destination === 'edoras' ? [
          { spec: 'The ordinary Battle destination converts its base reward and accumulated Riches into the exact four-Mithril Pits price', check: async () => {
            for (const observer of seats) await expectNumber(observer, factions, 'Mithril', before.mithril + 1 + edorasRiches);
          } }
        ] : destination === 'pits-isengard' ? [
          { spec: 'Pits spends four Mithril, grants Shadow standing and one private Fate, and recruits four finite Companies', check: async () => {
            for (const observer of seats) {
              await expectNumber(observer, factions, 'Mithril', before.mithril - 4);
              await expectNumber(observer, factions, 'Shadow', before.shadow + 1);
              await expectNumber(observer, factions, 'Fate', before.fate + 1);
              await expectNumber(observer, factions, 'Garrison', before.garrison + Math.min(4, before.supply));
              await expectNumber(observer, factions, 'Supply', before.supply - Math.min(4, before.supply));
            }
          } }
        ] : destination === 'deep-fangorn' ? [
          { spec: 'Deep Fangorn charges exactly three Provisions and exposes the ordered Mithril choice', check: async () => {
            for (const observer of seats) await expectNumber(observer, roads, 'Provision', before.provision - 3);
            await expect(roads.page.getByRole('button', { name: 'Gain 4 Mithril' })).toBeEnabled();
          } }
        ] : destination === 'deep-roads' ? [
          { spec: 'Deep Roads spends five Mithril, grants Dwarven standing, and recruits five finite Companies for Battle', check: async () => {
            for (const observer of seats) {
              await expectNumber(observer, roads, 'Mithril', before.mithril - 5);
              await expectNumber(observer, roads, 'Dwarven', before.dwarven + 1);
              await expectNumber(observer, roads, 'Garrison', before.garrison + Math.min(5, before.supply));
              await expectNumber(observer, roads, 'Supply', before.supply - Math.min(5, before.supply));
            }
          } }
        ] : [])
      ]);
      if (destination === 'captain-host') captainArrived = true;
    }

    expect({ captainPlaced, captainArrived, hiddenComplete, rangerComplete, pitsFunded, pitsComplete, deepFangornComplete, deepRoadsComplete }).toEqual({
      captainPlaced: true,
      captainArrived: true,
      hiddenComplete: true,
      rangerComplete: true,
      pitsFunded: true,
      pitsComplete: true,
      deepFangornComplete: true,
      deepRoadsComplete: true
    });
    await steps.gesture(captain.page, 'reload-final-board', `${captain.name} reloads the completed finite-board proof`, async () => {
      await reloadGameClient(captain.page);
    }, [
      { spec: 'Replay preserves all five occupations or permanent outcomes with no diagnostics', check: async () => {
        await expect(row(captain, captain.name).getByText('Captain', { exact: true }).locator('..')).toContainText('Appointed');
        expect(await number(captain, factions, 'Trash')).toBeGreaterThan(0);
        expect(await number(captain, factions, 'Fate')).toBeGreaterThan(0);
        expect(await number(captain, roads, 'Dwarven')).toBeGreaterThan(0);
        await expect(captain.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);
    steps.generateDocs('The Five Final Board Destinations', 'Three isolated humans use only ordinary cards, turns, Riches, costs, and finite pieces to prove Hidden Paths, Ranger Mustering, Pits of Isengard, Deep Roads, and the first Captain of the Host before reloading the conserved Firebase result.');
  } finally {
    await table.close();
  }
});
