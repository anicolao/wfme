import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Saruman counts respected factions when A Fair-seeming Promise resolves', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'aragorn-ring-11',
    { phone: 'PROMP', desktop: 'PROMD' },
    ['Saruman', 'Aragorn', 'Gandalf']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const saruman = seats.find((seat) => seat.name === 'Mara')!;
  let gestureNumber = 0;

  const value = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await row(observer, player.name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const visibleCount = async (locator: Locator) => locator.count();

  try {
    expect((await currentSeat()).name).toBe(saruman.name);
    for (let guard = 0; guard < 80; guard += 1) {
      const actor = await currentSeat();
      const keepSeek = actor.page.getByRole('button', { name: 'Keep Seek Allies' });
      const finish = actor.page.getByRole('button', { name: 'Finish Reveal' });
      const token = saruman.page.getByTestId('private-hand').getByRole('button', { name: /^Token of Command/ });
      if (actor === saruman && await value(seats[0], saruman, 'Dwarven') >= 2 && await token.count() > 0) break;

      if (await visibleCount(keepSeek)) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `keep-seek-${gestureNumber}`, `${actor.name} keeps Seek Allies`, async () => {
          await keepSeek.click(); accepted.value += 1;
        }, [
          { spec: 'The optional trash closes before ordinary turn authority advances', check: async () => await expect(keepSeek).toHaveCount(0) },
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
      if (actor === saruman && await value(seats[0], saruman, 'Dwarven') < 2 && caravansOpen && await factionCards.count() > 0) {
        const standingBefore = await value(seats[0], saruman, 'Dwarven');
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
            for (const observer of seats) {
              await expect(row(observer, saruman.name).getByText('Dwarven', { exact: true }).locator('..')).toContainText(String(standingBefore + 1));
              await expect(row(observer, saruman.name).getByText('Provision', { exact: true }).locator('..')).toContainText(String(standingBefore + 2));
            }
          } },
          { spec: standingBefore === 1 ? 'Reaching standing 2 makes Dwarven Holds a respected faction for the later Ring count' : 'Standing 1 does not yet qualify for A Fair-seeming Promise', check: async () => {
            for (const observer of seats) await expect(row(observer, saruman.name).getByText('Renown', { exact: true }).locator('..')).toContainText(standingBefore === 1 ? '1' : '0');
          } },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      gestureNumber += 1;
      await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals the remaining hand`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'Only the acting human’s physical cards enter the public Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
        converged(accepted.value + 1)
      ]);
    }

    expect((await currentSeat()).name).toBe(saruman.name);
    expect(await value(seats[0], saruman, 'Dwarven')).toBe(2);
    const token = saruman.page.getByTestId('private-hand').getByRole('button', { name: /^Token of Command/ });
    await expect(token).toHaveCount(1);

    await steps.gesture(saruman.page, 'select-token', `${saruman.name} selects Token of Command`, async () => {
      await token.click();
    }, [
      { spec: 'Saruman’s active Ring card enables its printed Council, Stronghold, and Roads destinations', check: async () => {
        await expect(saruman.page.getByTestId('space-hall-fire')).toBeEnabled();
        await expect(saruman.page.getByTestId('space-minas-tirith')).toBeEnabled();
        await expect(saruman.page.getByTestId('space-take-war-effort')).toBeEnabled();
        await expect(saruman.page.getByTestId('space-dwarven-caravans')).toBeDisabled();
      } }
    ]);

    await steps.gesture(saruman.page, 'place-token', `${saruman.name} sends Token of Command to Take Up a War Effort`, async () => {
      await saruman.page.getByTestId('space-take-war-effort').click(); accepted.value += 1;
    }, [
      { spec: 'The physical Agent commits before the printed Ring-versus-destination order opens', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${saruman.name}`);
          await expect(observer.page.getByRole('heading', { name: 'When will A Fair-seeming Promise?' })).toBeVisible();
          await expect(row(observer, saruman.name).getByText('Gold', { exact: true }).locator('..')).toContainText('0');
        }
      } },
      { spec: 'Only Saruman can choose whether the current standing count happens before or after the destination', check: async () => {
        await expect(saruman.page.getByRole('button', { name: 'Destination first' })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== saruman)) {
          await expect(observer.page.getByRole('button', { name: 'Ring ability first' })).toBeDisabled();
          await expect(observer.page.getByRole('button', { name: 'Destination first' })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(saruman.page, 'reload-order', `${saruman.name} reloads the pending Promise order`, async () => {
      await reloadGameClient(saruman.page);
    }, [
      { spec: 'Replay restores the same owner-only order without granting either source of Gold early', check: async () => {
        await expect(saruman.page.getByRole('heading', { name: 'When will A Fair-seeming Promise?' })).toBeVisible();
        await expect(row(saruman, saruman.name).getByText('Gold', { exact: true }).locator('..')).toContainText('0');
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(saruman.page, 'destination-first', `${saruman.name} resolves the destination before A Fair-seeming Promise`, async () => {
      await saruman.page.getByRole('button', { name: 'Destination first' }).click(); accepted.value += 1;
    }, [
      { spec: 'Take Up a War Effort grants two Gold before the Ring counts the current table', check: async () => {
        const activityLog = saruman.page.getByTestId('activity-log');
        await expect(activityLog).toContainText('sends an Agent to Take Up a War Effort');
        await expect(activityLog).toContainText('Saruman gains 1 Gold with A Fair-seeming Promise');
        const activity = await activityLog.locator('li').allTextContents();
        expect(activity.findIndex((entry) => entry.includes('sends an Agent to Take Up a War Effort')))
          .toBeLessThan(activity.findIndex((entry) => entry.includes('Saruman gains 1 Gold with A Fair-seeming Promise')));
      } },
      { spec: 'Exactly one respected faction adds one Ring Gold for a final total of three', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, saruman.name).getByText('Gold', { exact: true }).locator('..')).toContainText('3');
          await expect(row(observer, saruman.name).getByText('Dwarven', { exact: true }).locator('..')).toContainText('2');
          await expect(observer.page.getByTestId('activity-log')).toContainText('Saruman gains 1 Gold with A Fair-seeming Promise from 1 respected faction.');
        }
      } },
      { spec: 'The ordered turn completes and authority advances only after both effects', check: async () => {
        for (const observer of seats) await expect(observer.page.locator('footer')).not.toContainText(`Current actor ${saruman.name}`);
        await row(saruman, saruman.name).scrollIntoViewIfNeeded({ timeout: 2_000 });
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(saruman.page, 'reload-promise-result', `${saruman.name} reloads the completed Promise`, async () => {
      await reloadGameClient(saruman.page);
    }, [
      { spec: 'Standing two, destination Gold, Ring Gold, board occupation, and next authority replay exactly', check: async () => {
        await expect(row(saruman, saruman.name).getByText('Gold', { exact: true }).locator('..')).toContainText('3');
        await expect(row(saruman, saruman.name).getByText('Dwarven', { exact: true }).locator('..')).toContainText('2');
        await expect(saruman.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${saruman.name}`);
        await expect(saruman.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
        await row(saruman, saruman.name).scrollIntoViewIfNeeded({ timeout: 2_000 });
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Saruman — A Fair-seeming Promise',
      'Three isolated humans play ordinary rounds until Saruman earns Dwarven standing 2, then play the one physical Token of Command, preserve and reload the owner-only ordering decision, resolve the destination first, gain exactly one additional Gold for the one currently respected faction, and reload the conserved Firebase result.'
    );
  } finally {
    await table.close();
  }
});
