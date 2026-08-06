import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

test('Paths of the Dead recalls a Scout to enter an otherwise unaffordable space', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'paths-e2e-8', { phone: 'PATHP', desktop: 'PATHD' });
  const { seats, accepted, converged, currentSeat } = table;
  let gestureNumber = 0;
  let mustered = false;
  let scoutReady = false;
  let played = false;

  const paths = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Paths of the Dead/ }).first();
  const reconnaissance = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Reconnaissance/ }).first();
  const isVisible = async (locator: Locator) => await locator.count() > 0 && await locator.isVisible();
  const playerValue = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await observer.page.locator('aside.players article').filter({ hasText: player.name }).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const reveal = async (actor: PlotSeat, extra: Verification[] = []) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals the real remaining hand`, async () => {
      await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click();
      accepted.value += 1;
    }, [
      { spec: 'The public Muster row replaces only the acting human’s private hand', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
      ...extra,
      converged(accepted.value + 1)
    ]);
  };
  const finishReveal = async (actor: PlotSeat) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `finish-${gestureNumber}`, `${actor.name} finishes Reveal`, async () => {
      await actor.page.getByRole('button', { name: 'Finish Reveal' }).click();
      accepted.value += 1;
    }, [
      { spec: 'The Muster row closes and canonical authority advances', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0) },
      converged(accepted.value + 1)
    ]);
  };

  try {
    const buyer = await currentSeat();
    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 49');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('54 / 54');
    }

    await reveal(buyer);
    const offered = buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Paths of the Dead/ }).first();
    await expect(offered).toBeEnabled();
    gestureNumber += 1;
    await steps.gesture(buyer.page, `acquire-paths-${gestureNumber}`, `${buyer.name} acquires Paths of the Dead`, async () => {
      await offered.click();
      accepted.value += 1;
    }, [
      { spec: 'The exact four-Influence physical card enters discard and its Row position refills', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Paths of the Dead`);
        await expect(buyer.page.getByTestId('chronicle-market')).toContainText('deck 48');
      } },
      converged(accepted.value + 1)
    ]);
    await finishReveal(buyer);

    for (let guard = 0; guard < 160 && !played; guard += 1) {
      const actor = await currentSeat();
      const buyerHasPaths = actor === buyer && await isVisible(paths(buyer));
      const buyerHasReconnaissance = actor === buyer && await isVisible(reconnaissance(buyer));

      if (buyerHasPaths && !mustered) {
        await reveal(buyer, [{
          spec: 'Paths of the Dead contributes its final 1 Influence and 2 swords Muster box',
          check: async () => {
            const article = buyer.page.getByTestId('reveal-panel').getByText('Paths of the Dead', { exact: true }).locator('..');
            await expect(article).toContainText('1 Influence · 2 swords');
          }
        }]);
        mustered = true;
        await finishReveal(buyer);
        continue;
      }

      if (actor === buyer && !scoutReady && buyerHasReconnaissance) {
        gestureNumber += 1;
        await steps.gesture(buyer.page, `select-reconnaissance-${gestureNumber}`, `${buyer.name} selects Reconnaissance`, async () => {
          await reconnaissance(buyer).click();
        }, [
          { spec: 'The starting card’s Roads icon enables the ordinary War Effort destination', check: async () => await expect(buyer.page.getByTestId('space-take-war-effort')).toBeEnabled() }
        ]);

        gestureNumber += 1;
        await steps.gesture(buyer.page, `play-reconnaissance-${gestureNumber}`, `${buyer.name} scouts from the War Effort road`, async () => {
          await buyer.page.getByTestId('space-take-war-effort').click();
          accepted.value += 1;
        }, [
          { spec: 'The real Journey effect requires one finite Scout placement before authority advances', check: async () => await expect(buyer.page.getByRole('heading', { name: 'Choose an empty post for the Scout.' })).toBeVisible() },
          { spec: 'Other humans may inspect the network but cannot place this Scout', check: async () => {
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              await expect(observer.page.getByTestId('post-northern-eaves')).toBeDisabled();
            }
          } },
          converged(accepted.value + 1)
        ]);

        gestureNumber += 1;
        await steps.gesture(buyer.page, `place-northern-eaves-${gestureNumber}`, `${buyer.name} places a Scout at Northern Eaves`, async () => {
          await buyer.page.getByTestId('post-northern-eaves').click();
          accepted.value += 1;
        }, [
          { spec: 'The public finite Scout now watches Deep Fangorn and the Agent turn advances', check: async () => {
            await expect(buyer.page.getByTestId('post-northern-eaves')).toContainText(`Scout · ${buyer.name}`);
            await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
          } },
          converged(accepted.value + 1)
        ]);
        scoutReady = true;
        continue;
      }

      if (buyerHasPaths && mustered && scoutReady) {
        const handButtons = buyer.page.getByTestId('private-hand').getByRole('button');
        let ordinaryRoadCard: Locator | null = null;
        let ordinaryRoadName = '';
        for (let index = 0; index < await handButtons.count(); index += 1) {
          const candidate = handButtons.nth(index);
          const text = await candidate.textContent() ?? '';
          if (!text.startsWith('Paths of the Dead') && /Agent:.*Roads/.test(text)) {
            ordinaryRoadCard = candidate;
            ordinaryRoadName = text.split('Agent:')[0].trim();
            break;
          }
        }
        if (ordinaryRoadCard) {
          gestureNumber += 1;
          await steps.gesture(buyer.page, `select-ordinary-road-${gestureNumber}`, `${buyer.name} first selects ordinary ${ordinaryRoadName}`, async () => {
            await ordinaryRoadCard!.click();
          }, [
            { spec: 'A normal Roads card cannot enter Deep Fangorn while three Provisions are unaffordable', check: async () => {
              expect(await playerValue(seats[0], buyer, 'Provision')).toBeLessThan(3);
              await expect(buyer.page.getByTestId('space-deep-fangorn')).toBeDisabled();
            } }
          ]);
        }

        gestureNumber += 1;
        await steps.gesture(buyer.page, `select-paths-${gestureNumber}`, `${buyer.name} selects Paths of the Dead`, async () => {
          await paths(buyer).click();
        }, [
          { spec: 'The Roads and Scout card enables Deep Fangorn despite the same unaffordable three-Provision cost', check: async () => {
            expect(await playerValue(seats[0], buyer, 'Provision')).toBeLessThan(3);
            await expect(buyer.page.getByTestId('space-deep-fangorn')).toBeEnabled();
            await expect(buyer.page.getByTestId('space-deep-fangorn')).toContainText('pay 3 Provisions');
          } }
        ]);

        const provisionsBefore = await playerValue(seats[0], buyer, 'Provision');
        const scoutSupplyBefore = Number((await seats[0].page.locator('aside.players article').filter({ hasText: buyer.name }).getByText('Scouts', { exact: true }).locator('..').textContent())?.match(/(\d+) supply/)?.[1] ?? '-1');
        gestureNumber += 1;
        await steps.gesture(buyer.page, `enter-deep-fangorn-${gestureNumber}`, `${buyer.name} enters Deep Fangorn through the Paths`, async () => {
          await buyer.page.getByTestId('space-deep-fangorn').click();
          accepted.value += 1;
        }, [
          { spec: 'The Agent is committed, but cost, destination, Riches, and Battle deployment wait for the ordered recall', check: async () => {
            await expect(buyer.page.getByRole('heading', { name: 'Pay the space cost or take the Paths?' })).toBeVisible();
            await expect(buyer.page.getByRole('button', { name: 'Pay 3 Provisions' })).toHaveCount(0);
            await expect(buyer.page.getByRole('button', { name: 'Recall Northern Eaves · ignore 3 Provisions' })).toBeEnabled();
            await expect(buyer.page.getByTestId('space-deep-fangorn')).toContainText(`Agent · ${buyer.name}`);
            expect(await playerValue(seats[0], buyer, 'Provision')).toBe(provisionsBefore);
          } },
          { spec: 'Every observer sees the exact public Scout option but cannot resolve it for the owner', check: async () => {
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              await expect(observer.page.getByRole('button', { name: 'Recall Northern Eaves · ignore 3 Provisions' })).toBeDisabled();
            }
          } },
          converged(accepted.value + 1)
        ]);

        gestureNumber += 1;
        await steps.gesture(buyer.page, `recall-paths-scout-${gestureNumber}`, `${buyer.name} recalls the Northern Eaves Scout`, async () => {
          await buyer.page.getByRole('button', { name: 'Recall Northern Eaves · ignore 3 Provisions' }).click();
          accepted.value += 1;
        }, [
          { spec: 'The Scout returns to supply, no Provision is spent, and only then does Deep Fangorn offer its printed result', check: async () => {
            await expect(buyer.page.getByTestId('post-northern-eaves')).not.toContainText('Scout ·');
            expect(await playerValue(seats[0], buyer, 'Provision')).toBe(provisionsBefore);
            const scoutSupplyAfter = Number((await seats[0].page.locator('aside.players article').filter({ hasText: buyer.name }).getByText('Scouts', { exact: true }).locator('..').textContent())?.match(/(\d+) supply/)?.[1] ?? '-1');
            expect(scoutSupplyAfter).toBe(scoutSupplyBefore + 1);
            await expect(buyer.page.getByRole('heading', { name: 'Call the Ents or take Mithril?' })).toBeVisible();
            await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} recalls their Scout from Northern Eaves through the Paths of the Dead and ignores 3 Provision`);
          } },
          converged(accepted.value + 1)
        ]);

        const mithrilBefore = await playerValue(seats[0], buyer, 'Mithril');
        gestureNumber += 1;
        await steps.gesture(buyer.page, `take-deep-mithril-${gestureNumber}`, `${buyer.name} takes Deep Fangorn’s four Mithril`, async () => {
          await buyer.page.getByRole('button', { name: 'Gain 4 Mithril' }).click();
          accepted.value += 1;
        }, [
          { spec: 'The ignored cost still resolves the complete destination before queued Battle deployment', check: async () => {
            await expect.poll(() => playerValue(seats[0], buyer, 'Mithril'), { timeout: 2_000 }).toBeGreaterThanOrEqual(mithrilBefore + 4);
            await expect(buyer.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
          } },
          converged(accepted.value + 1)
        ]);

        gestureNumber += 1;
        await steps.gesture(buyer.page, `finish-paths-deployment-${gestureNumber}`, `${buyer.name} leaves Companies in garrison`, async () => {
          await buyer.page.getByRole('button', { name: 'Deploy 0' }).click();
          accepted.value += 1;
        }, [
          { spec: 'The ordered Agent turn closes only after its real Battle deployment gesture', check: async () => await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0) },
          converged(accepted.value + 1)
        ]);
        played = true;
        continue;
      }

      await reveal(actor);
      await finishReveal(actor);
    }

    expect({ mustered, scoutReady, played }).toEqual({ mustered: true, scoutReady: true, played: true });
    await steps.gesture(buyer.page, 'reload-paths-dead', `${buyer.name} reloads the Paths outcome`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the acquired card, Muster, recalled Scout, ignored cost, destination, and authority without diagnostics', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Paths of the Dead`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} recalls their Scout from Northern Eaves through the Paths of the Dead and ignores 3 Provision`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText('ignoring the 3 Provisions cost through the Paths of the Dead');
        await expect(buyer.page.getByTestId('space-deep-fangorn')).toContainText(`Agent · ${buyer.name}`);
        await expect(buyer.page.getByTestId('post-northern-eaves')).not.toContainText('Scout ·');
        await expect(buyer.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Paths of the Dead Scout-for-cost passage',
      'Three isolated humans acquire and Reveal Paths of the Dead, build a real persistent Scout network, prove an ordinary Roads card cannot afford Deep Fangorn while Paths can, commit the final Agent, expose an owner-authorized public recall before any destination effect, return the chosen Scout to finite supply without spending Provisions, resolve Deep Fangorn and queued Battle deployment, and reload the conserved shared outcome.'
    );
  } finally {
    await table.close();
  }
});
