import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test("Éowyn answers only the first opponent's overtaking Combat Fate each Battle", async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'eowyn-living-371',
    { phone: 'EOWYP', desktop: 'EOWYD' },
    ['Aragorn', 'Saruman', 'Éowyn']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const force = (observer: (typeof seats)[number], playerName: string) =>
    observer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: playerName });
  const strength = async (observer: (typeof seats)[number], playerName: string) =>
    Number((await force(observer, playerName).getByText(/Strength/).textContent())?.match(/(\d+)/)?.[1] ?? Number.NaN);

  try {
    const firstFateActor = await currentSeat();
    expect(firstFateActor.name).toBe('Rin');
    const eowyn = seats.find((seat) => seat.name === 'Pip')!;
    const secondFateActor = seats.find((seat) => seat.name === 'Mara')!;

    await steps.gesture(firstFateActor.page, 'select-hall-escort', `${firstFateActor.name} selects Armed Escort`, async () => {
      await firstFateActor.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [{ spec: 'The physical Council card enables Hall of Fire', check: async () => {
      await expect(firstFateActor.page.getByTestId('space-hall-fire')).toBeEnabled();
    } }]);

    await steps.gesture(firstFateActor.page, 'draw-first-charge', `${firstFateActor.name} draws Fate at Hall of Fire`, async () => {
      await firstFateActor.page.getByTestId('space-hall-fire').click();
      accepted.value += 1;
    }, [
      { spec: 'Every observer sees one private Fate while only its owner receives the exact physical card', check: async () => {
        for (const observer of seats) await expect(row(observer, firstFateActor.name)).toContainText('Fate1');
        for (const observer of seats.filter((seat) => seat !== firstFateActor)) {
          await expect(observer.page.getByText('Sudden Charge', { exact: true })).toHaveCount(0);
        }
      } },
      converged(accepted.value + 1)
    ]);

    expect(await currentSeat()).toBe(eowyn);
    await steps.gesture(eowyn.page, 'select-eowyn-escort', `${eowyn.name} selects Armed Escort`, async () => {
      await eowyn.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [{ spec: 'Éowyn can enter the real Minas Tirith Battle space', check: async () => {
      await expect(eowyn.page.getByTestId('space-minas-tirith')).toBeEnabled();
    } }]);

    await steps.gesture(eowyn.page, 'eowyn-enters-battle', `${eowyn.name} enters Minas Tirith`, async () => {
      await eowyn.page.getByTestId('space-minas-tirith').click();
      accepted.value += 1;
    }, [
      { spec: 'Armed Escort and Minas Tirith recruit finite Companies before the Battle deployment choice', check: async () => {
        await expect(row(eowyn, eowyn.name)).toContainText('Garrison5');
        await expect(eowyn.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(eowyn.page, 'eowyn-deploys-one', `${eowyn.name} deploys one Company`, async () => {
      await eowyn.page.getByRole('button', { name: 'Deploy 1', exact: true }).click();
      accepted.value += 1;
    }, [
      { spec: 'Every observer sees Éowyn’s exact physical Battle force', check: async () => {
        for (const observer of seats) await expect(force(observer, eowyn.name)).toContainText('1 Companies');
      } },
      converged(accepted.value + 1)
    ]);

    expect(await currentSeat()).toBe(secondFateActor);
    await steps.gesture(secondFateActor.page, 'select-osgiliath-escort', `${secondFateActor.name} selects Armed Escort`, async () => {
      await secondFateActor.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [{ spec: 'The physical Stronghold card enables Osgiliath', check: async () => {
      await expect(secondFateActor.page.getByTestId('space-osgiliath')).toBeEnabled();
    } }]);

    await steps.gesture(secondFateActor.page, 'enter-osgiliath', `${secondFateActor.name} enters Osgiliath`, async () => {
      await secondFateActor.page.getByTestId('space-osgiliath').click();
      accepted.value += 1;
    }, [
      { spec: 'The genuine Osgiliath resource choice opens before deployment', check: async () => {
        await expect(secondFateActor.page.getByRole('button', { name: 'Pay no Mithril · gain 2 Gold' })).toBeEnabled();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(secondFateActor.page, 'take-osgiliath-gold', `${secondFateActor.name} takes two Gold`, async () => {
      await secondFateActor.page.getByRole('button', { name: 'Pay no Mithril · gain 2 Gold' }).click();
      accepted.value += 1;
    }, [
      { spec: 'The exact resource branch resolves before the Battle deployment', check: async () => {
        await expect(row(secondFateActor, secondFateActor.name)).toContainText('Gold2');
        await expect(secondFateActor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(secondFateActor.page, 'deploy-second-force', `${secondFateActor.name} deploys two Companies`, async () => {
      await secondFateActor.page.getByRole('button', { name: 'Deploy 2', exact: true }).click();
      accepted.value += 1;
    }, [
      { spec: 'The second future Fate actor contributes exactly two Companies', check: async () => {
        for (const observer of seats) await expect(force(observer, secondFateActor.name)).toContainText('2 Companies');
      } },
      converged(accepted.value + 1)
    ]);

    expect(await currentSeat()).toBe(firstFateActor);
    await steps.gesture(firstFateActor.page, 'select-hidden-paths-card', `${firstFateActor.name} selects Seek Allies`, async () => {
      await firstFateActor.page.getByTestId('private-hand').getByRole('button', { name: /^Seek Allies/ }).click();
    }, [{ spec: 'The physical Wild card enables Hidden Paths', check: async () => {
      await expect(firstFateActor.page.getByTestId('space-hidden-paths')).toBeEnabled();
    } }]);

    await steps.gesture(firstFateActor.page, 'enter-hidden-paths', `${firstFateActor.name} enters Hidden Paths`, async () => {
      await firstFateActor.page.getByTestId('space-hidden-paths').click();
      accepted.value += 1;
    }, [
      { spec: 'The Journey self-trash decision precedes Battle deployment', check: async () => {
        await expect(firstFateActor.page.getByRole('heading', { name: 'Trash Seek Allies?' })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(firstFateActor.page, 'keep-first-seek', `${firstFateActor.name} keeps Seek Allies`, async () => {
      await firstFateActor.page.getByRole('button', { name: 'Keep Seek Allies' }).click();
      accepted.value += 1;
    }, [
      { spec: 'The ordinary Battle deployment follows the Journey choice', check: async () => {
        await expect(firstFateActor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(firstFateActor.page, 'deploy-first-force', `${firstFateActor.name} deploys one Company`, async () => {
      await firstFateActor.page.getByRole('button', { name: 'Deploy 1', exact: true }).click();
      accepted.value += 1;
    }, [
      { spec: 'All three humans now have genuine physical Battle forces', check: async () => {
        for (const observer of seats) for (const participant of seats) await expect(force(observer, participant.name)).not.toContainText('0 Companies');
      } },
      converged(accepted.value + 1)
    ]);

    expect(await currentSeat()).toBe(eowyn);
    await steps.gesture(eowyn.page, 'eowyn-reveals', `${eowyn.name} Reveals`, async () => {
      await eowyn.page.getByRole('button', { name: 'Reveal remaining hand' }).click();
      accepted.value += 1;
    }, [{ spec: 'Éowyn’s swords become public without opening Combat early', check: async () => {
      await expect(eowyn.page.getByTestId('reveal-panel')).toContainText(`${eowyn.name} Reveals`);
    } }, converged(accepted.value + 1)]);

    await steps.gesture(eowyn.page, 'eowyn-finishes-reveal', `${eowyn.name} finishes Reveal`, async () => {
      await eowyn.page.getByRole('button', { name: 'Finish Reveal' }).click();
      accepted.value += 1;
    }, [{ spec: 'Turn authority advances to the remaining active human', check: async () => {
      await expect(eowyn.page.locator('footer')).not.toContainText(`Current actor ${eowyn.name}`);
    } }, converged(accepted.value + 1)]);

    expect(await currentSeat()).toBe(secondFateActor);
    await steps.gesture(secondFateActor.page, 'select-second-fate-card', `${secondFateActor.name} selects Seek Allies`, async () => {
      await secondFateActor.page.getByTestId('private-hand').getByRole('button', { name: /^Seek Allies/ }).click();
    }, [{ spec: 'The physical Elven card enables Hidden Counsel', check: async () => {
      await expect(secondFateActor.page.getByTestId('space-hidden-counsel')).toBeEnabled();
    } }]);

    await steps.gesture(secondFateActor.page, 'draw-second-charge', `${secondFateActor.name} draws Fate at Hidden Counsel`, async () => {
      await secondFateActor.page.getByTestId('space-hidden-counsel').click();
      accepted.value += 1;
    }, [
      { spec: 'A second exact physical Fate enters its owner’s private hand', check: async () => {
        for (const observer of seats) await expect(row(observer, secondFateActor.name)).toContainText('Fate1');
        for (const observer of seats.filter((seat) => seat !== secondFateActor)) {
          await expect(observer.page.getByText('Sudden Charge', { exact: true })).toHaveCount(0);
        }
      } },
      { spec: 'Seek Allies still requires its ordered Journey choice after the Fate draw', check: async () => {
        await expect(secondFateActor.page.getByRole('heading', { name: 'Trash Seek Allies?' })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(secondFateActor.page, 'keep-second-seek', `${secondFateActor.name} keeps Seek Allies`, async () => {
      await secondFateActor.page.getByRole('button', { name: 'Keep Seek Allies' }).click();
      accepted.value += 1;
    }, [{ spec: 'The second Fate draw completes without revealing its identity', check: async () => {
      await expect(secondFateActor.page.locator('footer')).not.toContainText(`Current actor ${secondFateActor.name}`);
    } }, converged(accepted.value + 1)]);

    for (const actor of [firstFateActor, secondFateActor]) {
      expect(await currentSeat()).toBe(actor);
      await steps.gesture(actor.page, `${actor.name.toLowerCase()}-reveals`, `${actor.name} Reveals`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click();
        accepted.value += 1;
      }, [{ spec: 'The acting human’s remaining swords become public', check: async () => {
        await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`);
      } }, converged(accepted.value + 1)]);
      await steps.gesture(actor.page, `${actor.name.toLowerCase()}-finishes-reveal`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click();
        accepted.value += 1;
      }, [{ spec: actor === secondFateActor ? 'The real Combat Fate window opens with No Living Man ready' : 'Reveal authority advances to the final human', check: async () => {
        if (actor === secondFateActor) {
          for (const observer of seats) {
            await expect(observer.page.getByText('Round 1 · Combat Fate')).toBeVisible();
            await expect(force(observer, eowyn.name)).toContainText('No Living Man · ready');
          }
        } else await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
      } }, converged(accepted.value + 1)]);
    }

    expect(await currentSeat()).toBe(firstFateActor);
    const eowynStrengthBefore = await strength(firstFateActor, eowyn.name);
    const firstStrengthBefore = await strength(firstFateActor, firstFateActor.name);
    expect(firstStrengthBefore).toBeLessThanOrEqual(eowynStrengthBefore);
    await steps.gesture(firstFateActor.page, 'first-overtaking-charge', `${firstFateActor.name} plays Sudden Charge`, async () => {
      await firstFateActor.page.getByRole('button', { name: /Play Sudden Charge/ }).click();
      accepted.value += 1;
    }, [
      { spec: 'The opponent gains exactly three Strength and crosses above Éowyn’s prior total', check: async () => {
        for (const observer of seats) await expect(force(observer, firstFateActor.name)).toContainText(`${firstStrengthBefore + 3} Strength`);
        expect(firstStrengthBefore + 3).toBeGreaterThan(eowynStrengthBefore);
      } },
      { spec: 'No Living Man automatically grants Éowyn exactly two public Battle Strength once', check: async () => {
        for (const observer of seats) {
          await expect(force(observer, eowyn.name)).toContainText(`${eowynStrengthBefore + 2} Strength`);
          await expect(force(observer, eowyn.name)).toContainText('No Living Man · spent this Battle');
          await expect(observer.page.getByTestId('activity-log').locator('li').filter({ hasText: 'No Living Man' })).toHaveCount(1);
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(eowyn.page, 'reload-spent-power', `${eowyn.name} reloads the answered Battle`, async () => {
      await reloadGameClient(eowyn.page);
    }, [
      { spec: 'Immutable replay restores the exact bonus and spent marker without duplicating the reaction', check: async () => {
        await expect(force(eowyn, eowyn.name)).toContainText(`${eowynStrengthBefore + 2} Strength`);
        await expect(force(eowyn, eowyn.name)).toContainText('No Living Man · spent this Battle');
        await expect(eowyn.page.getByTestId('activity-log').locator('li').filter({ hasText: 'No Living Man' })).toHaveCount(1);
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(firstFateActor.page, 'first-actor-passes', `${firstFateActor.name} passes Combat Fate`, async () => {
      await firstFateActor.page.getByTestId('pass-battle').click();
      accepted.value += 1;
    }, [{ spec: 'Combat authority advances clockwise to Éowyn', check: async () => {
      await expect(eowyn.page.getByTestId('pass-battle')).toBeEnabled();
    } }, converged(accepted.value + 1)]);

    await steps.gesture(eowyn.page, 'eowyn-passes', `${eowyn.name} passes Combat Fate`, async () => {
      await eowyn.page.getByTestId('pass-battle').click();
      accepted.value += 1;
    }, [{ spec: 'Combat authority reaches the holder of the second private Sudden Charge', check: async () => {
      await expect(secondFateActor.page.getByRole('button', { name: /Play Sudden Charge/ })).toBeEnabled();
    } }, converged(accepted.value + 1)]);

    const eowynStrengthSpent = await strength(secondFateActor, eowyn.name);
    const secondStrengthBefore = await strength(secondFateActor, secondFateActor.name);
    expect(secondStrengthBefore).toBeLessThanOrEqual(eowynStrengthSpent);
    expect(secondStrengthBefore + 3).toBeGreaterThan(eowynStrengthSpent);
    await steps.gesture(secondFateActor.page, 'second-overtaking-charge', `${secondFateActor.name} plays the second Sudden Charge`, async () => {
      await secondFateActor.page.getByRole('button', { name: /Play Sudden Charge/ }).click();
      accepted.value += 1;
    }, [
      { spec: 'The second opponent gains exactly three Strength and also overtakes Éowyn', check: async () => {
        for (const observer of seats) await expect(force(observer, secondFateActor.name)).toContainText(`${secondStrengthBefore + 3} Strength`);
      } },
      { spec: 'The once-per-Battle power remains spent and grants no second bonus', check: async () => {
        for (const observer of seats) {
          await expect(force(observer, eowyn.name)).toContainText(`${eowynStrengthSpent} Strength`);
          await expect(force(observer, eowyn.name)).toContainText('No Living Man · spent this Battle');
          await expect(observer.page.getByTestId('activity-log').locator('li').filter({ hasText: 'No Living Man' })).toHaveCount(1);
          await expect(observer.page.getByTestId('fate-discard')).toContainText('2 cards');
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(secondFateActor.page, 'reload-second-overtake', `${secondFateActor.name} reloads the twice-overtaken Battle`, async () => {
      await reloadGameClient(secondFateActor.page);
    }, [
      { spec: 'Replay preserves both discarded physical Fate cards and exactly one Éowyn reaction', check: async () => {
        await expect(force(secondFateActor, eowyn.name)).toContainText(`${eowynStrengthSpent} Strength`);
        await expect(secondFateActor.page.getByTestId('fate-discard')).toContainText('2 cards');
        await expect(secondFateActor.page.getByTestId('activity-log').locator('li').filter({ hasText: 'No Living Man' })).toHaveCount(1);
        await expect(secondFateActor.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Éowyn — No Living Man',
      'Three isolated humans draw both physical Sudden Charge cards through ordinary Agent actions, deploy genuine opposed Battle forces, Reveal, trigger and reload Éowyn’s exact once-per-Battle answer after the first overtake, then prove a second qualifying overtake cannot grant the spent power again.'
    );
  } finally {
    await table.close();
  }
});
