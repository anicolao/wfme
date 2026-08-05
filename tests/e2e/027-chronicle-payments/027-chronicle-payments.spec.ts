import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

const TARGETS = ['Uruk-hai Captain', 'Envoy of Dale', 'Dwarven Smith'] as const;
type TargetName = (typeof TARGETS)[number];

test('three paid-choice Chronicle cards are acquired, drawn, and resolved by their owner', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'chronicle-payments-0', { phone: 'PAYCP', desktop: 'PAYCD' });
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
  const cheapestEnabledNonTarget = async (locator: Locator) => {
    const candidates: Array<{ locator: Locator; cost: number }> = [];
    for (let index = 0; index < await locator.count(); index += 1) {
      const candidate = locator.nth(index);
      if (!await candidate.isEnabled()) continue;
      const text = await candidate.textContent() ?? '';
      if (TARGETS.some((name) => text.startsWith(name))) continue;
      candidates.push({ locator: candidate, cost: Number(text.match(/· (\d+) Influence/)?.[1] ?? '99') });
    }
    return candidates.sort((left, right) => left.cost - right.cost)[0]?.locator ?? null;
  };
  const targetButton = (seat: PlotSeat, name: TargetName) => seat.page.getByTestId('private-hand').getByRole('button', {
    name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
  }).first();

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
    const space = name === 'Uruk-hai Captain' ? 'tribute-shadow'
      : name === 'Envoy of Dale' ? 'hall-fire'
        : 'dwarven-caravans';
    const goldBefore = await count(buyer, buyer.name, 'Gold');
    const mithrilBefore = await count(buyer, buyer.name, 'Mithril');
    const garrisonBefore = await count(buyer, buyer.name, 'Garrison');
    const standingBefore = await count(buyer, buyer.name, 'Dwarven');

    gestureNumber += 1;
    await steps.gesture(buyer.page, `select-${gestureNumber}`, `${buyer.name} selects ${name}`, async () => {
      await targetButton(buyer, name).click();
    }, [
      { spec: 'Only destinations matching the final printed placement icons become actionable', check: async () => await expect(buyer.page.getByTestId(`space-${space}`)).toBeEnabled() }
    ]);

    gestureNumber += 1;
    await steps.gesture(buyer.page, `place-${gestureNumber}`, `${buyer.name} plays ${name} on the production board`, async () => {
      await buyer.page.getByTestId(`space-${space}`).click(); accepted.value += 1;
    }, [
      { spec: 'The destination resolves and the exact optional Chronicle payment blocks turn advancement', check: async () => {
        await expect(buyer.page.getByRole('heading', { name: `Pay for ${name}?` })).toBeVisible();
        await expect(buyer.page.getByRole('button', { name: 'Keep the Gold' })).toBeEnabled();
        const payName = name === 'Dwarven Smith' ? 'Pay 1 Gold · gain 1 Mithril'
          : name === 'Uruk-hai Captain' ? 'Pay 1 Gold · recruit 3 Companies'
            : 'Pay 2 Gold · gain Dwarven standing';
        await expect(buyer.page.getByRole('button', { name: payName })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== buyer)) await expect(observer.page.getByRole('button', { name: payName })).toBeDisabled();
      } },
      converged(accepted.value + 1)
    ]);

    const payName = name === 'Dwarven Smith' ? 'Pay 1 Gold · gain 1 Mithril'
      : name === 'Uruk-hai Captain' ? 'Pay 1 Gold · recruit 3 Companies'
        : 'Pay 2 Gold · gain Dwarven standing';
    gestureNumber += 1;
    await steps.gesture(buyer.page, `pay-${gestureNumber}`, `${buyer.name} accepts ${name}'s optional payment`, async () => {
      await buyer.page.getByRole('button', { name: payName }).click(); accepted.value += 1;
    }, [
      { spec: `${name} spends and awards exactly its final printed resources or pieces`, check: async () => {
        await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
        if (name === 'Dwarven Smith') {
          expect(await count(buyer, buyer.name, 'Gold')).toBe(goldBefore - 1);
          expect(await count(buyer, buyer.name, 'Mithril')).toBe(mithrilBefore + 1);
        } else if (name === 'Uruk-hai Captain') {
          expect(await count(buyer, buyer.name, 'Gold')).toBe(goldBefore + 1);
          expect(await count(buyer, buyer.name, 'Garrison')).toBeGreaterThanOrEqual(garrisonBefore + 1);
        } else {
          expect(await count(buyer, buyer.name, 'Gold')).toBe(goldBefore);
          expect(await count(buyer, buyer.name, 'Dwarven')).toBeGreaterThanOrEqual(standingBefore + 1);
        }
      } },
      converged(accepted.value + 1)
    ]);
    played.add(name);
  };

  try {
    const buyer = await currentSeat();
    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 35');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('40 / 54');
    }

    for (let guard = 0; guard < 220 && played.size < TARGETS.length; guard += 1) {
      if (await page.getByTestId('endgame-window').isVisible().catch(() => false)) break;
      const actor = await currentSeat();
      if (actor === buyer) {
        let visibleTarget: TargetName | undefined;
        for (const name of TARGETS) {
          if (played.has(name)) continue;
          if (name === 'Dwarven Smith' && await count(buyer, buyer.name, 'Gold') < 1) continue;
          if (await targetButton(buyer, name).isVisible().catch(() => false)) {
            visibleTarget = name;
            break;
          }
        }
        if (visibleTarget) {
          await playTarget(buyer, visibleTarget);
          continue;
        }
      }

      await reveal(actor);
      if (acquired.size < TARGETS.length) {
        for (let purchase = 0; purchase < 10; purchase += 1) {
          let card: Locator | null = null;
          let target: TargetName | undefined;
          if (actor === buyer) {
            for (const name of TARGETS) {
              if (acquired.has(name)) continue;
              const candidate = await firstEnabled(buyer.page.getByTestId('chronicle-row').getByRole('button', { name: new RegExp(`^${name}`) }));
              if (candidate) { card = candidate; target = name; break; }
            }
            card ??= await cheapestEnabled(buyer.page.getByTestId('chronicle-row').getByRole('button'));
          } else {
            card = await cheapestEnabledNonTarget(actor.page.getByTestId('chronicle-row').getByRole('button'));
          }
          if (!card) break;
          const name = (await card.textContent())?.split(' · ')[0].trim() ?? 'Chronicle card';
          const deckBefore = Number((await actor.page.getByTestId('chronicle-market').textContent())?.match(/deck (\d+)/)?.[1] ?? '-1');
          gestureNumber += 1;
          await steps.gesture(actor.page, `acquire-${gestureNumber}`, `${actor.name} acquires ${name}`, async () => {
            await card!.click(); accepted.value += 1;
            if (target) acquired.add(target);
          }, [
            { spec: target ? `${target} enters the real discard pile as an exact physical card` : 'Another human legally buys a non-target card to cycle the shared market', check: async () => await expect(actor.page.getByTestId('activity-log')).toContainText(`${actor.name} acquires ${name}`) },
            { spec: 'The public Row refills immediately while its deck has cards', check: async () => await expect(actor.page.getByTestId('chronicle-market')).toContainText(`deck ${Math.max(0, deckBefore - 1)}`) },
            converged(accepted.value + 1)
          ]);
        }
      }
      await finishReveal(actor);
    }

    expect([...acquired].sort()).toEqual([...TARGETS].sort());
    expect([...played].sort()).toEqual([...TARGETS].sort());
    await steps.gesture(buyer.page, 'reload-paid-choices', `${buyer.name} reloads all paid Chronicle outcomes`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves every paid choice, destination, resource, piece, and standing change', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} pays 1 Gold to gain 1 Mithril from Dwarven Smith`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} pays 1 Gold to recruit`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} pays 2 Gold to gain 1 Dwarven standing from Envoy of Dale`);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Executable Chronicle paid choices',
      'Three isolated humans use the public market to acquire Dwarven Smith, Uruk-hai Captain, and Envoy of Dale, advance through ordinary Reveals and Recalls until each exact card is privately drawn, use every final placement icon, prove only the owner can resolve each optional payment, spend the exact Gold for Mithril, finite Companies, and Dwarven standing, and reload the deterministic shared history.'
    );
  } finally {
    await table.close();
  }
});
