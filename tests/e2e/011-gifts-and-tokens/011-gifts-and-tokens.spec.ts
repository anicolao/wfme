import { expect, test } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';
import { startPlotTable } from '../helpers/plot-table';

test('Gifts and Tokens resolves a visible resource choice and resumes the Agent turn', async ({ browser, page }, testInfo) => {
  test.setTimeout(180_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'gifts-26', { phone: 'GIFPH', desktop: 'GIFDS' });
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
        for (const observer of seats.filter((seat) => seat !== fateHolder)) await expect(observer.page.getByText('Gifts and Tokens')).toHaveCount(0);
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
        for (const observer of seats.filter((seat) => seat !== fateHolder)) await expect(observer.page.getByText('Gifts and Tokens')).toHaveCount(0);
      } }, converged(accepted.value + 1)]);
    }

    expect(await currentSeat()).toBe(fateHolder);
    await steps.gesture(fateHolder.page, 'play-gifts-tokens', `${fateHolder.name} plays Gifts and Tokens`, async () => {
      await fateHolder.page.getByRole('button', { name: 'Play Gifts and Tokens · Gain 2 Gold · or pay 2 Gold for 1 Mithril + 1 Provision' }).click(); accepted.value += 1;
    }, [
      { spec: 'The Fate card becomes public and opens its exact resource choice', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('fate-discard')).toContainText('1 cards');
        await expect(fateHolder.page.getByRole('heading', { name: 'Which gift will you take?' })).toBeVisible();
        await expect(fateHolder.page.getByRole('button', { name: 'Gain 2 Gold' })).toBeEnabled();
      } },
      { spec: 'The unaffordable paid option is absent rather than partially resolving', check: async () => {
        await expect(fateHolder.page.getByRole('button', { name: /Pay 2 Gold · gain 1 Mithril/ })).toHaveCount(0);
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(fateHolder.page, 'reload-pending-gift', `${fateHolder.name} reloads during the resource choice`, async () => {
      await fateHolder.page.reload();
    }, [
      { spec: 'The authorized resource choice survives immutable replay', check: async () => await expect(fateHolder.page.getByRole('heading', { name: 'Which gift will you take?' })).toBeVisible() },
      { spec: 'No resources change before a legal click', check: async () => await expect(row(fateHolder, fateHolder.name)).toContainText('Gold0') },
      converged(accepted.value)
    ]);
    await steps.gesture(fateHolder.page, 'take-gold-gift', `${fateHolder.name} takes 2 Gold`, async () => {
      await fateHolder.page.getByRole('button', { name: 'Gain 2 Gold' }).click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees the exact public resource result', check: async () => {
        for (const observer of seats) await expect(row(observer, fateHolder.name)).toContainText('Gold2');
      } },
      { spec: 'The same player resumes the same Agent turn', check: async () => {
        await expect(fateHolder.page.getByTestId('pending-choice')).toHaveCount(0);
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
      { spec: 'The same turn spends the remaining Agent and adds the board reward', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-take-war-effort')).toContainText(fateHolder.name);
          await expect(row(observer, fateHolder.name)).toContainText('Agents0');
          await expect(row(observer, fateHolder.name)).toContainText('Gold4');
        }
      } },
      converged(accepted.value + 1)
    ]);
    steps.generateDocs(
      'Gifts and Tokens Plot Fate tracer',
      'Three isolated human browsers draw private Gifts and Tokens through Hall of Fire, preserve its identity boundary, play it by click, reload its resource choice, take the legal Gold branch, converge on exact resources, and prove the same Agent turn resumes. Reducer tests separately execute the paid Mithril-and-Provision branch.'
    );
  } finally {
    await table.close();
  }
});
