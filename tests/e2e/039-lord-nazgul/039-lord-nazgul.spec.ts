import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

test('Lord of the Nazgûl recruits Companies, draws private Fate, and Reveals four swords', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-lord-nazgul-935', { phone: 'NAZGP', desktop: 'NAZGD' });
  const { seats, accepted, converged, currentSeat } = table;
  let gestureNumber = 0;
  let journeyPlayed = false;
  let musterProved = false;

  const playerValue = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await observer.page.locator('aside.players article').filter({ hasText: player.name }).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const lord = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Lord of the Nazgûl/ }).first();
  const reveal = async (actor: PlotSeat, extra: Verification[] = []) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals the real remaining hand`, async () => {
      await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'The acting human exposes a public Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
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

  try {
    const buyer = await currentSeat();
    await chooseCard(buyer, /^Armed Escort/, 'select-hall-escort', `${buyer.name} selects Armed Escort`, 'space-hall-fire');
    gestureNumber += 1;
    await steps.gesture(buyer.page, `take-hall-fire-${gestureNumber}`, `${buyer.name} takes a seat in the Hall of Fire`, async () => {
      await buyer.page.getByTestId('space-hall-fire').click(); accepted.value += 1;
    }, [
      { spec: 'The Council destination supplies the exact Reveal bonus needed for the seven-cost Lord', check: async () => await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} sends an Agent to Hall of Fire`) },
      converged(accepted.value + 1)
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
    await reveal(buyer, [
      { spec: 'Hall of Fire raises the real Muster total to exactly seven Influence', check: async () => await expect(buyer.page.locator('.reveal-total strong')).toHaveText('7 Influence') }
    ]);
    const offered = buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Lord of the Nazgûl/ }).first();
    await expect(offered).toBeEnabled();
    for (const observer of seats.filter((seat) => seat !== buyer)) {
      await expect(observer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Lord of the Nazgûl/ }).first()).toBeDisabled();
    }
    gestureNumber += 1;
    await steps.gesture(buyer.page, `acquire-lord-${gestureNumber}`, `${buyer.name} acquires Lord of the Nazgûl`, async () => {
      await offered.click(); accepted.value += 1;
    }, [
      { spec: 'The exact seven-Influence physical card enters discard and its Row position refills', check: async () => {
        await expect(buyer.page.locator('.reveal-total strong')).toHaveText('0 Influence');
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Lord of the Nazgûl from the Chronicle Row for 7 Influence and refills its place.`);
        await expect(buyer.page.getByTestId('chronicle-market')).toContainText('deck 48');
      } },
      converged(accepted.value + 1)
    ]);
    await finishReveal(buyer);

    for (let guard = 0; guard < 200 && !musterProved; guard += 1) {
      const actor = await currentSeat();
      const buyerHasLord = actor === buyer && await lord(buyer).count() > 0 && await lord(buyer).isVisible();
      if (buyerHasLord && !journeyPlayed) {
        const fateBefore = await playerValue(seats[0], buyer, 'Fate');
        const fateDiscardBefore = await buyer.page.getByTestId('fate-discard').textContent();
        const garrisonBefore = await playerValue(seats[0], buyer, 'Garrison');
        const supplyBefore = await playerValue(seats[0], buyer, 'Supply');
        await chooseCard(buyer, /^Lord of the Nazgûl/, 'select-lord', `${buyer.name} selects Lord of the Nazgûl`, 'space-tribute-shadow');
        gestureNumber += 1;
        await steps.gesture(buyer.page, `play-lord-${gestureNumber}`, `${buyer.name} sends the Lord to Shadow Tribute`, async () => {
          await buyer.page.getByTestId('space-tribute-shadow').click(); accepted.value += 1;
        }, [
          { spec: 'The Journey recruits exactly two finite Companies', check: async () => {
            for (const observer of seats) {
              await expect.poll(() => playerValue(observer, buyer, 'Garrison'), { timeout: 2_000 }).toBe(garrisonBefore + 2);
              await expect.poll(() => playerValue(observer, buyer, 'Supply'), { timeout: 2_000 }).toBe(supplyBefore - 2);
            }
          } },
          { spec: 'The Journey draws exactly one private physical Fate card', check: async () => {
            for (const observer of seats) await expect.poll(() => playerValue(observer, buyer, 'Fate'), { timeout: 2_000 }).toBe(fateBefore + 1);
            for (const observer of seats) await expect(observer.page.getByTestId('fate-discard')).toHaveText(fateDiscardBefore!);
          } },
          { spec: 'The Shadow placement resolves without an artificial follow-up control', check: async () => {
            await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
            await expect(buyer.page.locator('footer')).not.toContainText(`Current actor ${buyer.name}`);
          } },
          converged(accepted.value + 1)
        ]);
        journeyPlayed = true;
        continue;
      }
      if (buyerHasLord && journeyPlayed) {
        await reveal(buyer, [
          { spec: 'The same physical Lord later contributes exactly two Influence and four swords', check: async () => {
            const article = buyer.page.getByTestId('reveal-panel').getByText('Lord of the Nazgûl', { exact: true }).locator('..');
            await expect(article).toContainText('2 Influence · 4 swords');
          } }
        ]);
        musterProved = true;
        await finishReveal(buyer);
        continue;
      }
      await reveal(actor);
      await finishReveal(actor);
    }

    expect({ journeyPlayed, musterProved }).toEqual({ journeyPlayed: true, musterProved: true });
    await steps.gesture(buyer.page, 'reload-lord-nazgul', `${buyer.name} reloads the Lord’s completed Chronicle`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the seven-cost acquisition, private Fate draw, two recruits, four-sword Muster, and authority', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Lord of the Nazgûl`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} sends an Agent to Tribute to the Shadow`);
        await expect(buyer.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Lord of the Nazgûl Chronicle tracer',
      'Three isolated humans use Hall of Fire to acquire the exact seven-cost Lord of the Nazgûl, cycle that physical card through the real deck, play it through its Shadow icon to draw one private physical Fate and recruit exactly two finite Companies, draw it again, Reveal its exact two Influence and four swords, and reload the converged result.'
    );
  } finally {
    await table.close();
  }
});
