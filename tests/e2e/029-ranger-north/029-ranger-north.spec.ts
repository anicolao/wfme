import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Ranger of the North is acquired, drawn, and completes its mandatory private discard', async ({ browser, page }, testInfo) => {
  test.setTimeout(600_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-ranger-north-11', { phone: 'RANGP', desktop: 'RANGD' });
  const { seats, accepted, converged, currentSeat, row } = table;
  let acquired = false;
  let played = false;
  let gestureNumber = 0;

  const count = async (observer: PlotSeat, name: string, label: string) => Number(
    (await row(observer, name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const ranger = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Ranger of the North/ }).first();
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
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 45');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('50 / 54');
    }

    for (let guard = 0; guard < 60 && !played; guard += 1) {
      const actor = await currentSeat();
      if (actor === buyer && await ranger(buyer).isVisible().catch(() => false)) {
        gestureNumber += 1;
        await steps.gesture(buyer.page, `select-${gestureNumber}`, `${buyer.name} selects Ranger of the North`, async () => {
          await ranger(buyer).click();
        }, [
          { spec: 'The printed Roads icon enables the final Take Up a War Effort destination', check: async () => await expect(buyer.page.getByTestId('space-take-war-effort')).toBeEnabled() }
        ]);

        const discardBefore = await count(buyer, buyer.name, 'Discard');
        gestureNumber += 1;
        await steps.gesture(buyer.page, `place-${gestureNumber}`, `${buyer.name} plays Ranger of the North`, async () => {
          await buyer.page.getByTestId('space-take-war-effort').click(); accepted.value += 1;
        }, [
          { spec: 'Both private draws finish before the mandatory Ranger discard blocks turn advancement', check: async () => {
            await expect(buyer.page.getByRole('heading', { name: 'Which card will the Ranger discard?' })).toBeVisible();
            await expect(buyer.page.getByRole('button', { name: /^Discard (?!private card)/ }).first()).toBeEnabled();
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              const privateOptions = observer.page.getByTestId('pending-choice').getByRole('button', { name: 'Discard private card' });
              await expect(privateOptions.first()).toBeDisabled();
              await expect(observer.page.getByTestId('pending-choice')).not.toContainText('Rallying Words');
            }
          } },
          converged(accepted.value + 1)
        ]);

        const discardButton = buyer.page.getByRole('button', { name: /^Discard (?!private card)/ }).first();
        const discardedName = (await discardButton.textContent())!.replace(/^Discard /, '').trim();
        gestureNumber += 1;
        await steps.gesture(buyer.page, `discard-${gestureNumber}`, `${buyer.name} discards ${discardedName} for Ranger of the North`, async () => {
          await discardButton.click(); accepted.value += 1;
        }, [
          { spec: 'Exactly one eligible private hand card enters discard and canonical authority advances', check: async () => {
            await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
            expect(await count(buyer, buyer.name, 'Discard')).toBe(discardBefore + 1);
          } },
          converged(accepted.value + 1)
        ]);
        played = true;
        continue;
      }

      await reveal(actor);
      if (actor === buyer && !acquired) {
        const card = buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Ranger of the North/ }).first();
        await expect(card).toBeEnabled();
        const deckBefore = Number((await buyer.page.getByTestId('chronicle-market').textContent())?.match(/deck (\d+)/)?.[1] ?? '-1');
        gestureNumber += 1;
        await steps.gesture(buyer.page, `acquire-${gestureNumber}`, `${buyer.name} acquires Ranger of the North`, async () => {
          await card.click(); accepted.value += 1; acquired = true;
        }, [
          { spec: 'The exact physical Ranger enters discard and its public Row position refills', check: async () => {
            await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Ranger of the North`);
            await expect(buyer.page.getByTestId('chronicle-market')).toContainText(`deck ${deckBefore - 1}`);
          } },
          converged(accepted.value + 1)
        ]);
      }
      await finishReveal(actor);
    }

    expect(acquired).toBe(true);
    expect(played).toBe(true);
    await steps.gesture(buyer.page, 'reload-ranger', `${buyer.name} reloads the Ranger outcome`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the destination and private discard without publishing its identity', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} discards one private card to complete Ranger of the North`);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Ranger of the North private discard',
      'Three isolated humans acquire Ranger of the North from the public Chronicle Row, later draw and play the exact card through its printed Roads icon, prove only the owner sees and can use the mandatory discard controls, discard one eligible physical hand card, and reload the deterministic shared outcome.'
    );
  } finally {
    await table.close();
  }
});
