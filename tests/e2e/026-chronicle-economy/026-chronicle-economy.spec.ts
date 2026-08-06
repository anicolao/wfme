import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

const TARGETS = ["Steward's Messenger", 'Delving Expedition', "Durin's Heir", 'Voice of Orthanc'] as const;
type TargetName = (typeof TARGETS)[number];

test('four economy Chronicle cards are acquired, drawn, and executed through the real board', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'economy-26202', { phone: 'ECONP', desktop: 'ECOND' });
  const { seats, accepted, converged, currentSeat, row } = table;
  const acquired = new Set<TargetName>();
  const played = new Set<TargetName>();
  let gestureNumber = 0;

  const count = async (observer: PlotSeat, name: string, label: string) => Number(
    (await row(observer, name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const firstEnabled = async (locator: Locator) => {
    for (let index = 0; index < await locator.count(); index += 1) {
      const candidate = locator.nth(index);
      if (await candidate.isEnabled()) return candidate;
    }
    return null;
  };
  const cheapestEnabled = async (locator: Locator) => {
    const candidates: Array<{ locator: Locator; cost: number }> = [];
    for (let index = 0; index < await locator.count(); index += 1) {
      const candidate = locator.nth(index);
      if (!await candidate.isEnabled()) continue;
      const text = await candidate.textContent() ?? '';
      candidates.push({ locator: candidate, cost: Number(text.match(/· (\d+) Influence/)?.[1] ?? '99') });
    }
    return candidates.sort((left, right) => left.cost - right.cost)[0]?.locator ?? null;
  };

  const reveal = async (actor: PlotSeat) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals the real remaining hand`, async () => {
      await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'The public Muster row replaces only the acting human’s private hand', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
      converged(accepted.value + 1)
    ]);
  };

  const finishReveal = async (actor: PlotSeat) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `finish-${gestureNumber}`, `${actor.name} finishes Reveal`, async () => {
      await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
    }, [
      { spec: 'The Muster row closes and canonical authority advances', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0) },
      converged(accepted.value + 1)
    ]);
  };

  const playTarget = async (buyer: PlotSeat, name: TargetName) => {
    const space = name === "Steward's Messenger" ? 'hall-fire'
      : name === 'Delving Expedition' ? 'entwash'
        : name === "Durin's Heir" ? 'dwarven-caravans'
          : 'tribute-shadow';
    const goldBefore = await count(seats[0], buyer.name, 'Gold');
    const mithrilBefore = await count(seats[0], buyer.name, 'Mithril');
    const provisionsBefore = await count(seats[0], buyer.name, 'Provision');
    const garrisonBefore = await count(seats[0], buyer.name, 'Garrison');

    gestureNumber += 1;
    await steps.gesture(buyer.page, `select-${gestureNumber}`, `${buyer.name} selects ${name}`, async () => {
      await buyer.page.getByTestId('private-hand').getByRole('button', { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }).first().click();
    }, [
      { spec: 'Only destinations matching the card’s final printed placement icons become actionable', check: async () => await expect(buyer.page.getByTestId(`space-${space}`)).toBeEnabled() }
    ]);

    gestureNumber += 1;
    await steps.gesture(buyer.page, `place-${gestureNumber}`, `${buyer.name} plays ${name} at its real destination`, async () => {
      await buyer.page.getByTestId(`space-${space}`).click(); accepted.value += 1;
    }, [
      { spec: `${name} resolves its Journey box and the chosen board space as one authoritative turn`, check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId(`space-${space}`)).toContainText(buyer.name);
        if (name === "Steward's Messenger") {
          for (const observer of seats) await expect(row(observer, buyer.name).getByText('Gold', { exact: true }).locator('..')).toContainText(String(goldBefore + 1));
        } else if (name === 'Delving Expedition') {
          expect(await count(buyer, buyer.name, 'Mithril')).toBeGreaterThanOrEqual(mithrilBefore + 1);
          expect(await count(buyer, buyer.name, 'Provision')).toBe(provisionsBefore - 1);
          await expect(buyer.page.getByRole('heading', { name: 'Call one Ent or take Mithril?' })).toBeVisible();
        } else if (name === "Durin's Heir") {
          for (const observer of seats) {
            await expect(row(observer, buyer.name).getByText('Mithril', { exact: true }).locator('..')).toContainText(String(mithrilBefore + 1));
            expect(await count(observer, buyer.name, 'Garrison')).toBeGreaterThanOrEqual(garrisonBefore + 1);
          }
        } else {
          for (const observer of seats) await expect(row(observer, buyer.name).getByText('Gold', { exact: true }).locator('..')).toContainText(String(goldBefore + 4));
        }
      } },
      converged(accepted.value + 1)
    ]);

    if (name === 'Delving Expedition') {
      const beforeChoice = await count(buyer, buyer.name, 'Mithril');
      gestureNumber += 1;
      await steps.gesture(buyer.page, `delving-riches-${gestureNumber}`, `${buyer.name} takes Mithril at Entwash`, async () => {
        await buyer.page.getByRole('button', { name: 'Gain 2 Mithril' }).click(); accepted.value += 1;
      }, [
        { spec: 'The paid-space Journey bonus remains and Entwash adds its chosen two Mithril', check: async () => {
          for (const observer of seats) await expect(row(observer, buyer.name).getByText('Mithril', { exact: true }).locator('..')).toContainText(String(beforeChoice + 2));
          await expect(buyer.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
        } },
        converged(accepted.value + 1)
      ]);
      gestureNumber += 1;
      await steps.gesture(buyer.page, `delving-deploy-${gestureNumber}`, `${buyer.name} keeps the expedition out of Battle`, async () => {
        await buyer.page.getByRole('button', { name: 'Deploy 0' }).click(); accepted.value += 1;
      }, [
        { spec: 'The ordered Battle decision closes before turn authority advances', check: async () => await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0) },
        converged(accepted.value + 1)
      ]);
    }
    played.add(name);
  };

  try {
    const buyer = await currentSeat();
    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 47');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('52 / 54');
    }

    for (let guard = 0; guard < 180 && played.size < TARGETS.length; guard += 1) {
      const actor = await currentSeat();
      if (actor === buyer) {
        let visibleTarget: TargetName | undefined;
        if (played.size < TARGETS.length) {
          for (const name of TARGETS) {
            if (played.has(name)) continue;
            if (await buyer.page.getByTestId('private-hand').getByRole('button', { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }).first().isVisible().catch(() => false)) {
              visibleTarget = name;
              break;
            }
          }
        }
        if (visibleTarget) {
          await playTarget(buyer, visibleTarget);
          continue;
        }
      }

      await reveal(actor);
      if (actor === buyer && acquired.size < TARGETS.length) {
        for (let purchase = 0; purchase < 8; purchase += 1) {
          let card: Locator | null = null;
          let target: TargetName | undefined;
          for (const name of TARGETS) {
            if (acquired.has(name)) continue;
            const candidate = await firstEnabled(buyer.page.getByTestId('chronicle-row').getByRole('button', { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }));
            if (candidate) { card = candidate; target = name; break; }
          }
          card ??= await cheapestEnabled(buyer.page.getByTestId('chronicle-row').getByRole('button'));
          if (!card) break;
          const name = (await card.textContent())?.split(' · ')[0].trim() ?? 'Chronicle card';
          const deckBefore = Number((await buyer.page.getByTestId('chronicle-market').textContent())?.match(/deck (\d+)/)?.[1] ?? '-1');
          gestureNumber += 1;
          await steps.gesture(buyer.page, `acquire-${gestureNumber}`, `${buyer.name} acquires ${name}`, async () => {
            await card!.click(); accepted.value += 1;
            if (target) acquired.add(target);
          }, [
            { spec: target ? `${target} enters the real discard pile as an exact physical card` : 'An affordable card cycles the physical market toward the remaining batch', check: async () => await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} acquires ${name}`) },
            { spec: 'The public Row refills immediately when its deck has cards', check: async () => await expect(buyer.page.getByTestId('chronicle-market')).toContainText(`deck ${Math.max(0, deckBefore - 1)}`) },
            converged(accepted.value + 1)
          ]);
        }
      }
      await finishReveal(actor);
    }

    expect([...acquired].sort()).toEqual([...TARGETS].sort());
    expect([...played].sort()).toEqual([...TARGETS].sort());
    await steps.gesture(buyer.page, 'reload-economy-batch', `${buyer.name} reloads the completed economy batch`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves all four Journey outcomes and the shared event history', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} sends an Agent to Hall of Fire`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} sends an Agent to Entwash`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} sends an Agent to Dwarven Caravans`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} sends an Agent to Tribute to the Shadow`);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Executable Chronicle economy batch',
      "Three isolated humans use the public market to acquire Steward's Messenger, Delving Expedition, Durin's Heir, and Voice of Orthanc, advance only through ordinary Reveals and Recalls until each exact card is privately drawn, play every final placement icon and Journey box on the production board, resolve Entwash's ordered choices, observe public resource and piece outcomes, and reload the complete deterministic history."
    );
  } finally {
    await table.close();
  }
});
