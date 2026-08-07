import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Treebeard takes Ent-draught at Wild standing two and doubles his first one-Ent summon', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'roused-554',
    { phone: 'ROUSP', desktop: 'ROUSD' },
    ['Treebeard', 'Aragorn', 'Gandalf']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const treebeard = seats[0];
  let gestureNumber = 0;
  let draughtAwarded = false;
  let bonusSummoned = false;
  let deploymentFinished = false;

  const value = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await row(observer, player.name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const firstVisible = async (locator: Locator) => await locator.count() > 0 ? locator.first() : null;

  try {
    expect((await currentSeat()).name).toBe(treebeard.name);
    for (let guard = 0; guard < 120 && !deploymentFinished; guard += 1) {
      const actor = await currentSeat();
      const keepSeek = await firstVisible(actor.page.getByRole('button', { name: 'Keep Seek Allies' }));
      if (keepSeek) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `keep-seek-${gestureNumber}`, `${actor.name} keeps Seek Allies`, async () => {
          await keepSeek.click(); accepted.value += 1;
        }, [
          { spec: 'The optional trash closes before ordinary authority advances', check: async () => await expect(keepSeek).toHaveCount(0) },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      const keepRanger = await firstVisible(actor.page.getByRole('button', { name: 'Keep all cards' }));
      if (keepRanger) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `keep-ranger-${gestureNumber}`, `${actor.name} keeps every Ranger card`, async () => {
          await keepRanger.click(); accepted.value += 1;
        }, [
          { spec: 'The private Ranger choice closes before Battle deployment', check: async () => await expect(keepRanger).toHaveCount(0) },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      const deployZero = await firstVisible(actor.page.getByRole('button', { name: 'Deploy 0', exact: true }));
      if (deployZero) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `deploy-zero-${gestureNumber}`, `${actor.name} leaves Companies in garrison`, async () => {
          await deployZero.click(); accepted.value += 1;
          if (bonusSummoned) deploymentFinished = true;
        }, [
          { spec: bonusSummoned ? 'The two Roused at Last Ents remain in the active Battle' : 'No optional Company enters the active Battle', check: async () => {
            if (bonusSummoned) {
              for (const observer of seats) {
                await expect(observer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: treebeard.name })).toContainText('2 Ents');
              }
            }
          } },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      const summon = await firstVisible(actor.page.getByRole('button', { name: 'Summon 1 Ent', exact: true }));
      if (summon) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `summon-roused-${gestureNumber}`, `${actor.name} summons one Ent and rouses another`, async () => {
          await summon.click(); accepted.value += 1; bonusSummoned = true;
        }, [
          { spec: 'The exact one-Ent effect becomes two Ents in the real active Battle', check: async () => {
            for (const observer of seats) {
              const force = observer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: treebeard.name });
              await expect(force).toContainText('2 Ents');
              await expect(force).toContainText('6 Strength');
            }
          } },
          { spec: 'Every observer sees the per-game Roused bonus change from ready to spent', check: async () => {
            for (const observer of seats) await expect(row(observer, treebeard.name).getByText('Roused', { exact: true }).locator('..')).toContainText('Spent');
          } },
          { spec: 'The Chronicle records the printed summon and exactly one additional Ent', check: async () => {
            await expect(treebeard.page.getByTestId('activity-log')).toContainText('summons 1 Ent from Entwash and Roused at Last summons 1 additional Ent');
          } },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      const finish = await firstVisible(actor.page.getByRole('button', { name: 'Finish Reveal' }));
      if (finish) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `finish-${gestureNumber}`, `${actor.name} finishes Reveal`, async () => {
          await finish.click(); accepted.value += 1;
        }, [
          { spec: 'The Muster row closes and canonical authority advances', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0) },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      if (actor !== treebeard) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `reveal-other-${gestureNumber}`, `${actor.name} Reveals`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        }, [
          { spec: 'The acting human’s real cards enter the public Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      const wild = await value(seats[0], treebeard, 'Wild');
      const provisions = await value(seats[0], treebeard, 'Provision');
      const desiredSpace = wild === 0
        ? 'hidden-paths'
        : wild === 1 && provisions < 2
          ? 'dwarven-caravans'
          : wild === 1
            ? 'ranger-mustering'
            : 'entwash';
      const desiredName = desiredSpace === 'hidden-paths'
        ? 'Hidden Paths'
        : desiredSpace === 'dwarven-caravans'
          ? 'Dwarven Caravans'
          : desiredSpace === 'ranger-mustering'
            ? 'Ranger Mustering'
            : 'Entwash';
      const candidatePattern = desiredSpace === 'hidden-paths'
        ? /^(Seek Allies|Diplomatic Mission)/
        : desiredSpace === 'dwarven-caravans' || desiredSpace === 'ranger-mustering'
          ? /^(Seek Allies|Diplomatic Mission)/
          : /^(The Open Road|Reconnaissance|Muster the Host)/;
      const card = treebeard.page.getByTestId('private-hand').getByRole('button', { name: candidatePattern }).first();
      const destination = treebeard.page.getByTestId(`space-${desiredSpace}`);
      if (await card.count() > 0 && await destination.getByText(/Agent ·/).count() === 0) {
        gestureNumber += 1;
        await steps.gesture(treebeard.page, `select-${desiredSpace}-${gestureNumber}`, `${treebeard.name} selects a card for ${desiredName}`, async () => {
          await card.click();
        }, [
          { spec: `The selected physical card enables ${desiredName}`, check: async () => await expect(destination).toBeEnabled() }
        ]);

        gestureNumber += 1;
        await steps.gesture(treebeard.page, `visit-${desiredSpace}-${gestureNumber}`, `${treebeard.name} visits ${desiredName}`, async () => {
          await destination.click(); accepted.value += 1;
        }, [
          { spec: 'All humans see Treebeard’s Agent at the exact destination', check: async () => {
            for (const observer of seats) await expect(observer.page.getByTestId(`space-${desiredSpace}`)).toContainText(`Agent · ${treebeard.name}`);
          } },
          { spec: wild === 1 && provisions >= 2 ? 'Wild standing two immediately grants Ent-draught without visiting Fangorn Moot' : `The ordinary ${desiredName} effect resolves before the next turn`, check: async () => {
            if (wild === 1 && provisions >= 2) {
              draughtAwarded = true;
              for (const observer of seats) {
                await expect(row(observer, treebeard.name).getByText('Wild', { exact: true }).locator('..')).toContainText('2');
                await expect(row(observer, treebeard.name).getByText('Ent-draught', { exact: true }).locator('..')).toContainText('Ready');
                await expect(row(observer, treebeard.name).getByText('Roused', { exact: true }).locator('..')).toContainText('Ready');
              }
            }
          } },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      gestureNumber += 1;
      await steps.gesture(treebeard.page, `reveal-treebeard-${gestureNumber}`, `${treebeard.name} Reveals while awaiting the next Roused route`, async () => {
        await treebeard.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'Treebeard uses the ordinary Reveal control without a test-only shortcut', check: async () => await expect(treebeard.page.getByTestId('reveal-panel')).toContainText(`${treebeard.name} Reveals`) },
        converged(accepted.value + 1)
      ]);
    }

    expect({ draughtAwarded, bonusSummoned, deploymentFinished }).toEqual({ draughtAwarded: true, bonusSummoned: true, deploymentFinished: true });
    await steps.gesture(treebeard.page, 'scroll-to-roused-force', `${treebeard.name} scrolls to the completed Roused force`, async () => {
      await treebeard.page.mouse.wheel(0, -1_200);
    }, [
      { spec: 'The unobscured board visibly shows exactly two Ents and six Strength', check: async () => {
        const force = treebeard.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: treebeard.name });
        await expect(force).toContainText('2 Ents');
        await expect(force).toContainText('6 Strength');
      } },
      { spec: 'No ordered deployment remains after the explicit zero-Company choice', check: async () => await expect(treebeard.page.getByTestId('pending-choice')).toHaveCount(0) },
      converged(accepted.value)
    ]);
    await steps.gesture(treebeard.page, 'reload-roused-result', `${treebeard.name} reloads the completed Roused at Last result`, async () => {
      await reloadGameClient(treebeard.page);
    }, [
      { spec: 'Replay conserves Wild standing two, Ent-draught, two Ents, and the spent per-game bonus', check: async () => {
        await expect(row(treebeard, treebeard.name).getByText('Wild', { exact: true }).locator('..')).toContainText('2');
        await expect(row(treebeard, treebeard.name).getByText('Ent-draught', { exact: true }).locator('..')).toContainText('Ready');
        await expect(row(treebeard, treebeard.name).getByText('Roused', { exact: true }).locator('..')).toContainText('Spent');
        await expect(treebeard.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: treebeard.name })).toContainText('2 Ents');
        await expect(treebeard.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Treebeard — Roused at Last',
      'Three isolated humans use ordinary cards, turns, Recall, and board destinations to raise Treebeard to Wild standing two, gain Ent-draught without Fangorn Moot, visit Entwash during a genuine unprotected Battle, turn its printed one-Ent summon into exactly two Ents once per game, and reload the conserved Firebase result.'
    );
  } finally {
    await table.close();
  }
});
