import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Elven Foresight privately orders three exact cards and controls the next draw', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-elven-foresight-1', { phone: 'FORSP', desktop: 'FORSD' });
  const { seats, accepted, converged, currentSeat } = table;
  let mustered = false;
  let played = false;
  let foresightAppearances = 0;
  let gestureNumber = 0;

  const foresight = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Elven Foresight/ }).first();
  const visible = async (locator: Locator) => locator.isVisible().catch(() => false);
  const exactPrefix = (text: string) => new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  const reveal = async (actor: PlotSeat) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals the real remaining hand`, async () => {
      await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'The public Muster row replaces only the acting human’s private hand', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
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

  try {
    const buyer = await currentSeat();
    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 47');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('52 / 54');
    }

    await reveal(buyer);
    const offered = buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Elven Foresight/ }).first();
    await expect(offered).toBeEnabled();
    await steps.gesture(buyer.page, 'acquire-elven-foresight', `${buyer.name} acquires Elven Foresight`, async () => {
      await offered.click(); accepted.value += 1;
    }, [
      { spec: 'The exact physical four-Influence card enters discard and its Row position refills', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Elven Foresight`);
        await expect(buyer.page.getByTestId('chronicle-market')).toContainText('deck 46');
      } },
      converged(accepted.value + 1)
    ]);
    await finishReveal(buyer);

    for (let guard = 0; guard < 120 && !played; guard += 1) {
      const actor = await currentSeat();
      const buyerHasForesight = actor === buyer && await visible(foresight(buyer));
      if (buyerHasForesight) foresightAppearances += 1;
      if (buyerHasForesight && mustered && foresightAppearances >= 3) {
        gestureNumber += 1;
        await steps.gesture(buyer.page, `select-foresight-${gestureNumber}`, `${buyer.name} selects Elven Foresight`, async () => {
          await foresight(buyer).click();
        }, [
          { spec: 'Its final Council icon enables Hall of Fire', check: async () => await expect(buyer.page.getByTestId('space-hall-fire')).toBeEnabled() }
        ]);
        gestureNumber += 1;
        await steps.gesture(buyer.page, `play-foresight-${gestureNumber}`, `${buyer.name} consults Elven Foresight at Hall of Fire`, async () => {
          await buyer.page.getByTestId('space-hall-fire').click(); accepted.value += 1;
        }, [
          { spec: 'The owner receives all six permutations of three exact private cards', check: async () => {
            await expect(buyer.page.getByRole('heading', { name: 'How will Elven Foresight order your deck?' })).toBeVisible();
            await expect(buyer.page.getByRole('button', { name: /^Top →/ })).toHaveCount(6);
          } },
          { spec: 'Observers see six disabled private orders without card identities', check: async () => {
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              await expect(observer.page.getByRole('button', { name: /^Private order/ })).toHaveCount(6);
              await expect(observer.page.getByRole('button', { name: /^Private order/ }).first()).toBeDisabled();
              await expect(observer.page.getByRole('button', { name: /^Top →/ })).toHaveCount(0);
            }
          } },
          converged(accepted.value + 1)
        ]);

        const chosenOrder = buyer.page.getByRole('button', { name: /^Top →/ }).last();
        const chosenOrderText = await chosenOrder.textContent() ?? '';
        const chosenTop = chosenOrderText.split(' → ')[1];
        expect(chosenTop).toBeTruthy();
        gestureNumber += 1;
        await steps.gesture(buyer.page, `order-foresight-${gestureNumber}`, `${buyer.name} returns the seen cards in a private order`, async () => {
          await chosenOrder.click(); accepted.value += 1;
        }, [
          { spec: 'The exact order is persisted privately and ordinary Agent authority advances', check: async () => {
            await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
            await expect(buyer.page.getByTestId('activity-log')).toContainText('returns the cards seen by Elven Foresight');
          } },
          converged(accepted.value + 1)
        ]);

        while (await currentSeat() !== buyer) {
          const next = await currentSeat();
          await reveal(next);
          await finishReveal(next);
        }
        const chosenBefore = await buyer.page.getByTestId('private-hand').getByRole('button', { name: exactPrefix(chosenTop) }).count();
        gestureNumber += 1;
        await steps.gesture(buyer.page, `select-reconnaissance-${gestureNumber}`, `${buyer.name} selects Reconnaissance for the ordered draw`, async () => {
          await buyer.page.getByTestId('private-hand').getByRole('button', { name: /^Reconnaissance/ }).click();
        }, [
          { spec: 'A real Roads icon enables Take Up a War Effort', check: async () => await expect(buyer.page.getByTestId('space-take-war-effort')).toBeEnabled() }
        ]);
        gestureNumber += 1;
        await steps.gesture(buyer.page, `draw-foresight-top-${gestureNumber}`, `${buyer.name} draws the card placed on top by Elven Foresight`, async () => {
          await buyer.page.getByTestId('space-take-war-effort').click(); accepted.value += 1;
        }, [
          { spec: 'The next real board draw is the exact privately chosen top card', check: async () => {
            await expect(buyer.page.getByTestId('private-hand').getByRole('button', { name: exactPrefix(chosenTop) })).toHaveCount(chosenBefore + 1);
            await expect(buyer.page.getByRole('heading', { name: 'Choose an empty post for the Scout.' })).toBeVisible();
          } },
          converged(accepted.value + 1)
        ]);
        gestureNumber += 1;
        await steps.gesture(buyer.page, `place-reconnaissance-scout-${gestureNumber}`, `${buyer.name} completes Reconnaissance by placing a Scout`, async () => {
          await buyer.page.getByTestId('post-old-south-road').click(); accepted.value += 1;
        }, [
          { spec: 'The following Journey effect completes and the Agent turn advances', check: async () => {
            for (const observer of seats) await expect(observer.page.getByTestId('post-old-south-road')).toContainText(`Scout · ${buyer.name}`);
            await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
          } },
          converged(accepted.value + 1)
        ]);
        played = true;
        continue;
      }

      await reveal(actor);
      if (actor === buyer && buyerHasForesight && !mustered) {
        const article = buyer.page.getByTestId('reveal-panel').getByText('Elven Foresight', { exact: true }).locator('..');
        await expect(article).toContainText('3 Influence · 0 swords');
        mustered = true;
      }
      await finishReveal(actor);
    }

    expect({ mustered, played }).toEqual({ mustered: true, played: true });
    await steps.gesture(buyer.page, 'reload-elven-foresight', `${buyer.name} reloads the ordered-draw outcome`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the private ordering result, exact draw, Scout, and advanced authority', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText('returns the cards seen by Elven Foresight');
        await expect(buyer.page.getByTestId('post-old-south-road')).toContainText(`Scout · ${buyer.name}`);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Elven Foresight private deck order',
      'Three isolated humans acquire and Reveal Elven Foresight, later play the same physical card through its Council icon, prove only its owner sees all six exact top-three permutations, choose a top-to-bottom order by click, return to the same round through ordinary turns, draw the chosen top card through a final board destination, complete the following Scout placement, and reload the converged result.'
    );
  } finally {
    await table.close();
  }
});
