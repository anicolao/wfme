import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Galadriel privately chooses one of two Fate cards only once each round', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'gal-17',
    { phone: 'FORES', desktop: 'LIGHT' }
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const counter = (observer: (typeof seats)[number], playerName: string, label: string) =>
    row(observer, playerName).getByText(label, { exact: true }).locator('..');
  const foresightEntries = (observer: (typeof seats)[number]) =>
    observer.page.getByTestId('activity-log').locator('li').filter({ hasText: 'top two Fate cards with Foresight' });

  try {
    const galadriel = await currentSeat();
    expect(galadriel.name).toBe('Rin');
    const escort = galadriel.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ });

    await steps.gesture(galadriel.page, 'select-escort', `${galadriel.name} selects Armed Escort`, async () => {
      await escort.click();
    }, [
      { spec: 'The physical Council card enables Hall of Fire', check: async () => {
        await expect(galadriel.page.getByTestId('space-hall-fire')).toBeEnabled();
      } }
    ]);

    await steps.gesture(galadriel.page, 'enter-hall', `${galadriel.name} enters the Hall of Fire`, async () => {
      await galadriel.page.getByTestId('space-hall-fire').click(); accepted.value += 1;
    }, [
      { spec: 'The Fate draw stops at Galadriel’s private once-per-round Foresight decision', check: async () => {
        await expect(galadriel.page.getByRole('heading', { name: 'Which Fate does Galadriel foresee?' })).toBeVisible();
        await expect(galadriel.page.getByRole('button', { name: 'Take Lore Beyond Price' })).toBeEnabled();
        await expect(galadriel.page.getByRole('button', { name: 'Take Keeper of Oaths' })).toBeEnabled();
        await expect(counter(galadriel, galadriel.name, 'Fate')).toContainText('0');
      } },
      { spec: 'Observers see two opaque disabled options and neither private identity', check: async () => {
        for (const observer of seats.filter((seat) => seat !== galadriel)) {
          await expect(observer.page.getByRole('button', { name: 'Private Fate option 1' })).toBeDisabled();
          await expect(observer.page.getByRole('button', { name: 'Private Fate option 2' })).toBeDisabled();
          await expect(observer.page.getByRole('button', { name: /Lore Beyond Price|Keeper of Oaths/ })).toHaveCount(0);
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(galadriel.page, 'reload-foresight', `${galadriel.name} reloads the private Foresight choice`, async () => {
      await reloadGameClient(galadriel.page);
    }, [
      { spec: 'Replay restores the same two exact private options before any Fate enters hand', check: async () => {
        await expect(galadriel.page.getByRole('button', { name: 'Take Lore Beyond Price' })).toBeEnabled();
        await expect(galadriel.page.getByRole('button', { name: 'Take Keeper of Oaths' })).toBeEnabled();
        await expect(counter(galadriel, galadriel.name, 'Fate')).toContainText('0');
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(galadriel.page, 'take-keeper', `${galadriel.name} takes Keeper of Oaths`, async () => {
      await galadriel.page.getByRole('button', { name: 'Take Keeper of Oaths' }).click(); accepted.value += 1;
    }, [
      { spec: 'Exactly one private Fate enters Galadriel’s hand and the unchosen card is bottom-decked, not discarded', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, galadriel.name, 'Fate')).toContainText('1');
          await expect(observer.page.getByTestId('fate-discard')).toContainText('0 cards');
          await expect(observer.page.getByTestId('activity-log')).toContainText('puts the other on the bottom of the Fate deck');
        }
      } },
      { spec: 'The private choice closes and ordinary turn authority advances', check: async () => {
        await expect(galadriel.page.getByTestId('pending-choice')).toHaveCount(0);
        await expect(galadriel.page.locator('footer')).not.toContainText(`Current actor ${galadriel.name}`);
      } },
      converged(accepted.value + 1)
    ]);

    for (let turn = 0; turn < 2; turn += 1) {
      const actor = await currentSeat();
      expect(actor.name).not.toBe(galadriel.name);
      await steps.gesture(actor.page, `reveal-${turn + 1}`, `${actor.name} Reveals`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'The public Muster row belongs to the acting human', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`);
        } },
        converged(accepted.value + 1)
      ]);
      await steps.gesture(actor.page, `finish-reveal-${turn + 1}`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [
        { spec: 'Authority advances through the ordinary shared turn order', check: async () => {
          await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
        } },
        converged(accepted.value + 1)
      ]);
    }

    expect((await currentSeat()).name).toBe(galadriel.name);
    const mission = galadriel.page.getByTestId('private-hand').getByRole('button', { name: /^Diplomatic Mission/ });
    await steps.gesture(galadriel.page, 'select-mission', `${galadriel.name} selects Diplomatic Mission`, async () => {
      await mission.click();
    }, [
      { spec: 'The physical Elven card enables Hidden Counsel', check: async () => {
        await expect(galadriel.page.getByTestId('space-hidden-counsel')).toBeEnabled();
      } }
    ]);

    await steps.gesture(galadriel.page, 'enter-hidden-counsel', `${galadriel.name} enters Hidden Counsel`, async () => {
      await galadriel.page.getByTestId('space-hidden-counsel').click(); accepted.value += 1;
    }, [
      { spec: 'The second Fate draw in the same round resolves normally without another Commander choice', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, galadriel.name, 'Fate')).toContainText('2');
          await expect(counter(observer, galadriel.name, 'Elven')).toContainText('1');
          await expect(foresightEntries(observer)).toHaveCount(1);
        }
        await expect(galadriel.page.getByTestId('pending-choice')).toHaveCount(0);
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(galadriel.page, 'reload-used-foresight', `${galadriel.name} reloads after the ordinary second draw`, async () => {
      await reloadGameClient(galadriel.page);
    }, [
      { spec: 'Replay preserves two Fate cards, one Foresight trigger, and no unresolved choice', check: async () => {
        await expect(counter(galadriel, galadriel.name, 'Fate')).toContainText('2');
        await expect(counter(galadriel, galadriel.name, 'Elven')).toContainText('1');
        await expect(foresightEntries(galadriel)).toHaveCount(1);
        await expect(galadriel.page.getByTestId('pending-choice')).toHaveCount(0);
        await expect(galadriel.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Galadriel — Foresight',
      'Three isolated humans select Galadriel, draw through Hall of Fire, prove that only she can identify and choose one of the top two physical Fate cards, reload the pending choice, put the unchosen card on the exact deck bottom without discarding it, and later draw Fate again in the same round without repeating the once-per-round power.'
    );
  } finally {
    await table.close();
  }
});
