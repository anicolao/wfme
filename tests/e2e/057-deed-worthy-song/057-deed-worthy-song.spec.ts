import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Deed Worthy of Song costs nine Influence, grants Renown, and weakens the deck', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser, page, testInfo, steps, 'deed-worthy-9',
    { phone: 'DEEDP', desktop: 'DEEDD' },
    ['Aragorn', 'Treebeard', 'Gandalf']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const mara = seats[0];
  let gesture = 0;
  let setupCardAcquired = false;
  let deedAcquired = false;
  let weakRevealProved = false;
  let renownBefore = 0;
  let discardBefore = 0;

  const value = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await row(observer, player.name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const visible = async (locator: Locator) => await locator.count() > 0 ? locator.first() : null;
  const record = async (actor: PlotSeat, id: string, description: string, action: () => Promise<void>, checks: Parameters<TestStepHelper['gesture']>[4] = []) => {
    gesture += 1;
    await steps.gesture(actor.page, `${id}-${gesture}`, description, action, [...checks, converged(accepted.value + 1)]);
  };

  try {
    for (let guard = 0; guard < 220 && !weakRevealProved; guard += 1) {
      const actor = await currentSeat();
      const ringFirst = await visible(actor.page.getByRole('button', { name: 'Ring ability first', exact: true }));
      if (ringFirst) {
        await record(actor, 'ring-first', `${actor.name} resolves an incidental Ring before the economy route`, async () => {
          await ringFirst.click(); accepted.value += 1;
        });
        continue;
      }
      const standing = await visible(actor.page.getByRole('button', { name: /^Gain 1 (shadow|dwarven|elven|wild) standing$/ }));
      if (standing) {
        await record(actor, 'ring-standing', `${actor.name} resolves the incidental Ring standing`, async () => {
          await standing.click(); accepted.value += 1;
        });
        continue;
      }
      const keepSeek = await visible(actor.page.getByRole('button', { name: 'Keep Seek Allies' }));
      if (keepSeek) {
        await record(actor, 'keep-seek', `${actor.name} keeps Seek Allies`, async () => {
          await keepSeek.click(); accepted.value += 1;
        });
        continue;
      }
      const keepMasterGold = await visible(actor.page.getByRole('button', { name: 'Keep the Gold' }));
      if (keepMasterGold) {
        await record(actor, 'keep-master-gold', `${actor.name} keeps the Master’s optional Fate payment`, async () => {
          await keepMasterGold.click(); accepted.value += 1;
        });
        continue;
      }
      const scoutChoice = actor.page.getByTestId('scout-network').getByRole('button').filter({ hasNotText: 'Scout ·' }).first();
      if (await actor.page.getByRole('heading', { name: /(?:Choose|Where).*(?:post|Scout)/i }).count() > 0) {
        await record(actor, 'place-scout', `${actor.name} places the incidental Scout`, async () => {
          await scoutChoice.click(); accepted.value += 1;
        });
        continue;
      }

      const finish = await visible(actor.page.getByRole('button', { name: 'Finish Reveal' }));
      if (finish) {
        const influenceText = await actor.page.getByTestId('reveal-panel').locator('.reveal-total').textContent();
        const influence = Number(influenceText?.match(/(\d+) Influence/)?.[1] ?? 0);
        const deed = actor.page.getByRole('button', { name: /^Deed Worthy of Song/ });
        if (actor === mara && !deedAcquired && influence >= 9) {
          renownBefore = await value(mara, mara, 'Renown');
          discardBefore = await value(mara, mara, 'Discard');
          await record(mara, 'acquire-deed', `${mara.name} acquires Deed Worthy of Song`, async () => {
            await deed.click(); accepted.value += 1; deedAcquired = true;
          }, [
            { spec: 'Exactly nine real Reveal Influence is spent', check: async () => await expect(mara.page.getByTestId('reveal-panel')).toContainText(`${influence - 9} Influence remaining`) },
            { spec: 'The finite Reserve falls from ten to nine for every observer', check: async () => {
              for (const observer of seats) await expect(observer.page.getByRole('button', { name: /^Deed Worthy of Song/ })).toContainText('9 remain · gain 1 Renown');
            } },
            { spec: 'The acquisition immediately grants exactly one public Renown', check: async () => {
              for (const observer of seats) expect(await value(observer, mara, 'Renown')).toBe(renownBefore + 1);
            } },
            { spec: 'The physical Deed enters Mara’s private discard pile', check: async () => {
              for (const observer of seats) expect(await value(observer, mara, 'Discard')).toBe(discardBefore + 1);
            } }
          ]);
          continue;
        }
        const master = actor.page.getByRole('button', { name: /^Master of Lake-town/ });
        if (actor === mara && !setupCardAcquired && !deedAcquired && influence >= 5 && await master.isEnabled()) {
          await record(mara, 'acquire-master', `${mara.name} first strengthens the deck with Master of Lake-town`, async () => {
            await master.click(); accepted.value += 1; setupCardAcquired = true;
          }, [
            { spec: 'A normal Chronicle acquisition supplies the high-Influence card needed to reach the premium Reserve', check: async () => await expect(mara.page.getByTestId('reveal-panel')).toContainText(`${influence - 5} Influence remaining`) }
          ]);
          continue;
        }
        const weakCard = actor.page.getByTestId('reveal-panel').locator('.muster-row article').filter({ hasText: 'Deed Worthy of Song' });
        if (actor === mara && deedAcquired && await weakCard.count() > 0) {
          await steps.observe(mara.page, `weak-deed-${gesture}`, `${mara.name} Reveals the deliberately weak Deed`, [
            { spec: 'The acquired physical card returns through the ordinary draw and Reveal cycle', check: async () => await expect(weakCard).toHaveCount(1) },
            { spec: 'Deed Worthy of Song contributes exactly zero Influence and zero swords', check: async () => await expect(weakCard).toContainText('0 Influence · 0 swords') },
            converged(accepted.value)
          ]);
          weakRevealProved = true;
          continue;
        }
        await record(actor, 'finish', `${actor.name} finishes Reveal`, async () => {
          await finish.click(); accepted.value += 1;
        });
        continue;
      }

      if (actor !== mara) {
        await record(actor, 'reveal-other', `${actor.name} Reveals`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        });
        continue;
      }

      if (deedAcquired) {
        await record(mara, 'reveal-for-deed', `${mara.name} Reveals while cycling the acquired Deed`, async () => {
          await mara.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        });
        continue;
      }

      const gold = await value(mara, mara, 'Gold');
      const councilText = await row(mara, mara.name).getByText('Council', { exact: true }).locator('..').textContent();
      const hasSeat = councilText?.includes('Seated') ?? false;
      const hallOccupied = await mara.page.getByTestId('space-hall-fire').getByText(`Agent · ${mara.name}`).count() > 0;
      if (hallOccupied) {
        await record(mara, 'reveal-nine', `${mara.name} Reveals with Hall and Council Influence`, async () => {
          await mara.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        }, [{ spec: 'The live Hall and persistent Council seat raise the real Muster total to at least nine', check: async () => await expect(mara.page.getByTestId('reveal-panel').locator('.reveal-total')).toContainText(/(?:9|1\d+) Influence/) }]);
        continue;
      }

      let destinationId = '';
      let cardPattern: RegExp;
      if (!hasSeat && gold >= 5) {
        destinationId = 'white-council-seat';
        cardPattern = /^Armed Escort/;
      } else if (!hasSeat) {
        const roadOpen = await mara.page.getByTestId('space-take-war-effort').getByText(/Agent ·/).count() === 0;
        destinationId = roadOpen ? 'take-war-effort' : 'tribute-shadow';
        cardPattern = roadOpen ? /^(The Open Road|Reconnaissance)/ : /^(Diplomatic Mission|Seek Allies)/;
      } else {
        const handText = await mara.page.getByTestId('private-hand').getByRole('button').allTextContents();
        const influence = handText.reduce((total, text) => total + (text.startsWith('Rallying Words') ? 2 : text.startsWith('Armed Escort') ? 0 : 1), 0);
        const armed = mara.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first();
        if (influence >= 6 && await armed.count() > 0) {
          destinationId = 'hall-fire';
          cardPattern = /^Armed Escort/;
        } else {
          await record(mara, 'reveal-await-nine', `${mara.name} Reveals while assembling nine Influence`, async () => {
            await mara.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
          });
          continue;
        }
      }

      const card = mara.page.getByTestId('private-hand').getByRole('button', { name: cardPattern }).first();
      const destination = mara.page.getByTestId(`space-${destinationId}`);
      if (await card.count() === 0 || !await card.isEnabled()) {
        await record(mara, 'reveal-no-route', `${mara.name} Reveals while awaiting the economy route`, async () => {
          await mara.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        });
        continue;
      }
      gesture += 1;
      await steps.gesture(mara.page, `select-${destinationId}-${gesture}`, `${mara.name} selects a card for ${destinationId}`, async () => {
        await card.click();
      }, [{ spec: 'The physical card enables the exact economy destination', check: async () => await expect(destination).toBeEnabled() }]);
      await record(mara, `visit-${destinationId}`, `${mara.name} visits ${destinationId}`, async () => {
        await destination.click(); accepted.value += 1;
      });
    }

    expect({ deedAcquired, weakRevealProved }).toEqual({ deedAcquired: true, weakRevealProved: true });
    await steps.gesture(mara.page, 'reload-deed-result', `${mara.name} reloads the weak Deed Reveal`, async () => {
      await reloadGameClient(mara.page);
    }, [
      { spec: 'Replay preserves the Renown, finite Reserve count, and zero-value revealed card', check: async () => {
        expect(await value(mara, mara, 'Renown')).toBe(renownBefore + 1);
        await expect(mara.page.getByRole('button', { name: /^Deed Worthy of Song/ })).toContainText('9 remain');
        await expect(mara.page.getByTestId('reveal-panel').locator('.muster-row article').filter({ hasText: 'Deed Worthy of Song' })).toContainText('0 Influence · 0 swords');
        await expect(mara.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);
    steps.generateDocs('Deed Worthy of Song', 'Three isolated humans build Mara’s economy through ordinary turns, buy the finite nine-Influence Reserve card for one immediate Renown, cycle its exact physical instance through Recall and reshuffle, Reveal its deliberately empty zero-Influence and zero-sword Muster box, and reload the conserved Firebase result.');
  } finally {
    await table.close();
  }
});
