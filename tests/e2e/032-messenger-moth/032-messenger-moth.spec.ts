import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Messenger Moth places one Scout and recalls only a different Scout to draw', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-messenger-moth-11', { phone: 'MOTHP', desktop: 'MOTHD' });
  const { seats, accepted, converged, currentSeat, row } = table;
  let acquired = false;
  let mustered = false;
  let played = false;
  let gestureNumber = 0;

  const count = async (observer: PlotSeat, name: string, label: string) => Number(
    (await row(observer, name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const moth = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Messenger Moth/ }).first();
  const visible = async (locator: Locator) => locator.isVisible().catch(() => false);
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
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 37');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('42 / 54');
    }

    const reconnaissance = buyer.page.getByTestId('private-hand').getByRole('button', { name: /^Reconnaissance/ }).first();
    await steps.gesture(buyer.page, 'select-reconnaissance', `${buyer.name} selects Reconnaissance`, async () => {
      await reconnaissance.click();
    }, [
      { spec: 'A final Roads icon enables Take Up a War Effort', check: async () => await expect(buyer.page.getByTestId('space-take-war-effort')).toBeEnabled() }
    ]);
    await steps.gesture(buyer.page, 'play-reconnaissance', `${buyer.name} establishes a Scout network`, async () => {
      await buyer.page.getByTestId('space-take-war-effort').click(); accepted.value += 1;
    }, [
      { spec: 'Reconnaissance resolves the public destination before its mandatory finite Scout placement', check: async () => await expect(buyer.page.getByRole('heading', { name: 'Choose an empty post for the Scout.' })).toBeVisible() },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(buyer.page, 'place-first-scout', `${buyer.name} places the earlier Scout at Old South Road`, async () => {
      await buyer.page.getByTestId('post-old-south-road').click(); accepted.value += 1;
    }, [
      { spec: 'Every browser sees the earlier Scout that Messenger Moth may later recall', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('post-old-south-road')).toContainText(`Scout · ${buyer.name}`);
      } },
      converged(accepted.value + 1)
    ]);

    while (await currentSeat() !== buyer) {
      const actor = await currentSeat();
      await reveal(actor);
      await finishReveal(actor);
    }
    await reveal(buyer);
    const offered = buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Messenger Moth/ }).first();
    await expect(offered).toBeEnabled();
    await steps.gesture(buyer.page, 'acquire-messenger-moth', `${buyer.name} acquires Messenger Moth`, async () => {
      await offered.click(); accepted.value += 1; acquired = true;
    }, [
      { spec: 'The exact physical card enters discard and its Row position refills', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Messenger Moth`);
        await expect(buyer.page.getByTestId('chronicle-market')).toContainText('deck 36');
      } },
      converged(accepted.value + 1)
    ]);
    await finishReveal(buyer);

    for (let guard = 0; guard < 100 && !played; guard += 1) {
      const actor = await currentSeat();
      const buyerHasMoth = actor === buyer && await visible(moth(buyer));
      if (buyerHasMoth && !mustered) {
        await reveal(buyer);
        const article = buyer.page.getByTestId('reveal-panel').getByText('Messenger Moth', { exact: true }).locator('..');
        await expect(article).toContainText('1 Influence · 0 swords');
        mustered = true;
        await finishReveal(buyer);
        continue;
      }
      if (buyerHasMoth && mustered) {
        gestureNumber += 1;
        await steps.gesture(buyer.page, `select-moth-${gestureNumber}`, `${buyer.name} selects Messenger Moth`, async () => {
          await moth(buyer).click();
        }, [
          { spec: 'Its final Scout icon reaches the non-Wild Take Up a War Effort destination through Old South Road', check: async () => await expect(buyer.page.getByTestId('space-take-war-effort')).toBeEnabled() }
        ]);
        const handBefore = await count(buyer, buyer.name, 'Hand');
        gestureNumber += 1;
        await steps.gesture(buyer.page, `play-moth-${gestureNumber}`, `${buyer.name} sends Messenger Moth along the Scout road`, async () => {
          await buyer.page.getByTestId('space-take-war-effort').click(); accepted.value += 1;
        }, [
          { spec: 'The existing connected Scout opens ordinary Gather Intelligence before either printed effect', check: async () => await expect(buyer.page.getByRole('heading', { name: 'Recall a Scout to gather intelligence?' })).toBeVisible() },
          converged(accepted.value + 1)
        ]);
        gestureNumber += 1;
        await steps.gesture(buyer.page, `decline-intelligence-${gestureNumber}`, `${buyer.name} preserves the earlier Scout for Messenger Moth`, async () => {
          await buyer.page.getByRole('button', { name: 'Leave Scouts in place' }).click(); accepted.value += 1;
        }, [
          { spec: 'The destination draw resolves and Messenger Moth requires its new Scout', check: async () => {
            await expect(buyer.page.getByRole('heading', { name: 'Choose an empty post for the Scout.' })).toBeVisible();
            await expect(row(buyer, buyer.name).getByText('Hand', { exact: true }).locator('..')).toContainText(String(handBefore));
          } },
          converged(accepted.value + 1)
        ]);
        gestureNumber += 1;
        await steps.gesture(buyer.page, `place-moth-scout-${gestureNumber}`, `${buyer.name} places Messenger Moth's new Scout`, async () => {
          await buyer.page.getByTestId('post-northern-eaves').click(); accepted.value += 1;
        }, [
          { spec: 'The new Scout is public but explicitly absent from the different-Scout recall choices', check: async () => {
            for (const observer of seats) await expect(observer.page.getByTestId('post-northern-eaves')).toContainText(`Scout · ${buyer.name}`);
            await expect(buyer.page.getByRole('heading', { name: 'Recall a different Scout with Messenger Moth?' })).toBeVisible();
            await expect(buyer.page.getByRole('button', { name: 'Recall Old South Road · draw 1 card' })).toBeEnabled();
            await expect(buyer.page.getByRole('button', { name: 'Recall Northern Eaves · draw 1 card' })).toHaveCount(0);
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              await expect(observer.page.getByRole('button', { name: 'Recall Old South Road · draw 1 card' })).toBeDisabled();
            }
          } },
          converged(accepted.value + 1)
        ]);
        gestureNumber += 1;
        await steps.gesture(buyer.page, `recall-earlier-scout-${gestureNumber}`, `${buyer.name} recalls the different Scout and draws`, async () => {
          await buyer.page.getByRole('button', { name: 'Recall Old South Road · draw 1 card' }).click(); accepted.value += 1;
        }, [
          { spec: 'Only the earlier Scout returns to supply and the private deck draw advances the Agent turn', check: async () => {
            await expect(buyer.page.getByTestId('post-old-south-road')).not.toContainText(`Scout · ${buyer.name}`);
            await expect(buyer.page.getByTestId('post-northern-eaves')).toContainText(`Scout · ${buyer.name}`);
            await expect(row(buyer, buyer.name).getByText('Hand', { exact: true }).locator('..')).toContainText(String(handBefore + 1));
            await expect(buyer.page.getByTestId('activity-log')).toContainText('with Messenger Moth and draws 1 card');
          } },
          converged(accepted.value + 1)
        ]);
        played = true;
        continue;
      }
      await reveal(actor);
      await finishReveal(actor);
    }

    expect({ acquired, mustered, played }).toEqual({ acquired: true, mustered: true, played: true });
    await steps.gesture(buyer.page, 'reload-messenger-moth', `${buyer.name} reloads the Messenger Moth outcome`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the new Scout, recalled old post, private draw count, and advanced authority', check: async () => {
        await expect(buyer.page.getByTestId('post-old-south-road')).not.toContainText(`Scout · ${buyer.name}`);
        await expect(buyer.page.getByTestId('post-northern-eaves')).toContainText(`Scout · ${buyer.name}`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText('with Messenger Moth and draws 1 card');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Messenger Moth Scout relay',
      'Three isolated humans establish a real Scout network, acquire and Reveal Messenger Moth, later use its printed Scout icon through that network, preserve the earlier Scout through the ordinary intelligence window, place the mandatory new Scout, prove that new piece cannot satisfy “different Scout,” recall the earlier piece to draw privately, and reload the converged result.'
    );
  } finally {
    await table.close();
  }
});
