import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Éowyn trashes one private physical card before drawing with Choose Deeds', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'aragorn-ring-11',
    { phone: 'DEEDP', desktop: 'DEEDD' },
    ['Éowyn', 'Aragorn', 'Galadriel']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const counter = (observer: (typeof seats)[number], playerName: string, label: string) =>
    row(observer, playerName).getByText(label, { exact: true }).locator('..');

  try {
    const eowyn = await currentSeat();
    expect(eowyn.name).toBe('Mara');
    const token = eowyn.page.getByTestId('private-hand').getByRole('button', { name: /^Token of Command/ });

    await steps.gesture(eowyn.page, 'select-token', `${eowyn.name} selects Token of Command`, async () => {
      await token.click();
    }, [{ spec: 'Éowyn’s active physical Ring card enables its printed Council, Stronghold, and Roads destinations', check: async () => {
      await expect(eowyn.page.getByTestId('space-hall-fire')).toBeEnabled();
      await expect(eowyn.page.getByTestId('space-minas-tirith')).toBeEnabled();
      await expect(eowyn.page.getByTestId('space-take-war-effort')).toBeEnabled();
      await expect(eowyn.page.getByTestId('space-dwarven-caravans')).toBeDisabled();
    } }]);

    await steps.gesture(eowyn.page, 'place-token', `${eowyn.name} sends Token of Command to Take Up a War Effort`, async () => {
      await eowyn.page.getByTestId('space-take-war-effort').click();
      accepted.value += 1;
    }, [
      { spec: 'The Agent and Token are committed before either the Ring or destination changes cards and Gold', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${eowyn.name}`);
          await expect(counter(observer, eowyn.name, 'Hand')).toContainText('4');
          await expect(counter(observer, eowyn.name, 'Trash')).toContainText('0');
          await expect(counter(observer, eowyn.name, 'Gold')).toContainText('0');
        }
      } },
      { spec: 'Only Éowyn can order Choose Deeds before or after the destination', check: async () => {
        await expect(eowyn.page.getByRole('heading', { name: 'When will Choose Deeds?' })).toBeVisible();
        await expect(eowyn.page.getByRole('button', { name: 'Ring ability first' })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== eowyn)) {
          await expect(observer.page.getByRole('button', { name: 'Ring ability first' })).toBeDisabled();
          await expect(observer.page.getByRole('button', { name: 'Destination first' })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(eowyn.page, 'ring-first', `${eowyn.name} resolves Choose Deeds before the destination`, async () => {
      await eowyn.page.getByRole('button', { name: 'Ring ability first' }).click();
      accepted.value += 1;
    }, [
      { spec: 'Éowyn sees one named trash control for each of her four remaining physical hand cards', check: async () => {
        await expect(eowyn.page.getByRole('heading', { name: 'Which deed will Éowyn relinquish?' })).toBeVisible();
        await expect(eowyn.page.getByTestId('pending-choice').getByRole('button', { name: /^Trash / })).toHaveCount(4);
        await expect(eowyn.page.getByRole('button', { name: 'Trash private card' })).toHaveCount(0);
        await expect(eowyn.page.getByRole('button', { name: 'Keep every card · draw none' })).toBeEnabled();
      } },
      { spec: 'Observers see four redacted choices but cannot identify or resolve any private card', check: async () => {
        for (const observer of seats.filter((seat) => seat !== eowyn)) {
          await expect(observer.page.getByRole('button', { name: 'Trash private card' })).toHaveCount(4);
          for (const button of await observer.page.getByRole('button', { name: 'Trash private card' }).all()) {
            await expect(button).toBeDisabled();
          }
          await expect(observer.page.getByRole('button', { name: 'Keep every card · draw none' })).toBeDisabled();
        }
      } },
      { spec: 'Neither the Ring nor destination has changed the finite zones before Éowyn decides', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, eowyn.name, 'Hand')).toContainText('4');
          await expect(counter(observer, eowyn.name, 'Discard')).toContainText('0');
          await expect(counter(observer, eowyn.name, 'Trash')).toContainText('0');
          await expect(counter(observer, eowyn.name, 'Gold')).toContainText('0');
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(eowyn.page, 'reload-deed-choice', `${eowyn.name} reloads the pending Choose Deeds choice`, async () => {
      await reloadGameClient(eowyn.page);
    }, [
      { spec: 'Replay restores the same four owner-named choices without resolving the Ring or destination early', check: async () => {
        await expect(eowyn.page.getByRole('heading', { name: 'Which deed will Éowyn relinquish?' })).toBeVisible();
        await expect(eowyn.page.getByTestId('pending-choice').getByRole('button', { name: /^Trash / })).toHaveCount(4);
        await expect(counter(eowyn, eowyn.name, 'Hand')).toContainText('4');
        await expect(counter(eowyn, eowyn.name, 'Trash')).toContainText('0');
        await expect(counter(eowyn, eowyn.name, 'Gold')).toContainText('0');
      } },
      converged(accepted.value)
    ]);

    const chosenTrash = eowyn.page.getByTestId('pending-choice').getByRole('button', { name: /^Trash / }).first();
    const chosenName = (await chosenTrash.textContent())?.trim().replace(/^Trash /, '') ?? 'one private card';
    await steps.gesture(eowyn.page, 'trash-deed', `${eowyn.name} relinquishes ${chosenName} with Choose Deeds`, async () => {
      await chosenTrash.click();
      accepted.value += 1;
      await row(eowyn, eowyn.name).evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
    }, [
      { spec: 'Exactly one physical card moves to Trash and Choose Deeds draws exactly one replacement', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, eowyn.name, 'Trash')).toContainText('1');
          await expect(counter(observer, eowyn.name, 'Hand')).toContainText('5');
          await expect(observer.page.getByTestId('activity-log')).toContainText(`${eowyn.name} trashes one private card and draws 1 card with Choose Deeds.`);
        }
      } },
      { spec: 'Only after the Ring draw, Take Up a War Effort draws its second exact card and grants two Gold', check: async () => {
        for (const observer of seats) await expect(counter(observer, eowyn.name, 'Gold')).toContainText('2');
        const activity = await eowyn.page.getByTestId('activity-log').locator('li').allTextContents();
        expect(activity.findIndex((entry) => entry.includes('draws 1 card with Choose Deeds')))
          .toBeLessThan(activity.findIndex((entry) => entry.includes('sends an Agent to Take Up a War Effort')));
      } },
      { spec: 'Authority advances only after both ordered effects finish', check: async () => {
        for (const observer of seats) await expect(observer.page.locator('footer')).not.toContainText(`Current actor ${eowyn.name}`);
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(eowyn.page, 'reload-deed-result', `${eowyn.name} reloads the completed Choose Deeds turn`, async () => {
      await reloadGameClient(eowyn.page);
      await row(eowyn, eowyn.name).evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
    }, [
      { spec: 'Immutable replay preserves five hand cards, one trashed card, the committed Token, two Gold, and no diagnostics', check: async () => {
        await expect(counter(eowyn, eowyn.name, 'Hand')).toContainText('5');
        await expect(counter(eowyn, eowyn.name, 'Discard')).toContainText('0');
        await expect(counter(eowyn, eowyn.name, 'Trash')).toContainText('1');
        await expect(counter(eowyn, eowyn.name, 'Gold')).toContainText('2');
        await expect(eowyn.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${eowyn.name}`);
        await expect(eowyn.page.getByTestId('activity-log').locator('li').filter({ hasText: 'draws 1 card with Choose Deeds' })).toHaveCount(1);
        await expect(eowyn.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Éowyn — Choose Deeds',
      'Three isolated humans select Éowyn, play the one physical Token of Command into its printed Roads destination, order Choose Deeds first, reload its owner-only hand-or-discard authority, trash one exact private hand card by click, draw exactly one replacement, resolve the queued destination, and reload the conserved Firebase result.'
    );
  } finally {
    await table.close();
  }
});
