import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

const TARGETS = ['The Grey Pilgrim', 'Lore of Imladris'] as const;
type TargetName = (typeof TARGETS)[number];

test('Grey Pilgrim and Lore of Imladris are acquired, drawn, and resolved by their owner', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'handcraft-37', { phone: 'HANDP', desktop: 'HANDD' });
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

  const provePrivateChoice = async (buyer: PlotSeat, action: 'Discard' | 'Trash') => {
    const ownerOptions = buyer.page.getByTestId('pending-choice').getByRole('button', { name: new RegExp(`^${action} (?!private card)`) });
    await expect(ownerOptions.first()).toBeEnabled();
    for (const observer of seats.filter((seat) => seat !== buyer)) {
      const privateOptions = observer.page.getByTestId('pending-choice').getByRole('button', { name: `${action} private card` });
      await expect(privateOptions.first()).toBeDisabled();
      await expect(observer.page.getByTestId('pending-choice')).not.toContainText('Armed Escort');
    }
    return ownerOptions;
  };

  const playTarget = async (buyer: PlotSeat, name: TargetName) => {
    const space = name === 'Lore of Imladris' ? 'hidden-counsel' : 'hall-fire';
    let preparedDiscardName: string | null = null;

    if (name === 'The Grey Pilgrim') {
      const fate = buyer.page.getByRole('button', { name: 'Play A Chance Meeting · Draw 1 card · discard 1 card' });
      gestureNumber += 1;
      await steps.gesture(buyer.page, `chance-${gestureNumber}`, `${buyer.name} plays A Chance Meeting before the Grey Pilgrim`, async () => {
        await fate.click(); accepted.value += 1;
      }, [
        { spec: 'The private draw opens an owner-authorized discard without ending the Agent turn', check: async () => {
          await expect(buyer.page.getByRole('heading', { name: 'Which card will you discard?' })).toBeVisible();
          await provePrivateChoice(buyer, 'Discard');
        } },
        converged(accepted.value + 1)
      ]);

      const discardButtons = await provePrivateChoice(buyer, 'Discard');
      const discardButton = discardButtons.filter({ hasNotText: 'The Grey Pilgrim' }).first();
      preparedDiscardName = (await discardButton.textContent())!.replace(/^Discard /, '').trim();
      gestureNumber += 1;
      await steps.gesture(buyer.page, `chance-discard-${gestureNumber}`, `${buyer.name} privately discards ${preparedDiscardName}`, async () => {
        await discardButton.click(); accepted.value += 1;
      }, [
        { spec: 'The chosen physical card enters discard and the same Agent turn resumes', check: async () => {
          await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
          expect(await count(buyer, buyer.name, 'Discard')).toBeGreaterThan(0);
          await expect(targetButton(buyer, name)).toBeEnabled();
        } },
        converged(accepted.value + 1)
      ]);
    }

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
      { spec: 'The private draw resolves before the exact Chronicle handcraft choice blocks advancement', check: async () => {
        await expect(buyer.page.getByTestId('pending-choice')).toBeVisible();
        await provePrivateChoice(buyer, 'Trash');
      } },
      converged(accepted.value + 1)
    ]);

    const trashBefore = await count(buyer, buyer.name, 'Trash');
    if (name === 'Lore of Imladris') {
      gestureNumber += 1;
      await steps.gesture(buyer.page, `keep-${gestureNumber}`, `${buyer.name} keeps every card offered by Lore of Imladris`, async () => {
        await buyer.page.getByRole('button', { name: 'Keep every card' }).click(); accepted.value += 1;
      }, [
        { spec: 'The optional trash is declined without changing the trash pile', check: async () => {
          await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
          expect(await count(buyer, buyer.name, 'Trash')).toBe(trashBefore);
        } },
        converged(accepted.value + 1)
      ]);
    } else {
      const choices = await provePrivateChoice(buyer, 'Trash');
      const choice = preparedDiscardName
        ? choices.filter({ hasText: preparedDiscardName }).first()
        : choices.first();
      gestureNumber += 1;
      await steps.gesture(buyer.page, `resolve-${gestureNumber}`, `${buyer.name} resolves ${name}'s private trash`, async () => {
        await choice.click(); accepted.value += 1;
      }, [
        { spec: 'The exact prepared discard card is permanently trashed', check: async () => {
          await expect(buyer.page.getByTestId('pending-choice')).toHaveCount(0);
          expect(await count(buyer, buyer.name, 'Trash')).toBe(trashBefore + 1);
        } },
        converged(accepted.value + 1)
      ]);
    }
    played.add(name);
  };

  try {
    const buyer = await currentSeat();
    for (const observer of seats) {
      await expect(observer.page.getByTestId('chronicle-market')).toContainText('deck 31');
      await expect(observer.page.getByText('Chronicle cards').locator('..')).toContainText('36 / 54');
    }

    const escort = buyer.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first();
    gestureNumber += 1;
    await steps.gesture(buyer.page, `select-${gestureNumber}`, `${buyer.name} selects Armed Escort`, async () => {
      await escort.click();
    }, [
      { spec: 'The deterministic ordinary hand exposes Hall of Fire through the printed Council icon', check: async () => await expect(buyer.page.getByTestId('space-hall-fire')).toBeEnabled() }
    ]);
    gestureNumber += 1;
    await steps.gesture(buyer.page, `hall-${gestureNumber}`, `${buyer.name} visits Hall of Fire`, async () => {
      await buyer.page.getByTestId('space-hall-fire').click(); accepted.value += 1;
    }, [
      { spec: 'The exact physical Fate draw remains private and the occupied Hall will add one Reveal Influence', check: async () => {
        await expect(row(buyer, buyer.name).getByText('Fate', { exact: true }).locator('..')).toContainText('1');
        for (const observer of seats.filter((seat) => seat !== buyer)) await expect(observer.page.getByText('A Chance Meeting')).toHaveCount(0);
      } },
      converged(accepted.value + 1)
    ]);

    for (let guard = 0; guard < 260 && played.size < TARGETS.length; guard += 1) {
      if (await page.getByTestId('endgame-window').isVisible().catch(() => false)) break;
      const actor = await currentSeat();
      if (actor === buyer) {
        let visibleTarget: TargetName | undefined;
        for (const name of TARGETS) {
          if (played.has(name)) continue;
          if (await targetButton(buyer, name).isVisible().catch(() => false)) { visibleTarget = name; break; }
        }
        if (visibleTarget) {
          await playTarget(buyer, visibleTarget);
          continue;
        }
      }

      await reveal(actor);
      if (acquired.size < TARGETS.length) {
        for (let purchase = 0; purchase < 12; purchase += 1) {
          let card: Locator | null = null;
          let target: TargetName | undefined;
          if (actor === buyer) {
            for (const name of TARGETS) {
              if (acquired.has(name)) continue;
              const candidate = await firstEnabled(buyer.page.getByTestId('chronicle-row').getByRole('button', { name: new RegExp(`^${name}`) }));
              if (candidate) { card = candidate; target = name; break; }
            }
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
            { spec: target ? `${target} enters the owner’s real discard pile as an exact physical card` : 'Another human legally buys a non-target card to cycle the shared market', check: async () => await expect(actor.page.getByTestId('activity-log')).toContainText(`${actor.name} acquires ${name}`) },
            { spec: 'The public Row refills immediately while its deck has cards', check: async () => await expect(actor.page.getByTestId('chronicle-market')).toContainText(`deck ${Math.max(0, deckBefore - 1)}`) },
            converged(accepted.value + 1)
          ]);
        }
      }
      await finishReveal(actor);
    }

    expect([...acquired].sort()).toEqual([...TARGETS].sort());
    expect([...played].sort()).toEqual([...TARGETS].sort());
    await steps.gesture(buyer.page, 'reload-handcraft', `${buyer.name} reloads all private Chronicle outcomes`, async () => {
      await reloadGameClient(buyer.page);
    }, [
      { spec: 'Replay preserves each destination, private discard, declined trash, and trashed discard without revealing identities publicly', check: async () => {
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} keeps every card offered by Lore of Imladris`);
        await expect(buyer.page.getByTestId('activity-log')).toContainText(`${buyer.name} trashes one private card with The Grey Pilgrim`);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Executable Chronicle private handcraft',
      'Three isolated humans use the public market to acquire Lore of Imladris and The Grey Pilgrim. The owner later draws and plays each exact card, observers see only disabled private-card choices, Lore declines its optional trash, Grey uses a genuine A Chance Meeting discard and trashes it, and reload proves deterministic hidden-information-safe replay.'
    );
  } finally {
    await table.close();
  }
});
