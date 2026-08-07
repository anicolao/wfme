import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Treebeard resolves Roots and Stone after Fangorn Moot breaches the Dam', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'roots-stone-5',
    { phone: 'ROOTP', desktop: 'ROOTD' },
    ['Treebeard', 'Aragorn', 'Gandalf']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const treebeard = seats[0];
  let gestureNumber = 0;
  let orderingReached = false;
  let damBreached = false;
  let deploymentFinished = false;
  let provisionBefore = 0;
  let mithrilBefore = 0;

  const value = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await row(observer, player.name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const firstVisible = async (locator: Locator) => await locator.count() > 0 ? locator.first() : null;

  try {
    for (let guard = 0; guard < 140 && !deploymentFinished; guard += 1) {
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

      const destinationFirst = await firstVisible(actor.page.getByRole('button', { name: 'Destination first', exact: true }));
      if (destinationFirst) {
        provisionBefore = await value(treebeard, treebeard, 'Provision');
        mithrilBefore = await value(treebeard, treebeard, 'Mithril');
        gestureNumber += 1;
        await steps.gesture(actor.page, `destination-first-${gestureNumber}`, `${actor.name} chooses Fangorn Moot before Roots and Stone`, async () => {
          await destinationFirst.click(); accepted.value += 1; orderingReached = true;
        }, [
          { spec: 'The intact Dam means Treebeard intentionally delays the Ring reward', check: async () => {
            await expect(actor.page.getByTestId('dam-status')).toContainText('Intact');
            await expect(actor.page.getByRole('button', { name: 'Gain 1 Provision and breach the Dam' })).toBeVisible();
            expect(await value(actor, treebeard, 'Provision')).toBe(provisionBefore);
            expect(await value(actor, treebeard, 'Mithril')).toBe(mithrilBefore);
          } },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      const breach = await firstVisible(actor.page.getByRole('button', { name: 'Gain 1 Provision and breach the Dam', exact: true }));
      if (breach) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `breach-before-roots-${gestureNumber}`, `${actor.name} breaches the Dam before resolving Roots and Stone`, async () => {
          await breach.click(); accepted.value += 1; damBreached = true;
        }, [
          { spec: 'Fangorn Moot grants one Provision, then Roots and Stone grants one Provision and one Mithril', check: async () => {
            for (const observer of seats) {
              await expect(observer.page.getByTestId('dam-status')).toContainText('Breached');
              expect(await value(observer, treebeard, 'Provision')).toBe(provisionBefore + 2);
              expect(await value(observer, treebeard, 'Mithril')).toBe(mithrilBefore + 1);
            }
          } },
          { spec: 'The shared Chronicle records the destination before the conditional Ring reward', check: async () => {
            const log = await actor.page.getByTestId('activity-log').textContent();
            expect(log?.indexOf('breaches the Dam at Fangorn Moot')).toBeLessThan(log?.indexOf('gains 1 Provision and 1 Mithril with Roots and Stone') ?? -1);
          } },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      const deployZero = await firstVisible(actor.page.getByRole('button', { name: 'Deploy 0', exact: true }));
      if (deployZero) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `deploy-zero-${gestureNumber}`, `${actor.name} leaves Companies in garrison`, async () => {
          await deployZero.click(); accepted.value += 1;
          if (damBreached) deploymentFinished = true;
        }, [
          { spec: 'The ordered Battle deployment closes after both destination and Ring effects', check: async () => await expect(deployZero).toHaveCount(0) },
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

      const wild = await value(treebeard, treebeard, 'Wild');
      const provisions = await value(treebeard, treebeard, 'Provision');
      const desiredSpace = wild === 0
        ? 'hidden-paths'
        : wild === 1 && provisions < 2
          ? 'dwarven-caravans'
          : wild === 1
            ? 'ranger-mustering'
            : 'fangorn-moot';
      const desiredName = desiredSpace === 'hidden-paths'
        ? 'Hidden Paths'
        : desiredSpace === 'dwarven-caravans'
          ? 'Dwarven Caravans'
          : desiredSpace === 'ranger-mustering'
            ? 'Ranger Mustering'
            : 'Fangorn Moot';
      const cardPattern = desiredSpace === 'fangorn-moot'
        ? /^Token of Command/
        : /^(Seek Allies|Diplomatic Mission)/;
      const card = treebeard.page.getByTestId('private-hand').getByRole('button', { name: cardPattern }).first();
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
          { spec: desiredSpace === 'fangorn-moot' ? 'Token of Command opens the visible Roots and Stone ordering choice' : `The ordinary ${desiredName} effect resolves`, check: async () => {
            if (desiredSpace === 'fangorn-moot') {
              await expect(treebeard.page.getByRole('heading', { name: 'When will Roots and Stone?' })).toBeVisible();
            }
          } },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      gestureNumber += 1;
      await steps.gesture(treebeard.page, `reveal-treebeard-${gestureNumber}`, `${treebeard.name} Reveals while awaiting the Roots and Stone route`, async () => {
        await treebeard.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'Treebeard uses the ordinary Reveal control without a test-only shortcut', check: async () => await expect(treebeard.page.getByTestId('reveal-panel')).toContainText(`${treebeard.name} Reveals`) },
        converged(accepted.value + 1)
      ]);
    }

    expect({ orderingReached, damBreached, deploymentFinished }).toEqual({ orderingReached: true, damBreached: true, deploymentFinished: true });
    await steps.gesture(treebeard.page, 'reload-roots-result', `${treebeard.name} reloads the completed Roots and Stone result`, async () => {
      await reloadGameClient(treebeard.page);
    }, [
      { spec: 'Replay conserves the breached Dam and both conditional Ring resources', check: async () => {
        await expect(treebeard.page.getByTestId('dam-status')).toContainText('Breached');
        expect(await value(treebeard, treebeard, 'Provision')).toBe(provisionBefore + 2);
        expect(await value(treebeard, treebeard, 'Mithril')).toBe(mithrilBefore + 1);
        await expect(treebeard.page.getByTestId('activity-log')).toContainText('gains 1 Provision and 1 Mithril with Roots and Stone');
        await expect(treebeard.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Treebeard — Roots and Stone',
      'Three isolated humans use ordinary cards, turns, and board destinations to raise Treebeard to Wild standing two, play the physical Token of Command at Fangorn Moot, choose the destination before the Ring, breach the Dam, gain the exact conditional Provision and Mithril rewards, and reload the conserved Firebase result.'
    );
  } finally {
    await table.close();
  }
});
