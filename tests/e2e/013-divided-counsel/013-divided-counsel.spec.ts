import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Divided Counsel gives an opponent a private out-of-turn hand-reveal decision', async ({ browser, page }, testInfo) => {
  test.setTimeout(300_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'divided-10', { phone: 'DIVPH', desktop: 'DIVDS' });
  const { seats, accepted, converged, currentSeat, row } = table;

  try {
    const fateHolder = await currentSeat();
    await steps.gesture(fateHolder.page, 'select-hall-card', `${fateHolder.name} selects Armed Escort`, async () => {
      await fateHolder.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).last().click();
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
        for (const observer of seats.filter((seat) => seat !== fateHolder)) await expect(observer.page.getByText('Divided Counsel')).toHaveCount(0);
      } },
      converged(accepted.value + 1)
    ]);

    const target = await currentSeat();
    await steps.gesture(target.page, 'target-select-mission', `${target.name} selects Diplomatic Mission`, async () => {
      await target.page.getByTestId('private-hand').getByRole('button', { name: /^Diplomatic Mission/ }).click();
    }, [{ spec: 'The real faction card enables Tribute to the Shadow', check: async () => await expect(target.page.getByTestId('space-tribute-shadow')).toBeEnabled() }]);
    await steps.gesture(target.page, 'target-takes-tribute', `${target.name} takes Tribute to the Shadow`, async () => {
      await target.page.getByTestId('space-tribute-shadow').click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees the target gain 2 Gold and occupy Tribute', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-tribute-shadow')).toContainText(target.name);
          await expect(row(observer, target.name)).toContainText('Gold2');
        }
      } },
      converged(accepted.value + 1)
    ]);

    const third = await currentSeat();
    await steps.gesture(third.page, 'third-select-escort', `${third.name} selects Armed Escort`, async () => {
      await third.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [{ spec: 'The Council icon enables Muster the Free Peoples', check: async () => await expect(third.page.getByTestId('space-muster-free-peoples')).toBeEnabled() }]);
    await steps.gesture(third.page, 'third-musters', `${third.name} Musters the Free Peoples`, async () => {
      await third.page.getByTestId('space-muster-free-peoples').click(); accepted.value += 1;
    }, [
      { spec: 'The public board shows the Agent and recruited Companies before the optional payment', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-muster-free-peoples')).toContainText(third.name);
          await expect(row(observer, third.name)).toContainText('Garrison6');
        }
        await expect(third.page.getByTestId('pending-choice')).toHaveCount(0);
        await expect(fateHolder.page.locator('footer')).toContainText(`Current actor ${fateHolder.name}`);
      } },
      converged(accepted.value + 1)
    ]);

    expect(await currentSeat()).toBe(fateHolder);
    const targetHandNames = await target.page.getByTestId('private-hand').locator('strong').allTextContents();
    expect(targetHandNames.length).toBeGreaterThan(0);
    await steps.gesture(fateHolder.page, 'play-divided-counsel', `${fateHolder.name} plays Divided Counsel`, async () => {
      await fateHolder.page.getByRole('button', { name: 'Play Divided Counsel · Choose an opponent · they lose 1 Gold or reveal their hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'The Fate card becomes public and asks its owner to choose one real opponent', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('fate-discard')).toContainText('1 cards');
        await expect(fateHolder.page.getByRole('heading', { name: 'Whose counsel will you divide?' })).toBeVisible();
        await expect(fateHolder.page.getByRole('button', { name: `Choose ${target.name}` })).toBeEnabled();
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(fateHolder.page, 'choose-opponent', `${fateHolder.name} chooses ${target.name}`, async () => {
      await fateHolder.page.getByRole('button', { name: `Choose ${target.name}` }).click(); accepted.value += 1;
    }, [
      { spec: 'The chosen opponent receives both legal responses out of turn', check: async () => {
        await expect(target.page.getByRole('heading', { name: 'Lose Gold or reveal your hand?' })).toBeVisible();
        await expect(target.page.getByRole('button', { name: 'Lose 1 Gold' })).toBeEnabled();
        await expect(target.page.getByRole('button', { name: 'Reveal hand to Fate player' })).toBeEnabled();
      } },
      { spec: 'No other browser can answer for the chosen opponent', check: async () => {
        for (const observer of seats.filter((seat) => seat !== target)) await expect(observer.page.getByRole('button', { name: 'Reveal hand to Fate player' })).toBeDisabled();
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(target.page, 'reveal-hand', `${target.name} reveals their hand to ${fateHolder.name}`, async () => {
      await target.page.getByRole('button', { name: 'Reveal hand to Fate player' }).click(); accepted.value += 1;
    }, [
      { spec: 'The Fate holder sees every exact card in the revealed hand', check: async () => {
        const revealed = fateHolder.page.getByTestId('revealed-hand');
        for (const cardName of targetHandNames) await expect(revealed).toContainText(cardName);
      } },
      { spec: 'Every other browser sees only the correct number of opaque cards', check: async () => {
        for (const observer of seats.filter((seat) => seat !== fateHolder)) {
          const items = observer.page.getByTestId('revealed-hand').getByRole('listitem');
          await expect(items).toHaveCount(targetHandNames.length);
          for (let index = 0; index < targetHandNames.length; index += 1) await expect(items.nth(index)).toHaveText('Private card');
          await expect(observer.page.getByRole('button', { name: 'Finish reviewing hand' })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(fateHolder.page, 'reload-private-review', `${fateHolder.name} reloads while reviewing the hand`, async () => {
      await reloadGameClient(fateHolder.page);
    }, [
      { spec: 'The private reveal authority and exact identities survive immutable replay', check: async () => {
        const revealed = fateHolder.page.getByTestId('revealed-hand');
        for (const cardName of targetHandNames) await expect(revealed).toContainText(cardName);
        await expect(fateHolder.page.getByRole('button', { name: 'Finish reviewing hand' })).toBeEnabled();
      } },
      converged(accepted.value)
    ]);
    await steps.gesture(fateHolder.page, 'finish-review', `${fateHolder.name} finishes reviewing the hand`, async () => {
      await fateHolder.page.getByRole('button', { name: 'Finish reviewing hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'The private reveal closes without changing the opponent’s Gold', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('revealed-hand')).toHaveCount(0);
          await expect(row(observer, target.name)).toContainText('Gold2');
        }
      } },
      { spec: 'The Fate holder resumes the interrupted Agent turn', check: async () => {
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
          await expect(row(observer, fateHolder.name)).toContainText('Gold2');
        }
      } },
      converged(accepted.value + 1)
    ]);
    steps.generateDocs(
      'Divided Counsel Plot Fate tracer',
      'Three isolated human browsers draw private Divided Counsel, take ordinary Agent actions, choose a funded opponent, let that opponent reveal by click out of turn, enforce the hand identity boundary, reload the private review, and prove the interrupted Agent turn resumes. Reducer tests separately execute the lose-Gold branch.'
    );
  } finally {
    await table.close();
  }
});
