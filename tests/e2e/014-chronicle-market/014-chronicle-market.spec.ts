import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('a human buys from the public Chronicle Row, refills it, reshuffles, and plays the acquired card', async ({ browser, page }, testInfo) => {
  test.setTimeout(300_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-proof-2', { phone: 'CHRPH', desktop: 'CHRDS' });
  const { seats, accepted, converged, currentSeat, row } = table;

  try {
    const buyer = await currentSeat();
    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-row').getByRole('button')).toHaveCount(5);
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 31');
      await expect(observer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Rider of Rohan/ }).first()).toBeDisabled();
    }

    await steps.gesture(buyer.page, 'reveal-for-market', `${buyer.name} Reveals for the Chronicle market`, async () => {
      await buyer.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'The public Muster row computes enough Influence for a two-cost card', check: async () => {
        await expect(buyer.page.getByTestId('reveal-panel')).toContainText(`${buyer.name} Reveals`);
        await expect(buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Rider of Rohan/ }).first()).toBeEnabled();
      } },
      { spec: 'Only the active Revealing player can acquire the shared card', check: async () => {
        for (const observer of seats.filter((seat) => seat !== buyer)) {
          await expect(observer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Rider of Rohan/ }).first()).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    const influenceText = await buyer.page.locator('.reveal-total strong').textContent();
    const influenceBefore = Number(influenceText?.match(/\d+/)?.[0]);
    expect(influenceBefore).toBeGreaterThanOrEqual(2);
    await steps.gesture(buyer.page, 'buy-rider', `${buyer.name} buys Rider of Rohan`, async () => {
      await buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Rider of Rohan/ }).first().click(); accepted.value += 1;
    }, [
      { spec: 'The exact physical card enters the buyer’s discard and costs 2 Influence', check: async () => {
        await expect(row(buyer, buyer.name)).toContainText('Discard1');
        await expect(buyer.page.locator('.reveal-total strong')).toHaveText(`${influenceBefore - 2} Influence`);
      } },
      { spec: 'The Chronicle Row immediately refills to five from its eighteen-card deck', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('chronicle-row').getByRole('button')).toHaveCount(5);
          await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 28');
          await expect(observer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Rider of Rohan from the Chronicle Row for 2 Influence and refills its place.`);
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(buyer.page, 'reload-acquired-market', `${buyer.name} reloads after the market refill`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Immutable replay preserves the exact refill, Influence, and acquired discard count', check: async () => {
        await expect(buyer.page.getByTestId('chronicle-row').getByRole('button')).toHaveCount(5);
        await expect(buyer.page.getByTestId('chronicle-market')).toContainText('deck 28');
        await expect(buyer.page.locator('.reveal-total strong')).toHaveText(`${influenceBefore - 2} Influence`);
        await expect(row(buyer, buyer.name)).toContainText('Discard1');
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(buyer.page, 'finish-buying', `${buyer.name} finishes the acquisition Reveal`, async () => {
      await buyer.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
    }, [
      { spec: 'The acquired card remains in discard while the turn passes', check: async () => await expect(row(buyer, buyer.name)).toContainText('Discard6') },
      converged(accepted.value + 1)
    ]);

    for (let index = 0; index < 5; index += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `cycle-${index + 1}-reveal`, `${actor.name} Reveals while the acquired Rider waits for reshuffle`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'The genuine public Muster row replaces the private hand', check: async () => {
          await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`);
          await expect(actor.page.getByTestId('private-hand').getByRole('button')).toHaveCount(0);
        } },
        converged(accepted.value + 1)
      ]);
      await steps.gesture(actor.page, `cycle-${index + 1}-finish`, `${actor.name} finishes that Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [
        { spec: index === 4 ? 'The second Recall opens Round 3 after the acquired discard was shuffled' : 'The Reveal closes and ordinary turn order continues', check: async () => {
          await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0);
          if (index === 4) {
            for (const observer of seats) await expect(observer.page.getByText('Round 3 · Agent turns')).toBeVisible();
          }
        } },
        converged(accepted.value + 1)
      ]);
    }

    let roundThreeLead = 0;
    while (await currentSeat() !== buyer) {
      roundThreeLead += 1;
      expect(roundThreeLead).toBeLessThan(3);
      const actor = await currentSeat();
      await steps.gesture(actor.page, `round-three-${roundThreeLead}-reveal`, `${actor.name} Reveals before the Chronicle buyer in Round 3`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'Rotated first-player order remains visible and authoritative', check: async () => {
          await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`);
          await expect(actor.page.getByText('Round 3 · Reveal turn')).toBeVisible();
        } },
        converged(accepted.value + 1)
      ]);
      await steps.gesture(actor.page, `round-three-${roundThreeLead}-finish`, `${actor.name} finishes before the Chronicle buyer`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [
        { spec: 'The next ordinary human receives authority', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0) },
        converged(accepted.value + 1)
      ]);
    }

    expect(await currentSeat()).toBe(buyer);
    await expect(buyer.page.getByTestId('private-hand').getByRole('button', { name: /^Rider of Rohan/ })).toBeVisible();
    await steps.gesture(buyer.page, 'select-acquired-rider', `${buyer.name} selects the acquired Rider of Rohan`, async () => {
      await buyer.page.getByTestId('private-hand').getByRole('button', { name: /^Rider of Rohan/ }).click();
    }, [
      { spec: 'The final Stronghold placement icons enable real Stronghold destinations', check: async () => {
        await expect(buyer.page.getByTestId('space-minas-tirith')).toBeEnabled();
        await expect(buyer.page.getByTestId('space-osgiliath')).toBeEnabled();
        await expect(buyer.page.getByTestId('space-take-war-effort')).toBeDisabled();
      } }
    ]);

    await steps.gesture(buyer.page, 'ride-to-minas-tirith', `${buyer.name} rides to Minas Tirith`, async () => {
      await buyer.page.getByTestId('space-minas-tirith').click(); accepted.value += 1;
    }, [
      { spec: 'Rider and Minas Tirith each recruit one Company before deployment', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, buyer.name)).toContainText('Garrison5');
          await expect(observer.page.getByTestId('space-minas-tirith')).toContainText(buyer.name);
        }
      } },
      { spec: 'The ordered Battle deployment choice remains with the buyer', check: async () => {
        await expect(buyer.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
        await expect(buyer.page.getByRole('button', { name: 'Deploy 0' })).toBeEnabled();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(buyer.page, 'reload-rider-deployment', `${buyer.name} reloads during the Rider deployment`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'The acquired card’s Journey result and exact pending authority survive replay', check: async () => {
        await expect(row(buyer, buyer.name)).toContainText('Garrison5');
        await expect(buyer.page.getByRole('button', { name: 'Deploy 0' })).toBeEnabled();
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(buyer.page, 'decline-rider-deployment', `${buyer.name} keeps the recruited Companies in garrison`, async () => {
      await buyer.page.getByRole('button', { name: 'Deploy 0' }).click(); accepted.value += 1;
    }, [
      { spec: 'The complete acquired-card Agent turn resolves and passes to the next human', check: async () => {
        await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
        await expect(buyer.page.locator('footer')).not.toContainText(`Current actor ${buyer.name}`);
      } },
      converged(accepted.value + 1)
    ]);

    steps.generateDocs(
      'Chronicle market tracer',
      'Three isolated human browsers keep a five-card public Chronicle Row on the production board, Reveal for Influence, acquire one exact physical card, refill immediately, reload the market, perform a genuine discard reshuffle, draw the acquired Rider, and execute both of its final card boxes through visible controls.'
    );
  } finally {
    await table.close();
  }
});
