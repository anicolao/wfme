import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Aragorn orders Andúril Aflame before the destination through Token of Command', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'aragorn-ring-11', { phone: 'RINGP', desktop: 'RINGD' });
  const { seats, accepted, converged, currentSeat, row } = table;

  try {
    const aragorn = await currentSeat();
    expect(aragorn.name).toBe('Mara');
    const token = aragorn.page.getByTestId('private-hand').getByRole('button', { name: /^Token of Command/ });

    await steps.gesture(aragorn.page, 'select-token', `${aragorn.name} selects Token of Command`, async () => {
      await token.click();
    }, [
      { spec: 'Aragorn’s active Ring card enables its printed Council, Stronghold, and Roads destinations', check: async () => {
        await expect(aragorn.page.getByTestId('space-hall-fire')).toBeEnabled();
        await expect(aragorn.page.getByTestId('space-minas-tirith')).toBeEnabled();
        await expect(aragorn.page.getByTestId('space-take-war-effort')).toBeEnabled();
        await expect(aragorn.page.getByTestId('space-dwarven-caravans')).toBeDisabled();
      } }
    ]);

    await steps.gesture(aragorn.page, 'place-token', `${aragorn.name} sends Token of Command to Take War Effort`, async () => {
      await aragorn.page.getByTestId('space-take-war-effort').click(); accepted.value += 1;
    }, [
      { spec: 'The Agent is physically committed before an ordered Ring-versus-destination decision opens', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${aragorn.name}`);
          await expect(observer.page.getByRole('heading', { name: 'When will Andúril Aflame?' })).toBeVisible();
          await expect(row(observer, aragorn.name).getByText('Gold', { exact: true }).locator('..')).toContainText('0');
        }
      } },
      { spec: 'Only Aragorn can choose the printed before-or-after ordering', check: async () => {
        await expect(aragorn.page.getByRole('button', { name: 'Ring ability first' })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== aragorn)) {
          await expect(observer.page.getByRole('button', { name: 'Ring ability first' })).toBeDisabled();
          await expect(observer.page.getByRole('button', { name: 'Destination first' })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(aragorn.page, 'ring-first', `${aragorn.name} chooses Andúril Aflame first`, async () => {
      await aragorn.page.getByRole('button', { name: 'Ring ability first' }).click(); accepted.value += 1;
    }, [
      { spec: 'All four factions at zero are legal before the destination changes any state', check: async () => {
        await expect(aragorn.page.getByRole('heading', { name: 'Which low faction answers Andúril?' })).toBeVisible();
        for (const faction of ['shadow', 'dwarven', 'elven', 'wild']) {
          await expect(aragorn.page.getByRole('button', { name: `Gain 1 ${faction} standing` })).toBeEnabled();
        }
        for (const observer of seats) await expect(row(observer, aragorn.name).getByText('Gold', { exact: true }).locator('..')).toContainText('0');
      } },
      { spec: 'Observers see the ordered decision but cannot resolve Aragorn’s Ring', check: async () => {
        for (const observer of seats.filter((seat) => seat !== aragorn)) {
          await expect(observer.page.getByRole('button', { name: 'Gain 1 dwarven standing' })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(aragorn.page, 'reload-ring-choice', `${aragorn.name} reloads the pending Ring choice`, async () => {
      await reloadGameClient(aragorn.page);
    }, [
      { spec: 'Replay restores the same four low-faction options without resolving the destination early', check: async () => {
        await expect(aragorn.page.getByRole('heading', { name: 'Which low faction answers Andúril?' })).toBeVisible();
        await expect(aragorn.page.getByRole('button', { name: /^Gain 1 .* standing$/ })).toHaveCount(4);
        await expect(row(aragorn, aragorn.name).getByText('Gold', { exact: true }).locator('..')).toContainText('0');
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(aragorn.page, 'gain-dwarven-standing', `${aragorn.name} calls the Dwarven Holds with Andúril`, async () => {
      await aragorn.page.getByRole('button', { name: 'Gain 1 dwarven standing' }).click(); accepted.value += 1;
    }, [
      { spec: 'Andúril grants exactly one low-faction standing before Take War Effort resolves', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, aragorn.name).getByText('Dwarven', { exact: true }).locator('..')).toContainText('1');
          await expect(observer.page.getByTestId('activity-log')).toContainText(`${aragorn.name} gains 1 dwarven standing with Andúril Aflame.`);
        }
      } },
      { spec: 'The queued destination then draws one card, grants two Gold, and advances authority', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, aragorn.name).getByText('Gold', { exact: true }).locator('..')).toContainText('2');
          await expect(row(observer, aragorn.name).getByText('Hand', { exact: true }).locator('..')).toContainText('5');
          await expect(observer.page.locator('footer')).not.toContainText(`Current actor ${aragorn.name}`);
        }
      } },
      converged(accepted.value + 1)
    ]);

    steps.generateDocs(
      'Aragorn — Andúril Aflame',
      'Three isolated humans use the production lobby and board while Aragorn plays the one physical Token of Command, chooses his Ring before the destination, reloads the pending authority, gains exactly one eligible faction standing, and only then receives the destination draw and Gold.'
    );
  } finally {
    await table.close();
  }
});
