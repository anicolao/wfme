import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

test('Khazad Guard musters and deploys a third veteran Company at Battle', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-khazad-e2e-1', { phone: 'KHAZP', desktop: 'KHAZD' });
  const { seats, accepted, converged, currentSeat, row } = table;
  let mustered = false;
  let played = false;
  let gestureNumber = 0;

  const count = async (observer: PlotSeat, name: string, label: string) => Number(
    (await row(observer, name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const khazad = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Khazad Guard/ }).first();
  const visible = async (locator: Locator) => locator.isVisible().catch(() => false);
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

  try {
    const buyer = await currentSeat();
    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 39');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('44 / 54');
    }

    await reveal(buyer);
    const offered = buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Khazad Guard/ }).first();
    await expect(offered).toBeEnabled();
    await steps.gesture(buyer.page, 'acquire-khazad-guard', `${buyer.name} acquires Khazad Guard`, async () => {
      await offered.click(); accepted.value += 1;
    }, [
      { spec: 'The exact physical four-Influence card enters discard and its Row position refills', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Khazad Guard`);
        await expect(buyer.page.getByTestId('chronicle-market')).toContainText('deck 38');
      } },
      converged(accepted.value + 1)
    ]);
    await finishReveal(buyer);

    for (let guard = 0; guard < 120 && !played; guard += 1) {
      const actor = await currentSeat();
      const buyerHasKhazad = actor === buyer && await visible(khazad(buyer));
      if (buyerHasKhazad && !mustered) {
        await reveal(buyer, [{
          spec: 'Khazad Guard contributes its final 1 Influence and 2 swords Muster box',
          check: async () => {
            const article = buyer.page.getByTestId('reveal-panel').getByText('Khazad Guard', { exact: true }).locator('..');
            await expect(article).toContainText('1 Influence · 2 swords');
          }
        }]);
        mustered = true;
        await finishReveal(buyer);
        continue;
      }
      if (buyerHasKhazad && mustered) {
        gestureNumber += 1;
        await steps.gesture(buyer.page, `select-khazad-${gestureNumber}`, `${buyer.name} selects Khazad Guard`, async () => {
          await khazad(buyer).click();
        }, [
          { spec: 'Its final Stronghold icon enables the Battle space at Minas Tirith', check: async () => await expect(buyer.page.getByTestId('space-minas-tirith')).toBeEnabled() }
        ]);

        const mithrilBefore = await count(buyer, buyer.name, 'Mithril');
        const garrisonBefore = await count(buyer, buyer.name, 'Garrison');
        expect(garrisonBefore).toBe(3);
        gestureNumber += 1;
        await steps.gesture(buyer.page, `play-khazad-${gestureNumber}`, `${buyer.name} sends Khazad Guard to Minas Tirith`, async () => {
          await buyer.page.getByTestId('space-minas-tirith').click(); accepted.value += 1;
        }, [
          { spec: 'The Journey gains exactly 1 Mithril and Minas Tirith recruits one finite Company', check: async () => {
            await expect(row(buyer, buyer.name).getByText('Mithril', { exact: true }).locator('..')).toContainText(String(mithrilBefore + 1));
            await expect(row(buyer, buyer.name).getByText('Garrison', { exact: true }).locator('..')).toContainText('4');
          } },
          { spec: 'The final Khazad rule explicitly permits three veteran Companies plus the fresh recruit', check: async () => {
            await expect(buyer.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
            await expect(buyer.page.getByTestId('pending-choice')).toContainText('up to 3 existing garrison Companies with the Khazad Guard bonus; 4 are currently eligible');
            await expect(buyer.page.getByRole('button', { name: 'Deploy 4' })).toBeEnabled();
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              await expect(observer.page.getByRole('button', { name: 'Deploy 4' })).toBeDisabled();
            }
          } },
          converged(accepted.value + 1)
        ]);

        gestureNumber += 1;
        await steps.gesture(buyer.page, `deploy-khazad-${gestureNumber}`, `${buyer.name} deploys all four eligible Companies`, async () => {
          await buyer.page.getByRole('button', { name: 'Deploy 4' }).click(); accepted.value += 1;
        }, [
          { spec: 'Four Companies enter the Battle, the garrison is conserved at zero, and the turn advances', check: async () => {
            await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
            await expect(buyer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: buyer.name })).toContainText('4 Companies');
            await expect(row(buyer, buyer.name).getByText('Garrison', { exact: true }).locator('..')).toContainText('0');
          } },
          converged(accepted.value + 1)
        ]);
        played = true;
        continue;
      }

      await reveal(actor);
      await finishReveal(actor);
    }

    expect({ mustered, played }).toEqual({ mustered: true, played: true });
    await steps.gesture(buyer.page, 'reload-khazad-guard', `${buyer.name} reloads the Khazad deployment outcome`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the exact Journey resource, four Battle Companies, empty garrison, destination, and authority', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} deploys 4 Companies`);
        await expect(buyer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: buyer.name })).toContainText('4 Companies');
        await expect(row(buyer, buyer.name).getByText('Mithril', { exact: true }).locator('..')).toContainText('1');
        await expect(row(buyer, buyer.name).getByText('Garrison', { exact: true }).locator('..')).toContainText('0');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Khazad Guard veteran deployment',
      'Three isolated humans acquire and Reveal Khazad Guard, later draw and play the same physical card through its Stronghold icon at the active Battle space, gain its Mithril, recruit through Minas Tirith, prove only its owner can use the final exception to deploy three veteran Companies plus the fresh recruit, and reload the conserved shared result.'
    );
  } finally {
    await table.close();
  }
});
