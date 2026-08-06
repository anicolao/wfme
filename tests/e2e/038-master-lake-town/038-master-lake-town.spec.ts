import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

test('Master of Lake-town gains Gold and later buys one private Fate during Reveal', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'master-e2e-6', { phone: 'MASTP', desktop: 'MASTD' });
  const { seats, accepted, converged, currentSeat } = table;
  let gestureNumber = 0;
  let journeyPlayed = false;
  let musterPaid = false;

  const playerValue = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await observer.page.locator('aside.players article').filter({ hasText: player.name }).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const master = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Master of Lake-town/ }).first();
  const reveal = async (actor: PlotSeat, extra: Verification[] = []) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals the real remaining hand`, async () => {
      await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'The public Muster row replaces only the acting human’s private hand', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
      ...extra,
      converged(accepted.value + 1)
    ]);
  };
  const finishReveal = async (actor: PlotSeat) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `finish-${gestureNumber}`, `${actor.name} finishes Reveal`, async () => {
      await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
    }, [
      { spec: 'The Muster row closes and canonical authority advances', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0) },
      converged(accepted.value + 1)
    ]);
  };
  const chooseCard = async (actor: PlotSeat, name: RegExp, id: string, description: string, destinationId: string) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `${id}-${gestureNumber}`, description, async () => {
      await actor.page.getByTestId('private-hand').getByRole('button', { name }).first().click();
    }, [
      { spec: 'The selected card’s final printed icon enables the intended destination', check: async () => await expect(actor.page.getByTestId(destinationId)).toBeEnabled() }
    ]);
  };
  const placeAgent = async (actor: PlotSeat, destinationId: string, id: string, description: string, extra: Verification[] = []) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `${id}-${gestureNumber}`, description, async () => {
      await actor.page.getByTestId(destinationId).click(); accepted.value += 1;
    }, [...extra, converged(accepted.value + 1)]);
  };

  try {
    const buyer = await currentSeat();
    await chooseCard(buyer, /^Armed Escort/, 'select-hall-escort', `${buyer.name} selects Armed Escort`, 'space-hall-fire');
    await placeAgent(buyer, 'space-hall-fire', 'take-hall-fire', `${buyer.name} takes a seat in the Hall of Fire`, [
      { spec: 'The real Council destination provides its private Fate and Reveal bonus', check: async () => await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} sends an Agent to Hall of Fire`) }
    ]);

    for (let index = 0; index < 2; index += 1) {
      const other = await currentSeat();
      await reveal(other);
      await finishReveal(other);
    }

    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 49');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('54 / 54');
    }
    await reveal(buyer);
    const offered = buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Master of Lake-town/ }).first();
    await expect(offered).toBeEnabled();
    gestureNumber += 1;
    await steps.gesture(buyer.page, `acquire-master-${gestureNumber}`, `${buyer.name} acquires Master of Lake-town`, async () => {
      await offered.click(); accepted.value += 1;
    }, [
      { spec: 'The exact five-Influence physical card enters discard and its Row position refills', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Master of Lake-town`);
        await expect(buyer.page.getByTestId('chronicle-market')).toContainText('deck 48');
      } },
      converged(accepted.value + 1)
    ]);
    await finishReveal(buyer);

    for (let guard = 0; guard < 160 && !musterPaid; guard += 1) {
      const actor = await currentSeat();
      const buyerHasMaster = actor === buyer && await master(buyer).count() > 0 && await master(buyer).isVisible();
      if (buyerHasMaster && !journeyPlayed) {
        const goldBefore = await playerValue(seats[0], buyer, 'Gold');
        await chooseCard(buyer, /^Master of Lake-town/, 'select-master', `${buyer.name} selects Master of Lake-town`, 'space-muster-free-peoples');
        await placeAgent(buyer, 'space-muster-free-peoples', 'play-master', `${buyer.name} sends the Master to Muster of the Free Peoples`, [
          { spec: 'The Journey grants exactly three Gold before the destination choice resolves', check: async () => {
            for (const observer of seats) {
              await expect.poll(() => playerValue(observer, buyer, 'Gold'), { timeout: 2_000 }).toBe(goldBefore + 3);
              await expect(observer.page.getByRole('heading', { name: 'Pay 2 Gold to gain 1 Provision?' })).toBeVisible();
            }
          } },
          { spec: 'Only the acting owner can resolve the ordered Council choice', check: async () => {
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              await expect(observer.page.getByRole('button', { name: 'Keep the Gold' })).toBeDisabled();
            }
          } }
        ]);
        gestureNumber += 1;
        await steps.gesture(buyer.page, `decline-council-${gestureNumber}`, `${buyer.name} keeps the Master’s Gold`, async () => {
          await buyer.page.getByRole('button', { name: 'Keep the Gold' }).click(); accepted.value += 1;
        }, [
          { spec: 'The destination closes without spending any of the three Journey Gold', check: async () => {
            await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
            await expect.poll(() => playerValue(seats[0], buyer, 'Gold'), { timeout: 2_000 }).toBe(goldBefore + 3);
          } },
          converged(accepted.value + 1)
        ]);
        journeyPlayed = true;
        continue;
      }
      if (buyerHasMaster && journeyPlayed) {
        const goldBefore = await playerValue(seats[0], buyer, 'Gold');
        const fateBefore = await playerValue(seats[0], buyer, 'Fate');
        await reveal(buyer, [
          { spec: 'Master of Lake-town contributes exactly three Influence and opens its optional Fate payment', check: async () => {
            const article = buyer.page.getByTestId('reveal-panel').getByText('Master of Lake-town', { exact: true }).locator('..');
            await expect(article).toContainText('3 Influence · you may pay 2 Gold to draw 1 Fate');
            await expect(buyer.page.getByRole('heading', { name: 'Pay the Master for a Fate card?' })).toBeVisible();
            await expect(buyer.page.getByRole('button', { name: 'Pay 2 Gold · draw 1 Fate' })).toBeEnabled();
          } },
          { spec: 'Observers see the ordered choice but cannot spend another player’s Gold', check: async () => {
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              await expect(observer.page.getByRole('button', { name: 'Pay 2 Gold · draw 1 Fate' })).toBeDisabled();
            }
          } }
        ]);
        gestureNumber += 1;
        await steps.gesture(buyer.page, `pay-master-fate-${gestureNumber}`, `${buyer.name} pays the Master for one Fate card`, async () => {
          await buyer.page.getByRole('button', { name: 'Pay 2 Gold · draw 1 Fate' }).click(); accepted.value += 1;
        }, [
          { spec: 'Exactly two Gold are spent and one private physical Fate card is drawn', check: async () => {
            for (const observer of seats) {
              await expect.poll(() => playerValue(observer, buyer, 'Gold'), { timeout: 2_000 }).toBe(goldBefore - 2);
              await expect.poll(() => playerValue(observer, buyer, 'Fate'), { timeout: 2_000 }).toBe(fateBefore + 1);
            }
            await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
            await expect(buyer.page.getByTestId('reveal-panel')).toBeVisible();
          } },
          converged(accepted.value + 1)
        ]);
        musterPaid = true;
        await finishReveal(buyer);
        continue;
      }

      await reveal(actor);
      await finishReveal(actor);
    }

    expect({ journeyPlayed, musterPaid }).toEqual({ journeyPlayed: true, musterPaid: true });
    await steps.gesture(buyer.page, 'reload-master-lake-town', `${buyer.name} reloads the Master’s completed economy`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the acquisition, three-Gold Journey, two-Gold payment, private Fate draw, and authority', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Master of Lake-town`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} sends an Agent to Muster the Free Peoples`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} pays 2 Gold and privately draws 1 Fate with Master of Lake-town`);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Master of Lake-town Gold and Fate economy',
      'Three isolated humans acquire Master of Lake-town from the public market, draw and play that exact card through its Council icon for three Gold, cycle it through the real deck, later Reveal it for three Influence, prove only its owner can spend two Gold for one private physical Fate card, and reload the deterministic shared result.'
    );
  } finally {
    await table.close();
  }
});
