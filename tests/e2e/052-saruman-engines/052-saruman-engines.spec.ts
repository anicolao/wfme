import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Saruman powers Engines of Isengard once per round after recruiting two Companies', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'road-2',
    { phone: 'ENGPH', desktop: 'ENGDS' },
    ['Saruman', 'Aragorn', 'Gandalf']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const saruman = seats.find((seat) => seat.name === 'Mara')!;
  let turnGesture = 0;

  const resource = (observer: PlotSeat, player: PlotSeat, label: string) =>
    row(observer, player.name).getByText(label, { exact: true }).locator('..');

  const revealOrFinish = async (actor: PlotSeat) => {
    const finish = actor.page.getByRole('button', { name: 'Finish Reveal' });
    turnGesture += 1;
    if (await finish.count() > 0) {
      await steps.gesture(actor.page, `finish-${turnGesture}`, `${actor.name} finishes Reveal`, async () => {
        await finish.click(); accepted.value += 1;
      }, [
        { spec: 'The public Muster row closes before canonical authority advances', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0) },
        converged(accepted.value + 1)
      ]);
      return;
    }
    await steps.gesture(actor.page, `reveal-${turnGesture}`, `${actor.name} Reveals the remaining hand`, async () => {
      await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'Only the acting human’s physical cards enter the public Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
      converged(accepted.value + 1)
    ]);
  };

  try {
    expect((await currentSeat()).name).toBe(saruman.name);
    const openRoad = saruman.page.getByTestId('private-hand').getByRole('button', { name: /^The Open Road/ }).first();
    await steps.gesture(saruman.page, 'select-open-road', `${saruman.name} selects The Open Road`, async () => {
      await openRoad.click();
    }, [
      { spec: 'The physical Roads card enables Take Up a War Effort', check: async () => await expect(saruman.page.getByTestId('space-take-war-effort')).toBeEnabled() }
    ]);

    await steps.gesture(saruman.page, 'earn-engines-gold', `${saruman.name} earns Gold at Take Up a War Effort`, async () => {
      await saruman.page.getByTestId('space-take-war-effort').click(); accepted.value += 1;
    }, [
      { spec: 'Every human sees exactly 2 Gold before Engines can trigger', check: async () => {
        for (const observer of seats) await expect(resource(observer, saruman, 'Gold')).toContainText('2');
      } },
      { spec: 'The ordinary Roads action completes before authority advances', check: async () => {
        for (const observer of seats) await expect(observer.page.locator('footer')).not.toContainText(`Current actor ${saruman.name}`);
      } },
      converged(accepted.value + 1)
    ]);

    for (let other = 0; other < 2; other += 1) {
      const actor = await currentSeat();
      await revealOrFinish(actor);
      await revealOrFinish(actor);
    }
    expect((await currentSeat()).name).toBe(saruman.name);

    const escort = saruman.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first();
    await steps.gesture(saruman.page, 'select-armed-escort', `${saruman.name} selects Armed Escort`, async () => {
      await escort.click();
    }, [
      { spec: 'The physical Council card enables Muster the Free Peoples', check: async () => await expect(saruman.page.getByTestId('space-muster-free-peoples')).toBeEnabled() }
    ]);

    await steps.gesture(saruman.page, 'recruit-first-host', `${saruman.name} recruits at Muster the Free Peoples`, async () => {
      await saruman.page.getByTestId('space-muster-free-peoples').click(); accepted.value += 1;
    }, [
      { spec: 'Armed Escort recruits one Company and the destination recruits two from finite supply', check: async () => {
        for (const observer of seats) {
          await expect(resource(observer, saruman, 'Garrison')).toContainText('6');
          await expect(resource(observer, saruman, 'Supply')).toContainText('6');
        }
      } },
      { spec: 'The destination’s own optional payment resolves before the queued Commander reaction', check: async () => {
        for (const observer of seats) await expect(observer.page.getByRole('heading', { name: 'Pay 2 Gold to gain 1 Provision?' })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(saruman.page, 'keep-gold-for-engines', `${saruman.name} keeps Gold for the Engines`, async () => {
      await saruman.page.getByRole('button', { name: 'Keep the Gold' }).click(); accepted.value += 1;
    }, [
      { spec: 'The first effect recruiting at least two opens Engines of Isengard after the destination choice', check: async () => {
        for (const observer of seats) await expect(observer.page.getByRole('heading', { name: 'Power the Engines of Isengard?' })).toBeVisible();
      } },
      { spec: 'Only Saruman can pay or decline the once-per-round reaction', check: async () => {
        await expect(saruman.page.getByRole('button', { name: 'Pay 1 Gold · recruit 1 Company' })).toBeEnabled();
        await expect(saruman.page.getByRole('button', { name: 'Decline Engines' })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== saruman)) {
          await expect(observer.page.getByRole('button', { name: 'Pay 1 Gold · recruit 1 Company' })).toBeDisabled();
          await expect(observer.page.getByRole('button', { name: 'Decline Engines' })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(saruman.page, 'reload-engines-choice', `${saruman.name} reloads the pending Engines decision`, async () => {
      await reloadGameClient(saruman.page);
    }, [
      { spec: 'Replay restores the same owner-only choice without spending Gold or moving a Company early', check: async () => {
        await expect(saruman.page.getByRole('heading', { name: 'Power the Engines of Isengard?' })).toBeVisible();
        await expect(resource(saruman, saruman, 'Gold')).toContainText('2');
        await expect(resource(saruman, saruman, 'Garrison')).toContainText('6');
        await expect(resource(saruman, saruman, 'Supply')).toContainText('6');
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(saruman.page, 'pay-engines', `${saruman.name} powers Engines of Isengard`, async () => {
      await saruman.page.getByRole('button', { name: 'Pay 1 Gold · recruit 1 Company' }).click(); accepted.value += 1;
    }, [
      { spec: 'Exactly 1 Gold buys exactly one additional finite Company', check: async () => {
        for (const observer of seats) {
          await expect(resource(observer, saruman, 'Gold')).toContainText('1');
          await expect(resource(observer, saruman, 'Garrison')).toContainText('7');
          await expect(resource(observer, saruman, 'Supply')).toContainText('5');
          await expect(observer.page.getByTestId('activity-log')).toContainText('pays 1 Gold and recruits 1 additional Company with Engines of Isengard');
        }
      } },
      { spec: 'The Agent action closes only after the Commander reaction, leaving Saruman the next legal Reveal', check: async () => {
        await expect(saruman.page.getByRole('button', { name: 'Reveal remaining hand' })).toBeEnabled();
        for (const observer of seats) await expect(observer.page.getByRole('heading', { name: 'Power the Engines of Isengard?' })).toHaveCount(0);
      } },
      converged(accepted.value + 1)
    ]);

    for (let guard = 0; guard < 12; guard += 1) {
      const actor = await currentSeat();
      const roundTwo = await seats[0].page.getByText('Round 2 · Agent turns', { exact: true }).count() > 0;
      if (roundTwo && actor === saruman) break;
      await revealOrFinish(actor);
    }
    expect((await currentSeat()).name).toBe(saruman.name);
    await expect(seats[0].page.getByText('Round 2 · Agent turns', { exact: true })).toBeVisible();

    const refreshedEscort = saruman.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first();
    await steps.gesture(saruman.page, 'select-refreshed-escort', `${saruman.name} selects Armed Escort after Recall`, async () => {
      await refreshedEscort.click();
    }, [
      { spec: 'Recall returns the printed Council destination and a physical card to legal play', check: async () => await expect(saruman.page.getByTestId('space-muster-free-peoples')).toBeEnabled() }
    ]);

    await steps.gesture(saruman.page, 'trigger-refreshed-engines', `${saruman.name} triggers Engines again in round two`, async () => {
      await saruman.page.getByTestId('space-muster-free-peoples').click(); accepted.value += 1;
    }, [
      { spec: 'The new round’s first two-Company destination reopens Engines immediately when the two-Gold destination option is unaffordable', check: async () => {
        for (const observer of seats) await expect(observer.page.getByRole('heading', { name: 'Power the Engines of Isengard?' })).toBeVisible();
      } },
      { spec: 'The second round conserves three base recruits before the optional additional Company', check: async () => {
        for (const observer of seats) {
          await expect(resource(observer, saruman, 'Gold')).toContainText('1');
          await expect(resource(observer, saruman, 'Garrison')).toContainText('10');
          await expect(resource(observer, saruman, 'Supply')).toContainText('2');
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(saruman.page, 'decline-refreshed-engines', `${saruman.name} declines the refreshed Engines`, async () => {
      await saruman.page.getByRole('button', { name: 'Decline Engines' }).click(); accepted.value += 1;
    }, [
      { spec: 'Declining spends the round’s opportunity without moving Gold or a Company', check: async () => {
        for (const observer of seats) {
          await expect(resource(observer, saruman, 'Gold')).toContainText('1');
          await expect(resource(observer, saruman, 'Garrison')).toContainText('10');
          await expect(resource(observer, saruman, 'Supply')).toContainText('2');
          await expect(observer.page.getByRole('heading', { name: 'Power the Engines of Isengard?' })).toHaveCount(0);
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(saruman.page, 'reload-engines-result', `${saruman.name} reloads both completed Engines rounds`, async () => {
      await reloadGameClient(saruman.page);
    }, [
      { spec: 'Firebase replay preserves paid round one, declined round two, finite pieces, Gold, board occupation, and clean diagnostics', check: async () => {
        await expect(resource(saruman, saruman, 'Gold')).toContainText('1');
        await expect(resource(saruman, saruman, 'Garrison')).toContainText('10');
        await expect(resource(saruman, saruman, 'Supply')).toContainText('2');
        await expect(saruman.page.getByTestId('space-muster-free-peoples')).toContainText(`Agent · ${saruman.name}`);
        await expect(saruman.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
        await row(saruman, saruman.name).scrollIntoViewIfNeeded({ timeout: 2_000 });
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Saruman — Engines of Isengard',
      'Three isolated humans earn real Gold, recruit finite Companies through the production board, preserve and reload Saruman’s owner-only once-per-round reaction, pay exactly one Gold for one additional Company, Recall, trigger the refreshed power in round two, decline it, and reload the conserved Firebase result.'
    );
  } finally {
    await table.close();
  }
});
