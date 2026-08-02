import { expect, test } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';
import { startPlotTable } from '../helpers/plot-table';

test('A Chance Meeting draws, privately discards, and resumes the same Agent turn', async ({ browser, page }, testInfo) => {
  test.setTimeout(180_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chance-9', { phone: 'ACMPH', desktop: 'ACMDS' });
  const { seats, accepted, converged, currentSeat, row } = table;

  try {
    const fateHolder = await currentSeat();
    await steps.gesture(fateHolder.page, 'select-hall-card', `${fateHolder.name} selects Armed Escort`, async () => {
      await fateHolder.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [{ spec: 'The Council icon enables Hall of Fire through the actual card control', check: async () => await expect(fateHolder.page.getByTestId('space-hall-fire')).toBeEnabled() }]);
    await steps.gesture(fateHolder.page, 'enter-hall', `${fateHolder.name} enters Hall of Fire`, async () => {
      await fateHolder.page.getByTestId('space-hall-fire').click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees one private Fate card and the public Hall occupation', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, fateHolder.name)).toContainText('Fate1');
          await expect(observer.page.getByTestId('space-hall-fire')).toContainText(fateHolder.name);
        }
      } },
      { spec: 'No observer learns the private Fate identity', check: async () => {
        for (const observer of seats.filter((seat) => seat !== fateHolder)) await expect(observer.page.getByText('A Chance Meeting')).toHaveCount(0);
      } },
      converged(accepted.value + 1)
    ]);

    for (let other = 0; other < 2; other += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `other-reveal-${other + 1}`, `${actor.name} Reveals`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [{ spec: 'The actual hand becomes the public Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) }, converged(accepted.value + 1)]);
      await steps.gesture(actor.page, `other-finish-${other + 1}`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [{ spec: 'Authority advances without exposing the Fate identity', check: async () => {
        await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0);
        for (const observer of seats.filter((seat) => seat !== fateHolder)) await expect(observer.page.getByText('A Chance Meeting')).toHaveCount(0);
      } }, converged(accepted.value + 1)]);
    }

    expect(await currentSeat()).toBe(fateHolder);
    const handBefore = await fateHolder.page.getByTestId('private-hand').getByRole('button').count();
    await steps.gesture(fateHolder.page, 'play-chance-meeting', `${fateHolder.name} plays A Chance Meeting`, async () => {
      await fateHolder.page.getByRole('button', { name: 'Play A Chance Meeting · Draw 1 card · discard 1 card' }).click(); accepted.value += 1;
    }, [
      { spec: 'The card enters the public Fate discard and opens a private discard choice', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('fate-discard')).toContainText('1 cards');
        await expect(fateHolder.page.getByRole('heading', { name: 'Which card will you discard?' })).toBeVisible();
      } },
      { spec: 'The owner sees one additional card while observers see only the public Fate count', check: async () => {
        await expect(fateHolder.page.getByTestId('private-hand').getByRole('button')).toHaveCount(handBefore + 1);
        for (const observer of seats.filter((seat) => seat !== fateHolder)) {
          const privateChoices = observer.page.getByTestId('pending-choice').getByRole('button', { name: 'Discard private card' });
          await expect(privateChoices).toHaveCount(handBefore + 1);
          for (let index = 0; index < handBefore + 1; index += 1) await expect(privateChoices.nth(index)).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(fateHolder.page, 'reload-pending-discard', `${fateHolder.name} reloads during the private discard`, async () => {
      await fateHolder.page.reload();
    }, [
      { spec: 'The authorized private choice survives immutable replay', check: async () => await expect(fateHolder.page.getByRole('heading', { name: 'Which card will you discard?' })).toBeVisible() },
      { spec: 'The resulting hand still contains the drawn card', check: async () => await expect(fateHolder.page.getByTestId('private-hand').getByRole('button')).toHaveCount(handBefore + 1) },
      converged(accepted.value)
    ]);
    const discardButton = fateHolder.page.getByRole('button', { name: /^Discard / }).last();
    const discardedName = (await discardButton.textContent())?.replace(/^Discard /, '') ?? '';
    await steps.gesture(fateHolder.page, 'discard-private-card', `${fateHolder.name} discards ${discardedName}`, async () => {
      await discardButton.click(); accepted.value += 1;
    }, [
      { spec: 'The hand returns to its prior size and the ordered choice closes', check: async () => {
        await expect(fateHolder.page.getByTestId('private-hand').getByRole('button')).toHaveCount(handBefore);
        await expect(fateHolder.page.getByTestId('pending-choice')).toHaveCount(0);
      } },
      { spec: 'The same player resumes the same Agent turn', check: async () => {
        await expect(fateHolder.page.locator('footer')).toContainText(`Current actor ${fateHolder.name}`);
        await expect(fateHolder.page.getByRole('button', { name: 'Reveal remaining hand' })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(fateHolder.page, 'select-resumed-card', `${fateHolder.name} selects The Open Road after Plot resolution`, async () => {
      await fateHolder.page.getByTestId('private-hand').getByRole('button', { name: /^The Open Road/ }).first().click();
    }, [{ spec: 'The resumed Agent turn enables a real Roads destination', check: async () => await expect(fateHolder.page.getByTestId('space-take-war-effort')).toBeEnabled() }]);
    await steps.gesture(fateHolder.page, 'continue-agent-turn', `${fateHolder.name} continues to Take Up a War Effort`, async () => {
      await fateHolder.page.getByTestId('space-take-war-effort').click(); accepted.value += 1;
    }, [
      { spec: 'The same turn spends the remaining Agent and resolves its board reward', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-take-war-effort')).toContainText(fateHolder.name);
          await expect(row(observer, fateHolder.name)).toContainText('Agents0');
        }
      } },
      converged(accepted.value + 1)
    ]);
    steps.generateDocs(
      'A Chance Meeting Plot Fate tracer',
      'Three isolated human browsers draw a private A Chance Meeting through Hall of Fire, preserve its identity boundary, play it by click, reload its private discard choice, discard a real hand card, and prove the same Agent turn resumes on the production board.'
    );
  } finally {
    await table.close();
  }
});
