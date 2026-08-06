import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('The Long Game rewards four five-cost Chronicle cards acquired through ordinary Reveals', async ({ browser, page }, testInfo) => {
  test.setTimeout(600_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'catalog-proof-201', { phone: 'LONGP', desktop: 'LONGD' });
  const { seats, accepted, converged, currentSeat, row } = table;
  let gestureNumber = 0;
  let highCostBought = 0;
  let ladyBought = false;
  let ladyPlayed = false;

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
  const highCostNames = ['Eagle of the Misty Mountains', 'Lady of the Golden Wood', "Durin's Heir", 'Voice of Orthanc'] as const;
  const cheapestEnabledNonHigh = async (locator: Locator) => {
    const candidates: Array<{ locator: Locator; cost: number }> = [];
    for (let index = 0; index < await locator.count(); index += 1) {
      const candidate = locator.nth(index);
      if (!await candidate.isEnabled()) continue;
      const text = await candidate.textContent() ?? '';
      if (highCostNames.some((name) => text.startsWith(name))) continue;
      candidates.push({ locator: candidate, cost: Number(text.match(/· (\d+) Influence/)?.[1] ?? '99') });
    }
    return candidates.sort((left, right) => left.cost - right.cost)[0]?.locator ?? null;
  };

  try {
    const strategist = await currentSeat();
    await steps.gesture(strategist.page, 'choose-hall-card', `${strategist.name} chooses Armed Escort`, async () => {
      await strategist.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [
      { spec: 'The printed Council icon enables Hall of Fire', check: async () => await expect(strategist.page.getByTestId('space-hall-fire')).toBeEnabled() }
    ]);
    await steps.gesture(strategist.page, 'draw-long-game', `${strategist.name} draws private Fate at Hall of Fire`, async () => {
      await strategist.page.getByTestId('space-hall-fire').click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees one Fate card but not its identity', check: async () => {
        for (const observer of seats) await expect(row(observer, strategist.name).getByText('Fate', { exact: true }).locator('..')).toContainText('1');
        for (const observer of seats.filter((seat) => seat !== strategist)) await expect(observer.page.getByText('The Long Game')).toHaveCount(0);
      } },
      converged(accepted.value + 1)
    ]);

    for (let guard = 0; guard < 220; guard += 1) {
      if (await page.getByTestId('endgame-window').isVisible().catch(() => false)) break;
      const actor = await currentSeat();
      const lady = actor === strategist
        ? actor.page.getByTestId('private-hand').getByRole('button', { name: /^Lady of the Golden Wood/ }).first()
        : null;
      if (!ladyPlayed && lady && await lady.isVisible().catch(() => false)) {
        ladyPlayed = true;
        gestureNumber += 1;
        await steps.gesture(strategist.page, `select-lady-${gestureNumber}`, `${strategist.name} selects Lady of the Golden Wood`, async () => {
          await lady.click();
        }, [
          { spec: 'Her final Elven and Wild icons enable matching destinations', check: async () => {
            await expect(strategist.page.getByTestId('space-hidden-counsel')).toBeEnabled();
            await expect(strategist.page.getByTestId('space-hidden-paths')).toBeEnabled();
            await expect(strategist.page.getByTestId('space-hall-fire')).toBeDisabled();
          } }
        ]);
        const fateBefore = await count(seats[0], strategist.name, 'Fate');
        gestureNumber += 1;
        await steps.gesture(strategist.page, `play-lady-${gestureNumber}`, `${strategist.name} sends the Lady to Hidden Counsel`, async () => {
          await strategist.page.getByTestId('space-hidden-counsel').click(); accepted.value += 1;
        }, [
          { spec: 'Lady and Hidden Counsel each draw one private Fate card', check: async () => {
            for (const observer of seats) await expect(row(observer, strategist.name).getByText('Fate', { exact: true }).locator('..')).toContainText(String(fateBefore + 2));
          } },
          { spec: 'Her ordered Scout placement remains with the strategist', check: async () => {
            await expect(strategist.page.getByRole('heading', { name: 'Choose an empty post for the Scout.' })).toBeVisible();
            await expect(strategist.page.locator('[data-testid^="post-"]:enabled').first()).toBeVisible();
          } },
          converged(accepted.value + 1)
        ]);
        const post = strategist.page.locator('[data-testid^="post-"]:enabled').first();
        const postId = await post.getAttribute('data-testid');
        gestureNumber += 1;
        await steps.gesture(strategist.page, `place-lady-scout-${gestureNumber}`, `${strategist.name} places the Lady's Scout`, async () => {
          await post.click(); accepted.value += 1;
        }, [
          { spec: 'Every browser sees the finite Scout on the chosen post', check: async () => {
            expect(postId).toBeTruthy();
            for (const observer of seats) await expect(observer.page.getByTestId(postId!)).toContainText(`Scout · ${strategist.name}`);
          } },
          converged(accepted.value + 1)
        ]);
        continue;
      }

      if (await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).isVisible().catch(() => false)) {
        gestureNumber += 1;
        await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals the remaining hand`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        }, [
          { spec: 'A real public Muster row replaces the private hand', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
          converged(accepted.value + 1)
        ]);
      }

      if (await actor.page.getByRole('heading', { name: 'Pay the Master for a Fate card?' }).isVisible().catch(() => false)) {
        const goldBefore = await count(seats[0], actor.name, 'Gold');
        gestureNumber += 1;
        await steps.gesture(actor.page, `decline-master-${gestureNumber}`, `${actor.name} keeps the Gold offered to the Master`, async () => {
          await actor.page.getByRole('button', { name: 'Keep the Gold' }).click(); accepted.value += 1;
        }, [
          { spec: 'The optional Master payment closes without changing public Gold', check: async () => {
            for (const observer of seats) {
              await expect(observer.page.getByRole('heading', { name: 'Pay the Master for a Fate card?' })).toHaveCount(0);
              await expect(row(observer, actor.name).getByText('Gold', { exact: true }).locator('..')).toContainText(String(goldBefore));
            }
          } },
          converged(accepted.value + 1)
        ]);
      }

      if (highCostBought < 4 || !ladyBought) {
        for (let purchase = 0; purchase < 12 && (highCostBought < 4 || !ladyBought); purchase += 1) {
          const neededLady = actor === strategist && !ladyBought
            ? await firstEnabled(strategist.page.getByTestId('chronicle-row').getByRole('button', { name: /^Lady of the Golden Wood/ }))
            : null;
          const high = actor === strategist
            ? neededLady ?? (highCostBought < (ladyBought ? 4 : 3)
              ? await firstEnabled(strategist.page.getByTestId('chronicle-row').getByRole('button', { name: /^(Eagle of the Misty Mountains|Lady of the Golden Wood|Durin's Heir|Voice of Orthanc)/ }))
              : null)
            : null;
          const card = high ?? await cheapestEnabledNonHigh(actor.page.getByTestId('chronicle-row').getByRole('button'));
          if (!card) break;
          const name = (await card.textContent())?.split(' · ')[0].trim() ?? 'Chronicle card';
          const isHigh = highCostNames.includes(name as (typeof highCostNames)[number]);
          const rowBefore = await actor.page.getByTestId('chronicle-row').getByRole('button').count();
          const deckBefore = Number((await actor.page.getByTestId('chronicle-market').textContent())?.match(/deck (\d+)/)?.[1] ?? '-1');
          const highCostOrdinal = highCostBought + (isHigh ? 1 : 0);
          gestureNumber += 1;
          await steps.gesture(actor.page, `acquire-${gestureNumber}`, `${actor.name} acquires ${name}`, async () => {
            await card.click(); accepted.value += 1;
            if (actor === strategist && isHigh) highCostBought += 1;
            if (actor === strategist && name === 'Lady of the Golden Wood') ladyBought = true;
          }, [
            { spec: deckBefore > 0 ? 'The Row immediately refills after the legal purchase' : 'The exhausted physical deck leaves one fewer Row card', check: async () => await expect(actor.page.getByTestId('chronicle-row').getByRole('button')).toHaveCount(deckBefore > 0 ? rowBefore : rowBefore - 1) },
            { spec: actor === strategist && isHigh ? `The public log records five-cost card ${highCostOrdinal} of four` : 'Another legal purchase cycles the shared market toward the ownership condition', check: async () => await expect(actor.page.getByTestId('activity-log')).toContainText(`${actor.name} acquires ${name}`) },
            converged(accepted.value + 1)
          ]);
        }
      }

      gestureNumber += 1;
      await steps.gesture(actor.page, `finish-${gestureNumber}`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [
        { spec: 'The Reveal closes and ordinary authority advances', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0) },
        converged(accepted.value + 1)
      ]);
    }

    expect(highCostBought).toBe(4);
    expect(ladyPlayed).toBe(true);
    await expect(page.getByTestId('endgame-window')).toBeVisible();
    for (let guard = 0; guard < seats.length && await currentSeat() !== strategist; guard += 1) {
      const actor = await currentSeat();
      gestureNumber += 1;
      await steps.gesture(actor.page, `pass-to-strategist-${gestureNumber}`, `${actor.name} passes Endgame`, async () => {
        await actor.page.getByTestId('pass-endgame').click(); accepted.value += 1;
      }, [
        { spec: 'Endgame authority advances clockwise', check: async () => await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`) },
        converged(accepted.value + 1)
      ]);
    }

    const renownBefore = await count(seats[0], strategist.name, 'Renown');
    await expect(strategist.page.getByRole('button', { name: /Play The Long Game/ })).toBeEnabled();
    await steps.gesture(strategist.page, 'play-long-game', `${strategist.name} plays The Long Game`, async () => {
      await strategist.page.getByRole('button', { name: /Play The Long Game/ }).click(); accepted.value += 1;
    }, [
      { spec: 'Four owned five-cost cards grant exactly one Renown and retain authority', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, strategist.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(renownBefore + 1));
          await expect(observer.page.getByTestId('activity-log')).toContainText('plays The Long Game while owning 4 Chronicle cards costing 5 or more');
        }
        await expect(strategist.page.getByTestId('pass-endgame')).toBeEnabled();
      } },
      converged(accepted.value + 1)
    ]);

    for (let pass = 0; pass < seats.length; pass += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `final-pass-${pass + 1}`, `${actor.name} passes final scoring`, async () => {
        await actor.page.getByTestId('pass-endgame').click(); accepted.value += 1;
      }, [
        { spec: pass < seats.length - 1 ? 'Endgame authority advances after the pass' : 'Three consecutive passes record the final result', check: async () => {
          if (pass < seats.length - 1) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
          else for (const observer of seats) await expect(observer.page.getByTestId('final-result')).toContainText(strategist.name);
        } },
        converged(accepted.value + 1)
      ]);
    }

    await steps.gesture(strategist.page, 'reload-long-game-result', `${strategist.name} reloads the finished Long Game`, async () => {
      await reloadGameClient(strategist.page);
    }, [
      { spec: 'Replay reproduces the Chronicle-backed final result', check: async () => {
        await expect(strategist.page.getByRole('heading', { name: 'Victory in Middle-earth' })).toBeVisible();
        await expect(strategist.page.getByTestId('final-result')).toContainText(strategist.name);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Lady of the Golden Wood and The Long Game',
      'Three isolated humans draw The Long Game privately, use ordinary Reveals to acquire four physical five-cost Chronicle cards, draw and play Lady of the Golden Wood through her final Elven icons, Fate draw, and Scout choice, reach Endgame, gain exactly one Renown through the now-satisfied ownership condition, pass to final scoring, and reload the deterministic result.'
    );
  } finally {
    await table.close();
  }
});
