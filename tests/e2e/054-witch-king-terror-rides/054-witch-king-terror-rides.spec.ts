import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('the Witch-king recruits, immediately deploys, and draws Fate when Terror Rides enters Battle', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'aragorn-ring-11',
    { phone: 'TERRP', desktop: 'TERRD' },
    ['Witch-king', 'Galadriel', 'Gandalf']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const counter = (observer: (typeof seats)[number], playerName: string, label: string) =>
    row(observer, playerName).getByText(label, { exact: true }).locator('..');

  try {
    const witchKing = await currentSeat();
    expect(witchKing.name).toBe('Mara');
    const token = witchKing.page.getByTestId('private-hand').getByRole('button', { name: /^Token of Command/ });

    await steps.gesture(witchKing.page, 'select-token', `${witchKing.name} selects Token of Command`, async () => {
      await token.click();
    }, [
      { spec: 'The Witch-king’s physical Ring card enables the real Minas Tirith Battle space', check: async () => {
        await expect(witchKing.page.getByTestId('space-minas-tirith')).toBeEnabled();
      } }
    ]);

    await steps.gesture(witchKing.page, 'place-token', `${witchKing.name} sends Token of Command to Minas Tirith`, async () => {
      await witchKing.page.getByTestId('space-minas-tirith').click(); accepted.value += 1;
    }, [
      { spec: 'The Agent commits before the ordered Ring and destination change any finite piece', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-minas-tirith')).toContainText(`Agent · ${witchKing.name}`);
          await expect(counter(observer, witchKing.name, 'Garrison')).toContainText('3');
          await expect(counter(observer, witchKing.name, 'Supply')).toContainText('9');
          await expect(counter(observer, witchKing.name, 'Fate')).toContainText('0');
          await expect(observer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: witchKing.name })).toContainText('0 Companies');
        }
      } },
      { spec: 'Only the Witch-king receives the explicit Terror Rides ordering authority', check: async () => {
        await expect(witchKing.page.getByRole('heading', { name: 'When will Terror Rides?' })).toBeVisible();
        await expect(witchKing.page.getByRole('button', { name: 'Ring ability first' })).toBeEnabled();
        for (const observer of seats.slice(1)) {
          await expect(observer.page.getByRole('button', { name: 'Ring ability first' })).toBeDisabled();
          await expect(observer.page.getByRole('button', { name: 'Destination first' })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(witchKing.page, 'reload-order', `${witchKing.name} reloads the pending Terror Rides order`, async () => {
      await reloadGameClient(witchKing.page);
    }, [
      { spec: 'Replay restores the owner-only order without recruiting, deploying, or drawing early', check: async () => {
        await expect(witchKing.page.getByRole('heading', { name: 'When will Terror Rides?' })).toBeVisible();
        await expect(counter(witchKing, witchKing.name, 'Garrison')).toContainText('3');
        await expect(counter(witchKing, witchKing.name, 'Supply')).toContainText('9');
        await expect(counter(witchKing, witchKing.name, 'Fate')).toContainText('0');
        await expect(witchKing.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: witchKing.name })).toContainText('0 Companies');
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(witchKing.page, 'ring-first', `${witchKing.name} resolves Terror Rides before Minas Tirith`, async () => {
      await witchKing.page.getByRole('button', { name: 'Ring ability first' }).click(); accepted.value += 1;
    }, [
      { spec: 'Terror Rides recruits one finite Company and places that exact recruit directly in Battle', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, witchKing.name, 'Supply')).toContainText('7');
          await expect(counter(observer, witchKing.name, 'Garrison')).toContainText('4');
          const force = observer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: witchKing.name });
          await expect(force).toContainText('1 Companies');
          await expect(force).toContainText('2 Strength');
        }
      } },
      { spec: 'The Battle-space clause draws exactly one private physical Fate without changing the public discard', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, witchKing.name, 'Fate')).toContainText('1');
          await expect(observer.page.getByTestId('fate-discard')).toContainText('0 cards');
        }
        await expect(witchKing.page.getByTestId('activity-log')).toContainText('privately draws 1 Fate');
      } },
      { spec: 'Minas Tirith then recruits its own Company and offers only the ordinary three-Company deployment', check: async () => {
        await expect(witchKing.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
        await expect(witchKing.page.getByTestId('pending-choice')).toContainText('3 are currently eligible');
        await expect(witchKing.page.getByRole('button', { name: 'Deploy 3', exact: true })).toBeEnabled();
        await expect(witchKing.page.getByRole('button', { name: 'Deploy 4', exact: true })).toHaveCount(0);
        const activity = await witchKing.page.getByTestId('activity-log').locator('li').allTextContents();
        expect(activity.findIndex((entry) => entry.includes('recruits 1 Company with Terror Rides')))
          .toBeLessThan(activity.findIndex((entry) => entry.includes('sends an Agent to Minas Tirith')));
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(witchKing.page, 'reload-deployment', `${witchKing.name} reloads the immediate Terror Rides deployment`, async () => {
      await reloadGameClient(witchKing.page);
    }, [
      { spec: 'Replay restores one already-deployed Company, one private Fate, and the untouched normal deployment', check: async () => {
        await expect(witchKing.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: witchKing.name })).toContainText('1 Companies');
        await expect(counter(witchKing, witchKing.name, 'Fate')).toContainText('1');
        await expect(witchKing.page.getByRole('button', { name: 'Deploy 3', exact: true })).toBeEnabled();
        await expect(witchKing.page.getByTestId('activity-log').locator('li').filter({ hasText: 'recruits 1 Company with Terror Rides' })).toHaveCount(1);
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(witchKing.page, 'decline-normal-deployment', `${witchKing.name} deploys no additional Companies`, async () => {
      await witchKing.page.getByRole('button', { name: 'Deploy 0', exact: true }).click(); accepted.value += 1;
    }, [
      { spec: 'Declining ordinary deployment leaves the mandatory Terror Rides Company in Battle', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: witchKing.name })).toContainText('1 Companies');
          await expect(counter(observer, witchKing.name, 'Garrison')).toContainText('4');
          await expect(counter(observer, witchKing.name, 'Supply')).toContainText('7');
          await expect(counter(observer, witchKing.name, 'Fate')).toContainText('1');
        }
      } },
      { spec: 'The ordered turn completes only after immediate and ordinary deployment have both resolved', check: async () => {
        await expect(witchKing.page.getByTestId('pending-choice')).toHaveCount(0);
        await expect(witchKing.page.locator('footer')).not.toContainText(`Current actor ${witchKing.name}`);
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(witchKing.page, 'reload-result', `${witchKing.name} reloads the completed Terror Rides turn`, async () => {
      await reloadGameClient(witchKing.page);
    }, [
      { spec: 'Replay conserves seven supply, four garrison, one Battle Company, one Fate, and next-player authority', check: async () => {
        await expect(counter(witchKing, witchKing.name, 'Supply')).toContainText('7');
        await expect(counter(witchKing, witchKing.name, 'Garrison')).toContainText('4');
        await expect(counter(witchKing, witchKing.name, 'Fate')).toContainText('1');
        await expect(witchKing.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: witchKing.name })).toContainText('1 Companies');
        await expect(witchKing.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Witch-king — Terror Rides',
      'Three isolated humans play the physical Token of Command into a real Battle space, preserve and reload the owner-only Ring ordering decision, recruit one finite Company directly into Battle, draw one private physical Fate, resolve the destination’s separate recruitment and normal deployment, decline that optional deployment, and reload the conserved Firebase result.'
    );
  } finally {
    await table.close();
  }
});
