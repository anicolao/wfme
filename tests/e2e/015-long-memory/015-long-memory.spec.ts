import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Long Memory cycles an affordable physical Chronicle card and resumes the Agent turn', async ({ browser, page }, testInfo) => {
  test.setTimeout(300_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'memory-17', { phone: 'MEMPH', desktop: 'MEMDS' });
  const { seats, accepted, converged, currentSeat, row } = table;

  try {
    const fateHolder = await currentSeat();
    await steps.gesture(fateHolder.page, 'select-hall-card', `${fateHolder.name} selects Armed Escort`, async () => {
      await fateHolder.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [{ spec: 'The real Council icon enables Hall of Fire', check: async () => await expect(fateHolder.page.getByTestId('space-hall-fire')).toBeEnabled() }]);
    await steps.gesture(fateHolder.page, 'enter-hall', `${fateHolder.name} enters Hall of Fire`, async () => {
      await fateHolder.page.getByTestId('space-hall-fire').click(); accepted.value += 1;
    }, [
      { spec: 'All observers see the public occupation and one private Fate card', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-hall-fire')).toContainText(fateHolder.name);
          await expect(row(observer, fateHolder.name)).toContainText('Fate1');
        }
      } },
      { spec: 'Only the owner can identify Long Memory before it is played', check: async () => {
        for (const observer of seats.filter((seat) => seat !== fateHolder)) await expect(observer.page.getByText('Long Memory')).toHaveCount(0);
      } },
      converged(accepted.value + 1)
    ]);

    for (let other = 0; other < 2; other += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `other-reveal-${other + 1}`, `${actor.name} Reveals`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [{ spec: 'The actual hand becomes a public Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) }, converged(accepted.value + 1)]);
      await steps.gesture(actor.page, `other-finish-${other + 1}`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [{ spec: 'Turn authority advances without exposing the private Fate identity', check: async () => {
        await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0);
        for (const observer of seats.filter((seat) => seat !== fateHolder)) await expect(observer.page.getByText('Long Memory')).toHaveCount(0);
      } }, converged(accepted.value + 1)]);
    }

    expect(await currentSeat()).toBe(fateHolder);
    const initialMarket = fateHolder.page.getByTestId('chronicle-row').getByRole('button');
    await expect(initialMarket).toHaveCount(5);
    const affordableCard = initialMarket.filter({ hasText: /· [23] Influence/ }).first();
    const affordableText = await affordableCard.textContent() ?? '';
    const cycledName = affordableText.split(' · ')[0].trim();
    const cycledCost = Number(affordableText.match(/· (\d+) Influence/)?.[1] ?? '-1');
    const cycleButtonName = `Cycle ${cycledName} · ${cycledCost} Influence`;
    const expensiveCard = initialMarket.filter({ hasText: /· [456] Influence/ }).first();
    const expensiveName = ((await expensiveCard.textContent()) ?? '').split(' · ')[0].trim();
    expect(cycledName).not.toBe('');
    expect(cycledCost).toBeGreaterThanOrEqual(2);
    expect(cycledCost).toBeLessThanOrEqual(3);
    const cycledInstanceId = await affordableCard.getAttribute('data-card-instance-id');
    const cycledPosition = await affordableCard.evaluate((card) =>
      Array.from(card.parentElement?.children ?? []).indexOf(card)
    );
    const initialInstanceIds = await initialMarket.evaluateAll((cards) => cards.map((card) => card.getAttribute('data-card-instance-id')));
    expect(cycledInstanceId).toBeTruthy();
    await steps.gesture(fateHolder.page, 'play-long-memory', `${fateHolder.name} plays Long Memory`, async () => {
      await fateHolder.page.getByRole('button', { name: 'Play Long Memory · Cycle a Chronicle card costing 3 or less · refill the Row' }).click(); accepted.value += 1;
    }, [
      { spec: 'The Fate identity becomes public and an affordable Chronicle choice opens', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('fate-discard')).toContainText('1 cards');
          await expect(observer.page.getByTestId('activity-log')).toContainText('plays Long Memory');
        }
        await expect(fateHolder.page.getByRole('heading', { name: 'Which Chronicle card will you cycle?' })).toBeVisible();
        await expect(fateHolder.page.getByRole('button', { name: cycleButtonName }).first()).toBeEnabled();
        expect(expensiveName).not.toBe('');
        await expect(fateHolder.page.getByRole('button', { name: new RegExp(`^Cycle ${expensiveName}`) })).toHaveCount(0);
      } },
      { spec: 'Observers see the public choice but cannot make it for the actor', check: async () => {
        for (const observer of seats.filter((seat) => seat !== fateHolder)) {
          await expect(observer.page.getByRole('button', { name: cycleButtonName }).first()).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(fateHolder.page, 'reload-memory-choice', `${fateHolder.name} reloads during the Chronicle choice`, async () => {
      await reloadGameClient(fateHolder.page);
    }, [
      { spec: 'The exact public options and actor authority survive immutable replay', check: async () => {
        await expect(fateHolder.page.getByRole('heading', { name: 'Which Chronicle card will you cycle?' })).toBeVisible();
        await expect(fateHolder.page.getByRole('button', { name: cycleButtonName }).first()).toBeEnabled();
      } },
      converged(accepted.value)
    ]);
    await steps.gesture(fateHolder.page, 'cycle-bree-guide', `${fateHolder.name} cycles one physical ${cycledName}`, async () => {
      await fateHolder.page.getByRole('button', { name: cycleButtonName }).first().click(); accepted.value += 1;
    }, [
      { spec: 'Every browser sees five Row cards, the exact positional refill, and twenty-five cards in the deck', check: async () => {
        for (const observer of seats) {
          const observerMarket = observer.page.getByTestId('chronicle-row').getByRole('button');
          await expect(observerMarket).toHaveCount(5);
          await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 45');
          for (let position = 0; position < initialInstanceIds.length; position += 1) {
            if (position === cycledPosition) await expect(observerMarket.nth(position)).not.toHaveAttribute('data-card-instance-id', cycledInstanceId!);
            else await expect(observerMarket.nth(position)).toHaveAttribute('data-card-instance-id', initialInstanceIds[position]!);
          }
        }
      } },
      { spec: 'The selected physical instance left the Row and the same Agent turn resumed', check: async () => {
        await expect(fateHolder.page.getByTestId('chronicle-row').locator(`[data-card-instance-id="${cycledInstanceId}"]`)).toHaveCount(0);
        await expect(fateHolder.page.getByRole('button', { name: 'Reveal remaining hand' })).toBeVisible();
        await expect(fateHolder.page.locator('footer')).toContainText(`Current actor ${fateHolder.name}`);
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(fateHolder.page, 'select-resumed-card', `${fateHolder.name} selects The Open Road after Long Memory`, async () => {
      await fateHolder.page.getByTestId('private-hand').getByRole('button', { name: /^The Open Road/ }).first().click();
    }, [{ spec: 'A real Roads destination is enabled in the resumed turn', check: async () => await expect(fateHolder.page.getByTestId('space-take-war-effort')).toBeEnabled() }]);
    await steps.gesture(fateHolder.page, 'continue-agent-turn', `${fateHolder.name} continues to Take Up a War Effort`, async () => {
      await fateHolder.page.getByTestId('space-take-war-effort').click(); accepted.value += 1;
    }, [
      { spec: 'The remaining Agent resolves a real board reward for every observer', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-take-war-effort')).toContainText(fateHolder.name);
          await expect(row(observer, fateHolder.name)).toContainText('Agents0');
          await expect(row(observer, fateHolder.name)).toContainText('Gold2');
        }
      } },
      converged(accepted.value + 1)
    ]);
    steps.generateDocs(
      'Long Memory Plot Fate tracer',
      'Three isolated humans draw private Long Memory through Hall of Fire, expose only affordable public Chronicle choices, reload the pending authority, move one exact physical card beneath the deck, refill its Row position, and continue the same real Agent turn.'
    );
  } finally {
    await table.close();
  }
});
