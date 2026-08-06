import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Aragorn recruits through The Line Unbroken once each qualifying round', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'aragorn-line-0', { phone: 'LINEP', desktop: 'LINED' });
  const { seats, accepted, converged, currentSeat, row } = table;
  const aragorn = seats.find((seat) => seat.name === 'Mara')!;
  let gestureNumber = 0;

  const value = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await row(observer, player.name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const visibleCount = async (locator: Locator) => locator.count();

  try {
    expect((await currentSeat()).name).toBe('Mara');
    for (let guard = 0; guard < 120 && await value(seats[0], aragorn, 'Dwarven') < 3; guard += 1) {
      const actor = await currentSeat();
      const keepSeek = actor.page.getByRole('button', { name: 'Keep Seek Allies' });
      const finish = actor.page.getByRole('button', { name: 'Finish Reveal' });

      if (await visibleCount(keepSeek)) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `keep-seek-${gestureNumber}`, `${actor.name} keeps Seek Allies`, async () => {
          await keepSeek.click(); accepted.value += 1;
        }, [
          { spec: 'The ordered Journey choice closes before authority advances', check: async () => await expect(keepSeek).toHaveCount(0) },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      if (await visibleCount(finish)) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `finish-${gestureNumber}`, `${actor.name} finishes Reveal`, async () => {
          await finish.click(); accepted.value += 1;
        }, [
          { spec: 'The public Muster row closes and canonical authority advances', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0) },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      const factionCards = actor.page.getByTestId('private-hand').getByRole('button', { name: /^(Diplomatic Mission|Seek Allies)/ });
      const caravansOpen = await actor.page.getByTestId('space-dwarven-caravans').getByText(/Agent ·/).count() === 0;
      if (actor === aragorn && caravansOpen && await factionCards.count() > 0) {
        const standingBefore = await value(seats[0], aragorn, 'Dwarven');
        const garrisonBefore = await value(seats[0], aragorn, 'Garrison');
        gestureNumber += 1;
        await steps.gesture(actor.page, `select-faction-${gestureNumber}`, `${actor.name} selects a Dwarven faction card`, async () => {
          await factionCards.first().click();
        }, [
          { spec: 'The selected physical card enables Dwarven Caravans', check: async () => await expect(actor.page.getByTestId('space-dwarven-caravans')).toBeEnabled() }
        ]);

        gestureNumber += 1;
        await steps.gesture(actor.page, `gain-standing-${gestureNumber}`, `${actor.name} gains Dwarven standing ${standingBefore + 1}`, async () => {
          await actor.page.getByTestId('space-dwarven-caravans').click(); accepted.value += 1;
        }, [
          { spec: 'Every human sees exactly one additional Dwarven standing and Provision', check: async () => {
            for (const observer of seats) await expect(row(observer, aragorn.name).getByText('Dwarven', { exact: true }).locator('..')).toContainText(String(standingBefore + 1));
          } },
          { spec: standingBefore < 2 ? 'The Line Unbroken does not trigger below two prior standing' : 'The first qualifying standing gain this round recruits exactly one finite Company', check: async () => {
            for (const observer of seats) {
              await expect(row(observer, aragorn.name).getByText('Garrison', { exact: true }).locator('..')).toContainText(String(garrisonBefore + (standingBefore >= 2 ? 1 : 0)));
              if (standingBefore >= 2) await expect(observer.page.getByTestId('activity-log')).toContainText("Aragorn's Line Unbroken recruits 1 Company.");
            }
          } },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      gestureNumber += 1;
      await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals the remaining hand`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'Only the acting human’s cards enter the public Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
        converged(accepted.value + 1)
      ]);
    }

    expect(await value(seats[0], aragorn, 'Dwarven')).toBe(3);
    await steps.gesture(aragorn.page, 'reload-line-unbroken', 'Mara reloads The Line Unbroken result', async () => {
      await reloadGameClient(aragorn.page);
    }, [
      { spec: 'Replay preserves standing three, the recruited Company, and the once-per-round marker’s public consequence', check: async () => {
        await expect(row(aragorn, aragorn.name).getByText('Dwarven', { exact: true }).locator('..')).toContainText('3');
        await expect(row(aragorn, aragorn.name).getByText('Garrison', { exact: true }).locator('..')).toContainText('4');
        await expect(aragorn.page.getByTestId('activity-log')).toContainText("Aragorn's Line Unbroken recruits 1 Company.");
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Aragorn — The Line Unbroken',
      'Three isolated humans play ordinary rounds on the production board. Aragorn repeatedly courts the Dwarven Holds, receives no Company below two prior standing, then recruits exactly one finite Company when a later round raises an already respected faction.'
    );
  } finally {
    await table.close();
  }
});
