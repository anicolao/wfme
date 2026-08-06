import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

test('Warden of Ithilien places a Scout only beside a Battle space', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-warden-e2e-3', { phone: 'WARDP', desktop: 'WARDD' });
  const { seats, accepted, converged, currentSeat } = table;
  let mustered = false;
  let played = false;
  let gestureNumber = 0;

  const warden = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Warden of Ithilien/ }).first();
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
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 41');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('46 / 54');
    }

    await reveal(buyer);
    const offered = buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Warden of Ithilien/ }).first();
    await expect(offered).toBeEnabled();
    await steps.gesture(buyer.page, 'acquire-warden-ithilien', `${buyer.name} acquires Warden of Ithilien`, async () => {
      await offered.click(); accepted.value += 1;
    }, [
      { spec: 'The exact physical four-Influence card enters discard and its Row position refills', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Warden of Ithilien`);
        await expect(buyer.page.getByTestId('chronicle-market')).toContainText('deck 40');
      } },
      converged(accepted.value + 1)
    ]);
    await finishReveal(buyer);

    for (let guard = 0; guard < 120 && !played; guard += 1) {
      const actor = await currentSeat();
      const buyerHasWarden = actor === buyer && await visible(warden(buyer));
      if (buyerHasWarden && !mustered) {
        await reveal(buyer, [{
          spec: 'Warden of Ithilien contributes its final 2 Influence and 1 sword Muster box',
          check: async () => {
            const article = buyer.page.getByTestId('reveal-panel').getByText('Warden of Ithilien', { exact: true }).locator('..');
            await expect(article).toContainText('2 Influence · 1 sword');
          }
        }]);
        mustered = true;
        await finishReveal(buyer);
        continue;
      }
      if (buyerHasWarden && mustered) {
        gestureNumber += 1;
        await steps.gesture(buyer.page, `select-warden-${gestureNumber}`, `${buyer.name} selects Warden of Ithilien`, async () => {
          await warden(buyer).click();
        }, [
          { spec: 'Its final Wild icon enables the Battle space at Hidden Paths', check: async () => await expect(buyer.page.getByTestId('space-hidden-paths')).toBeEnabled() }
        ]);

        gestureNumber += 1;
        await steps.gesture(buyer.page, `play-warden-${gestureNumber}`, `${buyer.name} sends the Warden to Hidden Paths`, async () => {
          await buyer.page.getByTestId('space-hidden-paths').click(); accepted.value += 1;
        }, [
          { spec: 'The owner must place the Warden Scout before resolving queued Battle deployment', check: async () => {
            await expect(buyer.page.getByRole('heading', { name: 'Choose a post connected to a Battle space.' })).toBeVisible();
            await expect(buyer.page.getByTestId('post-muster-field')).toBeEnabled();
            await expect(buyer.page.getByTestId('post-orthanc-eye')).toBeDisabled();
            await expect(buyer.page.getByTestId('post-council-antechamber')).toBeDisabled();
            await buyer.page.getByTestId('post-council-antechamber').scrollIntoViewIfNeeded();
          } },
          { spec: 'Other humans can inspect but cannot place the restricted Scout', check: async () => {
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              await expect(observer.page.getByTestId('post-muster-field')).toBeDisabled();
            }
          } },
          converged(accepted.value + 1)
        ]);

        gestureNumber += 1;
        await steps.gesture(buyer.page, `place-warden-scout-${gestureNumber}`, `${buyer.name} places the Warden Scout at Muster Field`, async () => {
          await buyer.page.getByTestId('post-muster-field').click(); accepted.value += 1;
        }, [
          { spec: 'Exactly one finite Scout occupies the legal Battle-connected post', check: async () => {
            await expect(buyer.page.getByTestId('post-muster-field')).toContainText(`Scout · ${buyer.name}`);
            await expect(buyer.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
          } },
          converged(accepted.value + 1)
        ]);

        gestureNumber += 1;
        await steps.gesture(buyer.page, `finish-warden-deployment-${gestureNumber}`, `${buyer.name} leaves Companies in garrison`, async () => {
          await buyer.page.getByRole('button', { name: 'Deploy 0' }).click(); accepted.value += 1;
        }, [
          { spec: 'The ordered Battle choice closes only after the real deployment gesture', check: async () => await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0) },
          converged(accepted.value + 1)
        ]);
        played = true;
        continue;
      }

      await reveal(actor);
      await finishReveal(actor);
    }

    expect({ mustered, played }).toEqual({ mustered: true, played: true });
    await steps.gesture(buyer.page, 'reload-warden-ithilien', `${buyer.name} reloads the Warden outcome`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the exact Warden journey, legal Scout post, destination, and authority', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} places a Scout at Muster Field`);
        await expect(buyer.page.getByTestId('post-muster-field')).toContainText(`Scout · ${buyer.name}`);
        await expect(buyer.page.getByTestId('space-hidden-paths')).toContainText(`Agent · ${buyer.name}`);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Warden of Ithilien Battle-connected Scout',
      'Three isolated humans acquire and Reveal Warden of Ithilien, later draw and play the same physical card through its Wild icon at a Battle space, prove the reducer and UI allow only observation posts connected to at least one Battle space, place the finite Scout through a real click, finish queued deployment, and reload the conserved shared result.'
    );
  } finally {
    await table.close();
  }
});
