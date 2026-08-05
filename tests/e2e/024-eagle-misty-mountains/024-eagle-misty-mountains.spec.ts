import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Eagle of the Misty Mountains is acquired, drawn, and played at a Battle', async ({ browser, page }, testInfo) => {
  test.setTimeout(450_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'catalog-proof-1', { phone: 'EAGLP', desktop: 'EAGLD' });
  const { seats, accepted, converged, currentSeat, row } = table;
  let gestureNumber = 0;

  const count = async (observer: PlotSeat, name: string, label: string) => Number(
    (await row(observer, name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );

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
    await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals while the Eagle travels through the deck`, async () => {
      await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'The acting human exposes a real Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
      converged(accepted.value + 1)
    ]);
  };
  const finishReveal = async (actor: PlotSeat) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `finish-${gestureNumber}`, `${actor.name} finishes Reveal`, async () => {
      await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
    }, [
      { spec: 'The public Muster row closes and ordinary authority advances', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0) },
      converged(accepted.value + 1)
    ]);
  };

  try {
    const buyer = await currentSeat();
    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-row').getByRole('button')).toHaveCount(5);
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 33');
    }

    let eagle: Locator | null = null;
    for (let guard = 0; guard < 90 && !eagle; guard += 1) {
      const actor = await currentSeat();
      await reveal(actor);
      if (actor === buyer) {
        for (let purchase = 0; purchase < 6 && !eagle; purchase += 1) {
          eagle = await firstEnabled(buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Eagle of the Misty Mountains/ }));
          if (eagle) break;
          const card = await cheapestEnabled(buyer.page.getByTestId('chronicle-row').getByRole('button'));
          if (!card) break;
          const name = (await card.textContent())?.split(' · ')[0].trim() ?? 'Chronicle card';
          gestureNumber += 1;
          await steps.gesture(buyer.page, `cycle-market-${gestureNumber}`, `${buyer.name} acquires ${name} to cycle the physical market`, async () => {
            await card.click(); accepted.value += 1;
          }, [
            { spec: 'The legal purchase refills the same public Row position', check: async () => await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires ${name}`) },
            converged(accepted.value + 1)
          ]);
        }
      }
      if (!eagle) await finishReveal(actor);
    }
    expect(eagle).not.toBeNull();

    const influenceBefore = Number((await buyer.page.locator('.reveal-total strong').textContent())?.match(/(\d+) Influence/)?.[1] ?? '-1');
    expect(influenceBefore).toBeGreaterThanOrEqual(5);
    const deckBefore = Number((await buyer.page.getByTestId('chronicle-market').textContent())?.match(/deck (\d+)/)?.[1] ?? '-1');
    const rowBefore = await buyer.page.getByTestId('chronicle-row').getByRole('button').count();
    const discardBefore = await count(buyer, buyer.name, 'Discard');
    for (const observer of seats.filter((seat) => seat !== buyer)) {
      await expect(observer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Eagle of the Misty Mountains/ }).first()).toBeDisabled();
    }

    await steps.gesture(buyer.page, 'buy-eagle', `${buyer.name} buys Eagle of the Misty Mountains`, async () => {
      await eagle!.click(); accepted.value += 1;
    }, [
      { spec: 'The five-cost physical card enters discard and consumes exactly five Influence', check: async () => {
        await expect(row(buyer, buyer.name).getByText('Discard', { exact: true }).locator('..')).toContainText(String(discardBefore + 1));
        await expect(buyer.page.locator('.reveal-total strong')).toHaveText(`${influenceBefore - 5} Influence`);
      } },
      { spec: 'Every browser sees the immediate positional refill and exact physical deck decrement', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('chronicle-row').getByRole('button')).toHaveCount(deckBefore > 0 ? rowBefore : rowBefore - 1);
          await expect(observer.page.getByTestId('chronicle-market')).toContainText(`deck ${Math.max(0, deckBefore - 1)}`);
          await expect(observer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Eagle of the Misty Mountains from the Chronicle Row for 5 Influence and refills its place.`);
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(buyer.page, 'reload-eagle-market', `${buyer.name} reloads the acquired Eagle`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the spent Influence, acquired discard, and exact refill', check: async () => {
        await expect(buyer.page.locator('.reveal-total strong')).toHaveText(`${influenceBefore - 5} Influence`);
        await expect(row(buyer, buyer.name).getByText('Discard', { exact: true }).locator('..')).toContainText(String(discardBefore + 1));
        await expect(buyer.page.getByTestId('chronicle-market')).toContainText(`deck ${Math.max(0, deckBefore - 1)}`);
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(buyer.page, 'finish-eagle-purchase', `${buyer.name} finishes the Eagle purchase`, async () => {
      await buyer.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
    }, [
      { spec: 'The acquired card joins the discarded Muster hand before Recall', check: async () => {
        await expect(buyer.page.getByTestId('reveal-panel')).toHaveCount(0);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Eagle of the Misty Mountains`);
      } },
      converged(accepted.value + 1)
    ]);

    let foundEagle = false;
    for (let guard = 0; guard < 18; guard += 1) {
      const actor = await currentSeat();
      if (actor === buyer && await buyer.page.getByTestId('private-hand').getByRole('button', { name: /^Eagle of the Misty Mountains/ }).isVisible().catch(() => false)) {
        foundEagle = true;
        break;
      }
      await reveal(actor);
      await finishReveal(actor);
    }
    expect(foundEagle).toBe(true);

    const garrisonBefore = await count(seats[0], buyer.name, 'Garrison');
    const handBefore = await buyer.page.getByTestId('private-hand').getByRole('button').count();
    await steps.gesture(buyer.page, 'select-eagle', `${buyer.name} selects Eagle of the Misty Mountains`, async () => {
      await buyer.page.getByTestId('private-hand').getByRole('button', { name: /^Eagle of the Misty Mountains/ }).click();
    }, [
      { spec: 'Its final Wild and Stronghold icons enable matching destinations', check: async () => {
        await expect(buyer.page.getByTestId('space-minas-tirith')).toBeEnabled();
        await expect(buyer.page.getByTestId('space-hidden-paths')).toBeEnabled();
        await expect(buyer.page.getByTestId('space-dwarven-caravans')).toBeDisabled();
      } }
    ]);

    await steps.gesture(buyer.page, 'fly-to-minas-tirith', `${buyer.name} flies to the Battle at Minas Tirith`, async () => {
      await buyer.page.getByTestId('space-minas-tirith').click(); accepted.value += 1;
    }, [
      { spec: 'Eagle and Minas Tirith each recruit one Company', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, buyer.name).getByText('Garrison', { exact: true }).locator('..')).toContainText(String(garrisonBefore + 2));
          await expect(observer.page.getByTestId('space-minas-tirith')).toContainText(buyer.name);
        }
      } },
      { spec: 'The two printed draws leave one additional private card after placement', check: async () => {
        await expect(buyer.page.getByTestId('private-hand').getByRole('button')).toHaveCount(handBefore + 1);
      } },
      { spec: 'The ordered Battle deployment remains with the Eagle player', check: async () => {
        await expect(buyer.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
        await expect(buyer.page.getByRole('button', { name: 'Deploy 0' })).toBeEnabled();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(buyer.page, 'reload-eagle-battle', `${buyer.name} reloads during Eagle deployment`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Both Journey and board rewards plus pending authority survive replay', check: async () => {
        await expect(row(buyer, buyer.name).getByText('Garrison', { exact: true }).locator('..')).toContainText(String(garrisonBefore + 2));
        await expect(buyer.page.getByTestId('private-hand').getByRole('button')).toHaveCount(handBefore + 1);
        await expect(buyer.page.getByRole('button', { name: 'Deploy 0' })).toBeEnabled();
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(buyer.page, 'keep-eagle-recruits', `${buyer.name} keeps the Eagle recruits in garrison`, async () => {
      await buyer.page.getByRole('button', { name: 'Deploy 0' }).click(); accepted.value += 1;
    }, [
      { spec: 'The complete high-cost Chronicle turn resolves and authority passes', check: async () => {
        await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
        await expect(buyer.page.locator('footer')).not.toContainText(`Current actor ${buyer.name}`);
      } },
      converged(accepted.value + 1)
    ]);

    steps.generateDocs(
      'Eagle of the Misty Mountains Chronicle tracer',
      'Three isolated humans cycle the physical Chronicle market through ordinary Reveals, acquire the public Eagle for exactly five Influence, reload its immutable positional refill, cycle ordinary rounds until its physical card is privately drawn, use its Wild and Stronghold icons, resolve its extra draw and Battle-only recruit at Minas Tirith, reload the ordered deployment, and finish the real turn.'
    );
  } finally {
    await table.close();
  }
});
