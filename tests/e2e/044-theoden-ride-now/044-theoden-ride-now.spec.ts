import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Théoden resolves Ride Now before an exact fifth Company deployment', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'aragorn-ring-11',
    { phone: 'RIDEP', desktop: 'RIDED' },
    ['Théoden', 'Galadriel', 'Gandalf']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const counter = (observer: (typeof seats)[number], playerName: string, label: string) =>
    row(observer, playerName).getByText(label, { exact: true }).locator('..');

  try {
    const theoden = await currentSeat();
    expect(theoden.name).toBe('Mara');
    const token = theoden.page.getByTestId('private-hand').getByRole('button', { name: /^Token of Command/ });

    await steps.gesture(theoden.page, 'select-token', `${theoden.name} selects Token of Command`, async () => {
      await token.click();
    }, [
      { spec: 'Théoden’s physical Ring card enables the real Minas Tirith Battle space', check: async () => {
        await expect(theoden.page.getByTestId('space-minas-tirith')).toBeEnabled();
      } }
    ]);

    await steps.gesture(theoden.page, 'place-token', `${theoden.name} sends Token of Command to Minas Tirith`, async () => {
      await theoden.page.getByTestId('space-minas-tirith').click(); accepted.value += 1;
    }, [
      { spec: 'The Agent is committed before either ordered effect changes resources or Companies', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-minas-tirith')).toContainText(`Agent · ${theoden.name}`);
          await expect(counter(observer, theoden.name, 'Provision')).toContainText('1');
          await expect(counter(observer, theoden.name, 'Garrison')).toContainText('3');
          await expect(counter(observer, theoden.name, 'Supply')).toContainText('9');
        }
      } },
      { spec: 'Only Théoden receives the explicit Ride Now ordering authority', check: async () => {
        await expect(theoden.page.getByRole('heading', { name: 'When will Ride Now?' })).toBeVisible();
        await expect(theoden.page.getByRole('button', { name: 'Destination first' })).toBeEnabled();
        for (const observer of seats.slice(1)) {
          await expect(observer.page.getByRole('button', { name: 'Destination first' })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(theoden.page, 'destination-first', `${theoden.name} resolves Minas Tirith before Ride Now`, async () => {
      await theoden.page.getByRole('button', { name: 'Destination first' }).click(); accepted.value += 1;
    }, [
      { spec: 'Minas Tirith and Forth Eorlingas recruit exactly two finite Companies', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, theoden.name, 'Garrison')).toContainText('5');
          await expect(counter(observer, theoden.name, 'Supply')).toContainText('7');
          await expect(observer.page.getByTestId('activity-log')).toContainText("Théoden's Forth Eorlingas recruits 1 Company.");
        }
      } },
      { spec: 'Ride Now then grants exactly one Provision before deployment', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, theoden.name, 'Provision')).toContainText('2');
          await expect(observer.page.getByTestId('activity-log')).toContainText('Théoden gains 1 Provision with Ride Now.');
        }
      } },
      { spec: 'The Ring raises the ordinary four-Company ceiling to exactly five existing-or-fresh Companies', check: async () => {
        await expect(theoden.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
        await expect(theoden.page.getByTestId('pending-choice')).toContainText('up to 3 existing garrison Companies with Ride Now; 5 are currently eligible');
        await expect(theoden.page.getByRole('button', { name: 'Deploy 5', exact: true })).toBeEnabled();
        await expect(theoden.page.getByRole('button', { name: 'Deploy 6', exact: true })).toHaveCount(0);
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(theoden.page, 'reload-deployment', `${theoden.name} reloads the ordered Ride Now deployment`, async () => {
      await reloadGameClient(theoden.page);
    }, [
      { spec: 'Replay restores the exact fifth-Company authority without repeating either power', check: async () => {
        await expect(theoden.page.getByRole('button', { name: 'Deploy 5', exact: true })).toBeEnabled();
        await expect(theoden.page.getByTestId('activity-log').locator('li').filter({ hasText: 'Forth Eorlingas recruits' })).toHaveCount(1);
        await expect(theoden.page.getByTestId('activity-log').locator('li').filter({ hasText: 'gains 1 Provision with Ride Now' })).toHaveCount(1);
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(theoden.page, 'deploy-five', `${theoden.name} deploys all five eligible Companies`, async () => {
      await theoden.page.getByRole('button', { name: 'Deploy 5', exact: true }).click(); accepted.value += 1;
    }, [
      { spec: 'Five physical Companies enter the active Battle for exactly ten unit Strength', check: async () => {
        for (const observer of seats) {
          const force = observer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: theoden.name });
          await expect(force).toContainText('5 Companies');
          await expect(force).toContainText('10 Strength');
        }
      } },
      { spec: 'The finite garrison is empty, supply remains seven, and ordinary authority advances', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, theoden.name, 'Garrison')).toContainText('0');
          await expect(counter(observer, theoden.name, 'Supply')).toContainText('7');
        }
        await expect(theoden.page.getByTestId('pending-choice')).toHaveCount(0);
        await expect(theoden.page.locator('footer')).not.toContainText(`Current actor ${theoden.name}`);
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(theoden.page, 'reload-ride-now', `${theoden.name} reloads the deployed Ride Now force`, async () => {
      await reloadGameClient(theoden.page);
    }, [
      { spec: 'Replay conserves five Battle Companies, zero garrison, seven supply, and one Provision gain', check: async () => {
        await expect(theoden.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: theoden.name })).toContainText('5 Companies');
        await expect(counter(theoden, theoden.name, 'Garrison')).toContainText('0');
        await expect(counter(theoden, theoden.name, 'Supply')).toContainText('7');
        await expect(counter(theoden, theoden.name, 'Provision')).toContainText('2');
        await expect(theoden.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Théoden — Ride Now',
      'Three isolated humans select Théoden, play the one physical Token of Command into a real Battle space, choose the board space before the Ring, resolve Forth Eorlingas and Minas Tirith, gain exactly one Provision, receive exactly one additional garrison deployment, send five conserved Companies to Battle, and replay both pending and completed states through Firebase.'
    );
  } finally {
    await table.close();
  }
});
