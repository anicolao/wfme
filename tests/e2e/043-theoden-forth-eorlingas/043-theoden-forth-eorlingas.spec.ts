import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Théoden recruits only for his first Battle-space Agent each round', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'theoden-forth-3',
    { phone: 'FORTH', desktop: 'RIDE1' },
    ['Théoden', 'Galadriel', 'Gandalf']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const counter = (observer: (typeof seats)[number], playerName: string, label: string) =>
    row(observer, playerName).getByText(label, { exact: true }).locator('..');
  const forthEntries = (observer: (typeof seats)[number]) =>
    observer.page.getByTestId('activity-log').locator('li').filter({ hasText: 'Forth Eorlingas' });

  try {
    const theoden = await currentSeat();
    expect(theoden.name).toBe('Mara');
    const firstEscort = theoden.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first();

    await steps.gesture(theoden.page, 'select-first-escort', `${theoden.name} selects the first Armed Escort`, async () => {
      await firstEscort.click();
    }, [
      { spec: 'The printed Stronghold icon enables the real Minas Tirith Battle space', check: async () => {
        await expect(theoden.page.getByTestId('space-minas-tirith')).toBeEnabled();
      } }
    ]);

    await steps.gesture(theoden.page, 'enter-first-battle-space', `${theoden.name} sends an Agent to Minas Tirith`, async () => {
      await theoden.page.getByTestId('space-minas-tirith').click(); accepted.value += 1;
    }, [
      { spec: 'Forth Eorlingas, Armed Escort, and Minas Tirith recruit exactly three finite Companies', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, theoden.name, 'Garrison')).toContainText('6');
          await expect(counter(observer, theoden.name, 'Supply')).toContainText('6');
          await expect(forthEntries(observer)).toHaveCount(1);
        }
      } },
      { spec: 'The first recruited force is immediately available in the ordered Battle deployment', check: async () => {
        await expect(theoden.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
        await expect(theoden.page.getByRole('button', { name: 'Deploy 5', exact: true })).toBeEnabled();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(theoden.page, 'keep-first-force', `${theoden.name} keeps the first force in garrison`, async () => {
      await theoden.page.getByRole('button', { name: 'Deploy 0', exact: true }).click(); accepted.value += 1;
    }, [
      { spec: 'The first Battle deployment closes with all six Companies in garrison', check: async () => {
        await expect(theoden.page.getByTestId('pending-choice')).toHaveCount(0);
        await expect(counter(theoden, theoden.name, 'Garrison')).toContainText('6');
      } },
      converged(accepted.value + 1)
    ]);

    for (let turn = 0; turn < 2; turn += 1) {
      const actor = await currentSeat();
      expect(actor.name).not.toBe(theoden.name);
      await steps.gesture(actor.page, `reveal-${turn + 1}`, `${actor.name} Reveals to return authority to Théoden`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'The public Muster row names the human who Revealed', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`);
        } },
        converged(accepted.value + 1)
      ]);
      await steps.gesture(actor.page, `finish-${turn + 1}`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [
        { spec: 'Turn authority advances through the ordinary phase sequence', check: async () => {
          await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
        } },
        converged(accepted.value + 1)
      ]);
    }

    expect((await currentSeat()).name).toBe(theoden.name);
    const secondEscort = theoden.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first();
    await steps.gesture(theoden.page, 'select-second-escort', `${theoden.name} selects the second Armed Escort`, async () => {
      await secondEscort.click();
    }, [
      { spec: 'The second physical Stronghold card enables the unoccupied Osgiliath Battle space', check: async () => {
        await expect(theoden.page.getByTestId('space-osgiliath')).toBeEnabled();
      } }
    ]);

    await steps.gesture(theoden.page, 'enter-second-battle-space', `${theoden.name} sends a second Agent to Osgiliath`, async () => {
      await theoden.page.getByTestId('space-osgiliath').click(); accepted.value += 1;
    }, [
      { spec: 'Only Armed Escort recruits now; the once-per-round Forth Eorlingas does not repeat', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, theoden.name, 'Garrison')).toContainText('7');
          await expect(counter(observer, theoden.name, 'Supply')).toContainText('5');
          await expect(forthEntries(observer)).toHaveCount(1);
        }
      } },
      { spec: 'Osgiliath opens its normal ordered payment before Battle deployment', check: async () => {
        await expect(theoden.page.getByRole('heading', { name: 'How much Mithril will cross the river?' })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(theoden.page, 'reload-used-power', `${theoden.name} reloads after the second Battle-space Agent`, async () => {
      await reloadGameClient(theoden.page);
    }, [
      { spec: 'Replay restores Osgiliath authority and the single used Forth Eorlingas result', check: async () => {
        await expect(theoden.page.getByRole('heading', { name: 'How much Mithril will cross the river?' })).toBeVisible();
        await expect(forthEntries(theoden)).toHaveCount(1);
        await expect(counter(theoden, theoden.name, 'Garrison')).toContainText('7');
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(theoden.page, 'cross-osgiliath', `${theoden.name} crosses Osgiliath without Mithril`, async () => {
      await theoden.page.getByRole('button', { name: 'Pay no Mithril · gain 2 Gold' }).click(); accepted.value += 1;
    }, [
      { spec: 'The printed free crossing grants exactly two Gold and then opens deployment', check: async () => {
        await expect(counter(theoden, theoden.name, 'Gold')).toContainText('2');
        await expect(theoden.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(theoden.page, 'keep-second-force', `${theoden.name} keeps the second force in garrison`, async () => {
      await theoden.page.getByRole('button', { name: 'Deploy 0', exact: true }).click(); accepted.value += 1;
    }, [
      { spec: 'The second Agent turn closes with exactly seven Companies and one persistent trigger', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, theoden.name, 'Garrison')).toContainText('7');
          await expect(forthEntries(observer)).toHaveCount(1);
        }
        await expect(theoden.page.getByRole('button', { name: 'Reveal remaining hand' })).toBeEnabled();
      } },
      converged(accepted.value + 1)
    ]);

    steps.generateDocs(
      'Théoden — Forth Eorlingas',
      'Three isolated humans select the exact Commander roster, send Théoden’s two physical Armed Escorts to two different Battle spaces in one round, prove the first placement recruits one additional finite Company while the second does not, preserve every ordered destination and deployment window, reload the used power, and converge through the immutable Firebase replay.'
    );
  } finally {
    await table.close();
  }
});
