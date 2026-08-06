import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

test('Heir of Isildur rewards only a low faction and Reveals five Influence', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-heir-isildur-16', { phone: 'HEIRP', desktop: 'HEIRD' });
  const { seats, accepted, converged, currentSeat } = table;
  let gestureNumber = 0;
  let shadowPrepared = false;
  let journeyPlayed = false;
  let musterProved = false;

  const playerValue = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await observer.page.locator('aside.players article').filter({ hasText: player.name }).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const heir = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Heir of Isildur/ }).first();
  const diplomaticMission = (seat: PlotSeat) => seat.page.getByTestId('private-hand').getByRole('button', { name: /^Diplomatic Mission/ }).first();
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
  const revealUntil = async (target: PlotSeat) => {
    for (let guard = 0; guard < 4; guard += 1) {
      const actor = await currentSeat();
      if (actor === target) return;
      await reveal(actor);
      await finishReveal(actor);
    }
    expect(await currentSeat()).toBe(target);
  };
  const chooseCard = async (actor: PlotSeat, name: RegExp, id: string, description: string, destinationId: string) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `${id}-${gestureNumber}`, description, async () => {
      await actor.page.getByTestId('private-hand').getByRole('button', { name }).first().click();
    }, [
      { spec: 'The selected card’s printed icon enables the intended destination', check: async () => await expect(actor.page.getByTestId(destinationId)).toBeEnabled() }
    ]);
  };
  const placeAgent = async (actor: PlotSeat, destinationId: string, id: string, description: string, verifications: Verification[]) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `${id}-${gestureNumber}`, description, async () => {
      await actor.page.getByTestId(destinationId).click(); accepted.value += 1;
    }, [...verifications, converged(accepted.value + 1)]);
  };

  try {
    const buyer = await currentSeat();
    await chooseCard(buyer, /^The Open Road/, 'select-first-road', `${buyer.name} selects the first Open Road`, 'space-take-war-effort');
    await placeAgent(buyer, 'space-take-war-effort', 'take-first-war-effort', `${buyer.name} earns the first war chest`, [
      { spec: 'The first ordinary Roads action gains exactly two Gold', check: async () => {
        for (const observer of seats) await expect.poll(() => playerValue(observer, buyer, 'Gold'), { timeout: 2_000 }).toBe(2);
      } }
    ]);
    await revealUntil(buyer);

    await chooseCard(buyer, /^Diplomatic Mission/, 'select-shadow-mission', `${buyer.name} selects Diplomatic Mission`, 'space-tribute-shadow');
    await placeAgent(buyer, 'space-tribute-shadow', 'take-shadow-tribute', `${buyer.name} claims Tribute to the Shadow`, [
      { spec: 'The faction destination raises Shadow to one and the war chest to four Gold', check: async () => {
        for (const observer of seats) {
          await expect.poll(() => playerValue(observer, buyer, 'Shadow'), { timeout: 2_000 }).toBe(1);
          await expect.poll(() => playerValue(observer, buyer, 'Gold'), { timeout: 2_000 }).toBe(4);
        }
      } }
    ]);
    await reveal(buyer);
    await finishReveal(buyer);

    await revealUntil(buyer);
    await chooseCard(buyer, /^The Open Road/, 'select-second-road', `${buyer.name} selects the second Open Road`, 'space-take-war-effort');
    await placeAgent(buyer, 'space-take-war-effort', 'take-second-war-effort', `${buyer.name} completes the Council war chest`, [
      { spec: 'The second ordinary Roads action raises the war chest to six Gold', check: async () => {
        for (const observer of seats) await expect.poll(() => playerValue(observer, buyer, 'Gold'), { timeout: 2_000 }).toBe(6);
      } }
    ]);
    await revealUntil(buyer);

    await chooseCard(buyer, /^Armed Escort/, 'select-council-escort', `${buyer.name} selects Armed Escort`, 'space-white-council-seat');
    await placeAgent(buyer, 'space-white-council-seat', 'buy-council-seat', `${buyer.name} buys a Seat on the White Council`, [
      { spec: 'Five Gold is paid and the persistent Council seat is public', check: async () => {
        for (const observer of seats) {
          await expect.poll(() => playerValue(observer, buyer, 'Gold'), { timeout: 2_000 }).toBe(1);
          await expect(observer.page.locator('aside.players article').filter({ hasText: buyer.name })).toContainText('CouncilSeated');
        }
      } }
    ]);
    await reveal(buyer);
    await finishReveal(buyer);

    await revealUntil(buyer);
    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 49');
      await expect(observer.page.getByTestId('chronicle-row').getByRole('button')).toHaveCount(5);
    }
    await reveal(buyer, [
      { spec: 'The real five-card Muster plus the Council seat totals exactly eight Influence', check: async () => await expect(buyer.page.locator('.reveal-total strong')).toHaveText('8 Influence') }
    ]);
    const offered = buyer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Heir of Isildur/ }).first();
    await expect(offered).toBeEnabled();
    for (const observer of seats.filter((seat) => seat !== buyer)) {
      await expect(observer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Heir of Isildur/ }).first()).toBeDisabled();
    }
    gestureNumber += 1;
    await steps.gesture(buyer.page, `acquire-heir-${gestureNumber}`, `${buyer.name} acquires Heir of Isildur`, async () => {
      await offered.click(); accepted.value += 1;
    }, [
      { spec: 'The exact eight-Influence physical card enters discard and its Row position refills', check: async () => {
        await expect(buyer.page.locator('.reveal-total strong')).toHaveText('0 Influence');
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Heir of Isildur from the Chronicle Row for 8 Influence and refills its place.`);
        await expect(buyer.page.getByTestId('chronicle-market')).toContainText('deck 48');
      } },
      converged(accepted.value + 1)
    ]);
    await finishReveal(buyer);

    for (let guard = 0; guard < 240 && !musterProved; guard += 1) {
      const actor = await currentSeat();
      const buyerHasHeir = actor === buyer && await heir(buyer).count() > 0 && await heir(buyer).isVisible();
      const buyerHasMission = actor === buyer && await diplomaticMission(buyer).count() > 0 && await diplomaticMission(buyer).isVisible();
      const shadow = await playerValue(seats[0], buyer, 'Shadow');
      if (buyerHasMission && shadow < 2 && !journeyPlayed) {
        await chooseCard(buyer, /^Diplomatic Mission/, 'select-standing-preparation', `${buyer.name} selects Diplomatic Mission to establish an ineligible faction`, 'space-tribute-shadow');
        await placeAgent(buyer, 'space-tribute-shadow', 'raise-shadow-standing', `${buyer.name} raises Shadow above the Heir threshold`, [
          { spec: 'Shadow reaches exactly two before the Heir Journey', check: async () => {
            for (const observer of seats) await expect.poll(() => playerValue(observer, buyer, 'Shadow'), { timeout: 2_000 }).toBe(2);
          } }
        ]);
        shadowPrepared = true;
        continue;
      }
      if (buyerHasHeir && shadowPrepared && !journeyPlayed) {
        const standingsBefore = {
          shadow: await playerValue(seats[0], buyer, 'Shadow'),
          dwarven: await playerValue(seats[0], buyer, 'Dwarven'),
          elven: await playerValue(seats[0], buyer, 'Elven'),
          wild: await playerValue(seats[0], buyer, 'Wild')
        };
        await chooseCard(buyer, /^Heir of Isildur/, 'select-heir', `${buyer.name} selects Heir of Isildur`, 'space-hall-fire');
        await placeAgent(buyer, 'space-hall-fire', 'play-heir', `${buyer.name} sends the Heir to Hall of Fire`, [
          { spec: 'Only factions currently at one standing or less are offered', check: async () => {
            await expect(buyer.page.getByRole('heading', { name: 'Which low faction gains standing?' })).toBeVisible();
            await expect(buyer.page.getByRole('button', { name: 'Gain 1 shadow standing' })).toHaveCount(0);
            await expect(buyer.page.getByRole('button', { name: /^Gain 1 .* standing$/ })).toHaveCount(3);
          } },
          { spec: 'The Journey does not change standing before its owner chooses', check: async () => {
            for (const observer of seats) {
              await expect.poll(() => playerValue(observer, buyer, 'Shadow'), { timeout: 2_000 }).toBe(standingsBefore.shadow);
              await expect.poll(() => playerValue(observer, buyer, 'Dwarven'), { timeout: 2_000 }).toBe(standingsBefore.dwarven);
            }
          } },
          { spec: 'Observers see the ordered choice but cannot answer it', check: async () => {
            for (const observer of seats.filter((seat) => seat !== buyer)) {
              const choices = observer.page.getByRole('button', { name: /^Gain 1 .* standing$/ });
              await expect(choices).toHaveCount(3);
              for (let index = 0; index < 3; index += 1) await expect(choices.nth(index)).toBeDisabled();
            }
          } }
        ]);
        await steps.gesture(buyer.page, 'reload-heir-choice', `${buyer.name} reloads during the Heir’s standing choice`, async () => {
          await reloadGameClient(buyer.page);
        }, [
          { spec: 'Immutable replay preserves the exact eligible choice set', check: async () => {
            await expect(buyer.page.getByRole('heading', { name: 'Which low faction gains standing?' })).toBeVisible();
            await expect(buyer.page.getByRole('button', { name: 'Gain 1 shadow standing' })).toHaveCount(0);
            await expect(buyer.page.getByRole('button', { name: /^Gain 1 .* standing$/ })).toHaveCount(3);
          } },
          converged(accepted.value)
        ]);
        gestureNumber += 1;
        await steps.gesture(buyer.page, `gain-dwarven-standing-${gestureNumber}`, `${buyer.name} grants the Heir’s standing to the Dwarven faction`, async () => {
          await buyer.page.getByRole('button', { name: 'Gain 1 dwarven standing' }).click(); accepted.value += 1;
        }, [
          { spec: 'Dwarven standing rises by exactly one while ineligible Shadow remains unchanged', check: async () => {
            for (const observer of seats) {
              await expect.poll(() => playerValue(observer, buyer, 'Dwarven'), { timeout: 2_000 }).toBe(standingsBefore.dwarven + 1);
              await expect.poll(() => playerValue(observer, buyer, 'Shadow'), { timeout: 2_000 }).toBe(standingsBefore.shadow);
            }
          } },
          { spec: 'The ordered choice closes and canonical authority advances', check: async () => {
            await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
            await expect(buyer.page.locator('footer')).not.toContainText(`Current actor ${buyer.name}`);
          } },
          converged(accepted.value + 1)
        ]);
        journeyPlayed = true;
        continue;
      }
      if (buyerHasHeir && journeyPlayed) {
        await reveal(buyer, [
          { spec: 'The same physical Heir later contributes exactly five Influence and two swords', check: async () => {
            const article = buyer.page.getByTestId('reveal-panel').getByText('Heir of Isildur', { exact: true }).locator('..');
            await expect(article).toContainText('5 Influence · 2 swords');
          } }
        ]);
        musterProved = true;
        await finishReveal(buyer);
        continue;
      }
      await reveal(actor);
      await finishReveal(actor);
    }

    expect({ shadowPrepared, journeyPlayed, musterProved }).toEqual({ shadowPrepared: true, journeyPlayed: true, musterProved: true });
    await steps.gesture(buyer.page, 'reload-heir-isildur', `${buyer.name} reloads the Heir’s completed Chronicle`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves the eight-cost acquisition, low-faction choice, exact Muster, and authority', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires Heir of Isildur`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} gains 1 dwarven standing with Heir of Isildur`);
        await expect(buyer.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Heir of Isildur Chronicle tracer',
      'Three isolated humans earn six Gold through ordinary board play, buy the White Council seat, acquire the exact eight-cost Heir of Isildur, cycle that physical card through the real deck, first raise Shadow above the printed eligibility threshold, play the Heir through its Council icon, reload its ordered standing choice, prove only factions at one or less are enabled, grant exactly one Dwarven standing, draw the same card again, Reveal its exact five Influence and two swords, and reload the converged result.'
    );
  } finally {
    await table.close();
  }
});
