import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Gandalf draws once after acquiring a five-Influence Chronicle card', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'master-e2e-6',
    { phone: 'WIZLP', desktop: 'WIZLD' },
    ['Aragorn', 'Gandalf', 'Galadriel']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const counter = (observer: (typeof seats)[number], playerName: string, label: string) =>
    row(observer, playerName).getByText(label, { exact: true }).locator('..');

  try {
    const gandalf = await currentSeat();
    expect(gandalf.name).toBe('Rin');
    const escort = gandalf.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ });

    await steps.gesture(gandalf.page, 'select-armed-escort', `${gandalf.name} selects Armed Escort`, async () => {
      await escort.click();
    }, [{ spec: 'The physical Council card enables the real Hall of Fire destination', check: async () => {
      await expect(gandalf.page.getByTestId('space-hall-fire')).toBeEnabled();
    } }]);

    await steps.gesture(gandalf.page, 'visit-hall-fire', `${gandalf.name} visits the Hall of Fire`, async () => {
      await gandalf.page.getByTestId('space-hall-fire').click();
      accepted.value += 1;
    }, [
      { spec: 'The Hall is occupied and draws exactly one private Fate without invoking an inactive Ring', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-hall-fire')).toContainText(`Agent · ${gandalf.name}`);
          await expect(counter(observer, gandalf.name, 'Fate')).toContainText('1');
          await expect(counter(observer, gandalf.name, 'Hand')).toContainText('4');
          await expect(observer.page.getByRole('heading', { name: 'Which Fate does Galadriel foresee?' })).toHaveCount(0);
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
        { spec: 'The public Muster row belongs to the acting human', check: async () => {
          for (const observer of seats) {
            await expect(observer.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`);
          }
        } },
        converged(accepted.value + 1)
      ]);
      await steps.gesture(actor.page, `other-finish-${turn + 1}`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click();
        accepted.value += 1;
      }, [
        { spec: 'Canonical authority advances while Gandalf’s four-card hand remains private', check: async () => {
          await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
          for (const observer of seats) await expect(counter(observer, gandalf.name, 'Hand')).toContainText('4');
        } },
        converged(accepted.value + 1)
      ]);
    }

    expect((await currentSeat()).name).toBe(gandalf.name);
    await steps.gesture(gandalf.page, 'gandalf-reveal', `${gandalf.name} Reveals exactly five Influence`, async () => {
      await gandalf.page.getByRole('button', { name: 'Reveal remaining hand' }).click();
      accepted.value += 1;
    }, [
      { spec: 'Four physical starting cards plus the occupied Hall produce exactly five public Influence', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('reveal-panel').getByRole('heading', { name: `${gandalf.name} Reveals` })).toBeVisible();
          await expect(observer.page.getByTestId('reveal-panel').locator('.muster-row article')).toHaveCount(4);
          await expect(observer.page.getByTestId('reveal-panel')).toContainText('5 Influence remaining');
          await expect(counter(observer, gandalf.name, 'Hand')).toContainText('0');
        }
      } },
      { spec: 'The exact five-cost Master of Lake-town is affordable in the shared Chronicle Row', check: async () => {
        await expect(gandalf.page.getByTestId('chronicle-row').getByRole('button', { name: /^Master of Lake-town/ })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== gandalf)) {
          await expect(observer.page.getByTestId('chronicle-row').getByRole('button', { name: /^Master of Lake-town/ })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(gandalf.page, 'acquire-master', `${gandalf.name} acquires Master of Lake-town`, async () => {
      await gandalf.page.getByTestId('chronicle-row').getByRole('button', { name: /^Master of Lake-town/ }).click();
      accepted.value += 1;
      await gandalf.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ })
        .evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
    }, [
      { spec: 'The exact five-cost card enters discard and its public Row position refills', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 48');
          await expect(counter(observer, gandalf.name, 'Discard')).toContainText('1');
          await expect(observer.page.getByTestId('activity-log')).toContainText(`${gandalf.name} acquires Master of Lake-town from the Chronicle Row for 5 Influence and refills its place.`);
        }
      } },
      { spec: 'A Wizard Is Never Late draws exactly one physical deck card after the acquisition', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, gandalf.name, 'Hand')).toContainText('1');
          await expect(observer.page.getByTestId('activity-log').locator('li').filter({ hasText: 'A Wizard Is Never Late' })).toHaveCount(1);
        }
        await expect(gandalf.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ })).toHaveCount(1);
      } },
      { spec: 'The drawn identity remains absent from the other humans’ empty post-Reveal private hands', check: async () => {
        for (const observer of seats.filter((seat) => seat !== gandalf)) {
          await expect(observer.page.getByTestId('private-hand').getByRole('button')).toHaveCount(0);
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(gandalf.page, 'reload-acquisition', `${gandalf.name} reloads the completed acquisition`, async () => {
      await reloadGameClient(gandalf.page);
      await gandalf.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ })
        .evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
    }, [
      { spec: 'Replay restores the one-card private draw, exact discard count, refill, and single Commander trigger', check: async () => {
        await expect(counter(gandalf, gandalf.name, 'Hand')).toContainText('1');
        await expect(counter(gandalf, gandalf.name, 'Discard')).toContainText('1');
        await expect(gandalf.page.getByTestId('chronicle-market')).toContainText('deck 48');
        await expect(gandalf.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ })).toHaveCount(1);
        await expect(gandalf.page.getByTestId('activity-log').locator('li').filter({ hasText: 'A Wizard Is Never Late' })).toHaveCount(1);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Gandalf — A Wizard Is Never Late',
      'Three isolated humans select Gandalf, use a physical Council card at the Hall of Fire, Reveal exactly five Influence, acquire the exact Master of Lake-town from the shared Chronicle Row, verify that the Row refills before Gandalf draws exactly one private physical card, and reload the conserved Firebase result.'
    );
  } finally {
    await table.close();
  }
});
