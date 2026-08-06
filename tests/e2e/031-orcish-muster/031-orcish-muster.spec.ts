import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Orcish Muster is acquired, Revealed, and played with its standing price', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-orcish-muster-58', { phone: 'ORCMP', desktop: 'ORCMD' });
  const { seats, accepted, converged, currentSeat, row } = table;
  let acquired = false;
  let mustered = false;
  let played = false;
  let gestureNumber = 0;

  const count = async (observer: PlotSeat, name: string, label: string) => Number(
    (await row(observer, name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const orcish = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Orcish Muster/ }).first();
  const visible = async (locator: Locator) => locator.isVisible().catch(() => false);
  const firstEnabled = async (locator: Locator) => {
    for (let index = 0; index < await locator.count(); index += 1) {
      const candidate = locator.nth(index);
      if (await candidate.isEnabled()) return candidate;
    }
    return null;
  };
  const cheapestEnabled = async (locator: Locator) => {
    const candidates: Array<{ locator: Locator; cost: number }> = [];
    for (let index = 0; index < await locator.count(); index += 1) {
      const candidate = locator.nth(index);
      if (!await candidate.isEnabled()) continue;
      const text = await candidate.textContent() ?? '';
      candidates.push({ locator: candidate, cost: Number(text.match(/· (\d+) Influence/)?.[1] ?? '99') });
    }
    return candidates.sort((left, right) => left.cost - right.cost)[0]?.locator ?? null;
  };
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
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 39');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('44 / 54');
    }

    for (let guard = 0; guard < 140 && !played; guard += 1) {
      const actor = await currentSeat();
      const buyerHasOrcish = actor === buyer && await visible(orcish(buyer));

      if (buyerHasOrcish && mustered) {
        gestureNumber += 1;
        await steps.gesture(buyer.page, `select-${gestureNumber}`, `${buyer.name} selects Orcish Muster`, async () => {
          await orcish(buyer).click();
        }, [
          { spec: 'Its final Shadow icon enables Tribute to the Shadow', check: async () => await expect(buyer.page.getByTestId('space-tribute-shadow')).toBeEnabled() }
        ]);

        const garrisonBefore = await count(buyer, buyer.name, 'Garrison');
        const supplyBefore = await count(buyer, buyer.name, 'Supply');
        const shadowBefore = await count(buyer, buyer.name, 'Shadow');
        gestureNumber += 1;
        await steps.gesture(buyer.page, `place-${gestureNumber}`, `${buyer.name} plays Orcish Muster at Tribute to the Shadow`, async () => {
          await buyer.page.getByTestId('space-tribute-shadow').click(); accepted.value += 1;
        }, [
          { spec: 'Two finite Companies recruit and the destination resolves before the mandatory standing loss', check: async () => {
            await expect(buyer.page.getByRole('heading', { name: 'Which faction loses standing?' })).toBeVisible();
            await expect(row(buyer, buyer.name).getByText('Garrison', { exact: true }).locator('..')).toContainText(String(garrisonBefore + Math.min(2, supplyBefore)));
            await expect(buyer.page.getByRole('button', { name: 'Lose 1 shadow standing' })).toBeEnabled();
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              await expect(observer.page.getByRole('button', { name: 'Lose 1 shadow standing' })).toBeDisabled();
            }
          } },
          converged(accepted.value + 1)
        ]);

        gestureNumber += 1;
        await steps.gesture(buyer.page, `lose-standing-${gestureNumber}`, `${buyer.name} pays Orcish Muster's standing price`, async () => {
          await buyer.page.getByRole('button', { name: 'Lose 1 shadow standing' }).click(); accepted.value += 1;
        }, [
          { spec: 'Exactly the standing gained at Tribute is lost and the Agent turn advances', check: async () => {
            await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
            await expect(row(buyer, buyer.name).getByText('Shadow', { exact: true }).locator('..')).toContainText(String(shadowBefore));
          } },
          converged(accepted.value + 1)
        ]);
        played = true;
        continue;
      }

      await reveal(actor);
      if (actor === buyer && buyerHasOrcish && !mustered) {
        const article = buyer.page.getByTestId('reveal-panel').getByText('Orcish Muster', { exact: true }).locator('..');
        await expect(article).toContainText('0 Influence · 2 swords');
        mustered = true;
      }

      if (actor === buyer && !acquired) {
        for (let purchase = 0; purchase < 14 && !acquired; purchase += 1) {
          const target = await firstEnabled(buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Orcish Muster/ }));
          const card = target ?? await cheapestEnabled(buyer.page.getByTestId('chronicle-row').getByRole('button'));
          if (!card) break;
          const name = (await card.textContent())?.split(' · ')[0].trim() ?? 'Chronicle card';
          gestureNumber += 1;
          await steps.gesture(buyer.page, `acquire-${gestureNumber}`, `${buyer.name} acquires ${name}`, async () => {
            await card.click(); accepted.value += 1;
            if (target) acquired = true;
          }, [
            { spec: target ? 'The exact physical Orcish Muster enters discard and its Row position refills' : 'An affordable card cycles the public market toward Orcish Muster', check: async () => await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires ${name}`) },
            converged(accepted.value + 1)
          ]);
        }
      }
      await finishReveal(actor);
    }

    expect({ acquired, mustered, played }).toEqual({ acquired: true, mustered: true, played: true });
    await steps.gesture(buyer.page, 'reload-orcish-muster', `${buyer.name} reloads the Orcish Muster outcome`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the recruitment, standing loss, destination, and turn authority', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} loses 1 shadow standing to complete Orcish Muster`);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Orcish Muster standing price',
      'Three isolated humans acquire Orcish Muster from the public Chronicle Row, later Reveal its exact two-sword Muster box, cycle through a genuine reshuffle, draw and play the same physical card through its Shadow icon, recruit two finite Companies, prove only the owner can choose a positive faction, lose one standing, and reload the shared result.'
    );
  } finally {
    await table.close();
  }
});
