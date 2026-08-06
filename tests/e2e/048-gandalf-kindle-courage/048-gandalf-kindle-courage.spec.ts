import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Gandalf recruits through Kindle Courage only with the uniquely smallest garrison', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'gandalf-kindle-1',
    { phone: 'KINDP', desktop: 'KINDD' },
    ['Gandalf', 'Aragorn', 'Galadriel']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const counter = (observer: (typeof seats)[number], playerName: string, label: string) =>
    row(observer, playerName).getByText(label, { exact: true }).locator('..');

  try {
    const gandalf = await currentSeat();
    expect(gandalf.name).toBe('Mara');
    const escort = gandalf.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ });

    await steps.gesture(gandalf.page, 'select-armed-escort', `${gandalf.name} selects Armed Escort`, async () => {
      await escort.click();
    }, [{ spec: 'The physical Stronghold card enables the real Minas Tirith Battle destination', check: async () => {
      await expect(gandalf.page.getByTestId('space-minas-tirith')).toBeEnabled();
    } }]);

    await steps.gesture(gandalf.page, 'enter-minas-tirith', `${gandalf.name} enters Minas Tirith`, async () => {
      await gandalf.page.getByTestId('space-minas-tirith').click();
      accepted.value += 1;
    }, [
      { spec: 'Armed Escort and Minas Tirith recruit exactly two finite Companies before deployment', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, gandalf.name, 'Garrison')).toContainText('5');
          await expect(counter(observer, gandalf.name, 'Supply')).toContainText('7');
          await expect(counter(observer, gandalf.name, 'Hand')).toContainText('5');
        }
      } },
      { spec: 'The ordinary Battle window permits four Companies and remains owner-authorized', check: async () => {
        await expect(gandalf.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
        await expect(gandalf.page.getByRole('button', { name: 'Deploy 4', exact: true })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== gandalf)) {
          await expect(observer.page.getByRole('button', { name: 'Deploy 4', exact: true })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(gandalf.page, 'deploy-four', `${gandalf.name} deploys four Companies`, async () => {
      await gandalf.page.getByRole('button', { name: 'Deploy 4', exact: true }).click();
      accepted.value += 1;
    }, [
      { spec: 'Four exact Companies move to the active Battle and leave Gandalf alone at one garrison Company', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, gandalf.name, 'Garrison')).toContainText('1');
          const force = observer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: gandalf.name });
          await expect(force).toContainText('4 Companies');
        }
      } },
      { spec: 'Both opponents still hold three garrison Companies, making Gandalf strictly lowest', check: async () => {
        for (const observer of seats) {
          for (const opponent of seats.filter((seat) => seat !== gandalf)) {
            await expect(counter(observer, opponent.name, 'Garrison')).toContainText('3');
          }
        }
      } },
      converged(accepted.value + 1)
    ]);

    for (let turn = 0; turn < 2; turn += 1) {
      const actor = await currentSeat();
      expect(actor.name).not.toBe(gandalf.name);
      await steps.gesture(actor.page, `other-reveal-${turn + 1}`, `${actor.name} Reveals`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click();
        accepted.value += 1;
      }, [
        { spec: 'The public Muster row belongs to the acting human while Gandalf’s Battle force remains deployed', check: async () => {
          for (const observer of seats) {
            await expect(observer.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`);
            const force = observer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: gandalf.name });
            await expect(force).toContainText('4 Companies');
          }
        } },
        converged(accepted.value + 1)
      ]);
      await steps.gesture(actor.page, `other-finish-${turn + 1}`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click();
        accepted.value += 1;
      }, [
        { spec: 'Authority advances without changing any of the three garrisons', check: async () => {
          await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
          for (const observer of seats) {
            await expect(counter(observer, gandalf.name, 'Garrison')).toContainText('1');
            for (const opponent of seats.filter((seat) => seat !== gandalf)) {
              await expect(counter(observer, opponent.name, 'Garrison')).toContainText('3');
            }
          }
        } },
        converged(accepted.value + 1)
      ]);
    }

    expect((await currentSeat()).name).toBe(gandalf.name);
    const token = gandalf.page.getByTestId('private-hand').getByRole('button', { name: /^Token of Command/ });
    await steps.gesture(gandalf.page, 'select-token', `${gandalf.name} selects Token of Command`, async () => {
      await token.click();
    }, [{ spec: 'Gandalf’s active Ring card enables its printed Roads destination', check: async () => {
      await expect(gandalf.page.getByTestId('space-take-war-effort')).toBeEnabled();
    } }]);

    await steps.gesture(gandalf.page, 'place-token', `${gandalf.name} sends Token of Command to Take Up a War Effort`, async () => {
      await gandalf.page.getByTestId('space-take-war-effort').click();
      accepted.value += 1;
    }, [
      { spec: 'The Agent is committed before either Kindle Courage or the destination changes cards and Gold', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-take-war-effort')).toContainText(`Agent · ${gandalf.name}`);
          await expect(counter(observer, gandalf.name, 'Hand')).toContainText('4');
          await expect(counter(observer, gandalf.name, 'Gold')).toContainText('0');
        }
      } },
      { spec: 'Only Gandalf can order Kindle Courage before or after the destination', check: async () => {
        await expect(gandalf.page.getByRole('heading', { name: 'When will Kindle Courage?' })).toBeVisible();
        await expect(gandalf.page.getByRole('button', { name: 'Ring ability first' })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== gandalf)) {
          await expect(observer.page.getByRole('button', { name: 'Ring ability first' })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(gandalf.page, 'ring-first', `${gandalf.name} resolves Kindle Courage first`, async () => {
      await gandalf.page.getByRole('button', { name: 'Ring ability first' }).click();
      accepted.value += 1;
    }, [
      { spec: 'The exact one-versus-three-versus-three garrisons expose both printed Kindle Courage branches', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByRole('heading', { name: 'How will Gandalf kindle courage?' })).toBeVisible();
          await expect(observer.page.getByRole('button', { name: 'Draw 1 Fate' })).toBeVisible();
          await expect(observer.page.getByRole('button', { name: 'Recruit 2 Companies' })).toBeVisible();
        }
      } },
      { spec: 'Only Gandalf can choose either branch', check: async () => {
        await expect(gandalf.page.getByRole('button', { name: 'Recruit 2 Companies' })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== gandalf)) {
          await expect(observer.page.getByRole('button', { name: 'Draw 1 Fate' })).toBeDisabled();
          await expect(observer.page.getByRole('button', { name: 'Recruit 2 Companies' })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(gandalf.page, 'reload-kindle-choice', `${gandalf.name} reloads the pending Kindle Courage choice`, async () => {
      await reloadGameClient(gandalf.page);
    }, [
      { spec: 'Replay restores both exact branches without resolving the Ring or destination early', check: async () => {
        await expect(gandalf.page.getByRole('heading', { name: 'How will Gandalf kindle courage?' })).toBeVisible();
        await expect(gandalf.page.getByRole('button', { name: 'Recruit 2 Companies' })).toBeEnabled();
        await expect(counter(gandalf, gandalf.name, 'Garrison')).toContainText('1');
        await expect(counter(gandalf, gandalf.name, 'Hand')).toContainText('4');
        await expect(counter(gandalf, gandalf.name, 'Gold')).toContainText('0');
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(gandalf.page, 'recruit-two', `${gandalf.name} recruits two Companies with Kindle Courage`, async () => {
      await gandalf.page.getByRole('button', { name: 'Recruit 2 Companies' }).click();
      accepted.value += 1;
      await row(gandalf, gandalf.name).evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
    }, [
      { spec: 'Exactly two finite Companies move from supply to Gandalf’s garrison', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, gandalf.name, 'Garrison')).toContainText('3');
          await expect(counter(observer, gandalf.name, 'Supply')).toContainText('5');
          await expect(observer.page.getByTestId('activity-log').locator('li').filter({ hasText: 'Gandalf recruits 2 Companies with Kindle Courage.' })).toHaveCount(1);
        }
      } },
      { spec: 'Only after the Ring resolves, the queued destination draws one card and grants exactly two Gold', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, gandalf.name, 'Hand')).toContainText('5');
          await expect(counter(observer, gandalf.name, 'Gold')).toContainText('2');
        }
        const ringIndex = await gandalf.page.getByTestId('activity-log').locator('li').allTextContents();
        expect(ringIndex.findIndex((entry) => entry.includes('recruits 2 Companies with Kindle Courage')))
          .toBeLessThan(ringIndex.findIndex((entry) => entry.includes('sends an Agent to Take Up a War Effort')));
      } },
      { spec: 'The four previously deployed Battle Companies remain conserved', check: async () => {
        for (const observer of seats) {
          const force = observer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: gandalf.name });
          await expect(force).toContainText('4 Companies');
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(gandalf.page, 'reload-kindle-result', `${gandalf.name} reloads the completed Kindle Courage turn`, async () => {
      await reloadGameClient(gandalf.page);
      await row(gandalf, gandalf.name).evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
    }, [
      { spec: 'Immutable replay preserves four deployed, three garrison, five supply, five hand, two Gold, and no Fate draw', check: async () => {
        await expect(counter(gandalf, gandalf.name, 'Garrison')).toContainText('3');
        await expect(counter(gandalf, gandalf.name, 'Supply')).toContainText('5');
        await expect(counter(gandalf, gandalf.name, 'Hand')).toContainText('5');
        await expect(counter(gandalf, gandalf.name, 'Gold')).toContainText('2');
        await expect(counter(gandalf, gandalf.name, 'Fate')).toContainText('0');
        const force = gandalf.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: gandalf.name });
        await expect(force).toContainText('4 Companies');
        await expect(gandalf.page.getByTestId('activity-log').locator('li').filter({ hasText: 'Gandalf recruits 2 Companies with Kindle Courage.' })).toHaveCount(1);
        await expect(gandalf.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Gandalf — Kindle Courage',
      'Three isolated humans select Gandalf, deploy four physical Companies into the active Battle to create a uniquely smallest garrison, return to a physical Token of Command after two ordinary Reveals, choose and reload Ring-first authority, recruit exactly two finite Companies, resume the queued destination, and reload the conserved Firebase result.'
    );
  } finally {
    await table.close();
  }
});
