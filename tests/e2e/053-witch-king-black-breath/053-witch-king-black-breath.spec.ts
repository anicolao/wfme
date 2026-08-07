import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('the Witch-king afflicts one opponent after his first Combat Fate each Battle', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'eowyn-living-371',
    { phone: 'BREAP', desktop: 'BREAD' },
    ['Aragorn', 'Witch-king', 'Saruman']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const force = (observer: (typeof seats)[number], playerName: string) =>
    observer.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: playerName });
  const strength = async (observer: (typeof seats)[number], playerName: string) =>
    Number((await force(observer, playerName).getByText(/Strength/).textContent())?.match(/(\d+)/)?.[1] ?? Number.NaN);

  try {
    const witch = await currentSeat();
    expect(witch.name).toBe('Rin');
    const firstOpponent = seats.find((seat) => seat.name === 'Pip')!;
    const secondOpponent = seats.find((seat) => seat.name === 'Mara')!;

    await steps.gesture(witch.page, 'select-hall-escort', `${witch.name} selects Armed Escort`, async () => {
      await witch.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [{ spec: 'The physical Council card enables Hall of Fire', check: async () => {
      await expect(witch.page.getByTestId('space-hall-fire')).toBeEnabled();
    } }]);

    await steps.gesture(witch.page, 'draw-combat-fate', `${witch.name} draws a private Combat Fate`, async () => {
      await witch.page.getByTestId('space-hall-fire').click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees one private Fate while only the Witch-king sees Sudden Charge', check: async () => {
        for (const observer of seats) await expect(row(observer, witch.name)).toContainText('Fate1');
        for (const observer of seats.filter((seat) => seat !== witch)) await expect(observer.page.getByText('Sudden Charge', { exact: true })).toHaveCount(0);
      } }, converged(accepted.value + 1)
    ]);

    expect(await currentSeat()).toBe(firstOpponent);
    await steps.gesture(firstOpponent.page, 'select-minas-escort', `${firstOpponent.name} selects Armed Escort`, async () => {
      await firstOpponent.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [{ spec: 'The physical Stronghold card enables Minas Tirith', check: async () => {
      await expect(firstOpponent.page.getByTestId('space-minas-tirith')).toBeEnabled();
    } }]);

    await steps.gesture(firstOpponent.page, 'enter-minas', `${firstOpponent.name} enters Minas Tirith`, async () => {
      await firstOpponent.page.getByTestId('space-minas-tirith').click(); accepted.value += 1;
    }, [{ spec: 'The real destination recruits before deployment', check: async () => {
      await expect(firstOpponent.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
    } }, converged(accepted.value + 1)]);

    await steps.gesture(firstOpponent.page, 'deploy-first-opponent', `${firstOpponent.name} deploys one Company`, async () => {
      await firstOpponent.page.getByRole('button', { name: 'Deploy 1', exact: true }).click(); accepted.value += 1;
    }, [{ spec: 'Every observer sees the exact opposing force', check: async () => {
      for (const observer of seats) await expect(force(observer, firstOpponent.name)).toContainText('1 Companies');
    } }, converged(accepted.value + 1)]);

    expect(await currentSeat()).toBe(secondOpponent);
    await steps.gesture(secondOpponent.page, 'select-osgiliath-escort', `${secondOpponent.name} selects Armed Escort`, async () => {
      await secondOpponent.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [{ spec: 'The same physical card enables Osgiliath', check: async () => {
      await expect(secondOpponent.page.getByTestId('space-osgiliath')).toBeEnabled();
    } }]);

    await steps.gesture(secondOpponent.page, 'enter-osgiliath', `${secondOpponent.name} enters Osgiliath`, async () => {
      await secondOpponent.page.getByTestId('space-osgiliath').click(); accepted.value += 1;
    }, [{ spec: 'The real resource choice precedes deployment', check: async () => {
      await expect(secondOpponent.page.getByRole('button', { name: 'Pay no Mithril · gain 2 Gold' })).toBeEnabled();
    } }, converged(accepted.value + 1)]);

    await steps.gesture(secondOpponent.page, 'take-osgiliath-gold', `${secondOpponent.name} takes two Gold`, async () => {
      await secondOpponent.page.getByRole('button', { name: 'Pay no Mithril · gain 2 Gold' }).click(); accepted.value += 1;
    }, [{ spec: 'The resource branch resolves before deployment', check: async () => {
      await expect(row(secondOpponent, secondOpponent.name)).toContainText('Gold2');
      await expect(secondOpponent.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
    } }, converged(accepted.value + 1)]);

    await steps.gesture(secondOpponent.page, 'deploy-second-opponent', `${secondOpponent.name} deploys two Companies`, async () => {
      await secondOpponent.page.getByRole('button', { name: 'Deploy 2', exact: true }).click(); accepted.value += 1;
    }, [{ spec: 'Every observer sees the second exact opposing force', check: async () => {
      for (const observer of seats) await expect(force(observer, secondOpponent.name)).toContainText('2 Companies');
    } }, converged(accepted.value + 1)]);

    expect(await currentSeat()).toBe(witch);
    await steps.gesture(witch.page, 'select-hidden-paths', `${witch.name} selects Seek Allies`, async () => {
      await witch.page.getByTestId('private-hand').getByRole('button', { name: /^Seek Allies/ }).click();
    }, [{ spec: 'The physical Wild card enables a Battle destination', check: async () => {
      await expect(witch.page.getByTestId('space-hidden-paths')).toBeEnabled();
    } }]);

    await steps.gesture(witch.page, 'enter-hidden-paths', `${witch.name} enters Hidden Paths`, async () => {
      await witch.page.getByTestId('space-hidden-paths').click(); accepted.value += 1;
    }, [{ spec: 'The Journey choice opens before Battle deployment', check: async () => {
      await expect(witch.page.getByRole('heading', { name: 'Trash Seek Allies?' })).toBeVisible();
    } }, converged(accepted.value + 1)]);

    await steps.gesture(witch.page, 'keep-seek-allies', `${witch.name} keeps Seek Allies`, async () => {
      await witch.page.getByRole('button', { name: 'Keep Seek Allies' }).click(); accepted.value += 1;
    }, [{ spec: 'The ordered Battle deployment follows', check: async () => {
      await expect(witch.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
    } }, converged(accepted.value + 1)]);

    await steps.gesture(witch.page, 'deploy-witch-force', `${witch.name} deploys one Company`, async () => {
      await witch.page.getByRole('button', { name: 'Deploy 1', exact: true }).click(); accepted.value += 1;
    }, [{ spec: 'All three humans now participate with physical forces', check: async () => {
      for (const observer of seats) for (const participant of seats) await expect(force(observer, participant.name)).not.toContainText('0 Companies');
    } }, converged(accepted.value + 1)]);

    for (const actor of [firstOpponent, secondOpponent, witch]) {
      await steps.gesture(actor.page, `${actor.name.toLowerCase()}-reveals`, `${actor.name} Reveals`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [{ spec: 'The acting human’s swords become public', check: async () => {
        await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`);
      } }, converged(accepted.value + 1)]);
      await steps.gesture(actor.page, `${actor.name.toLowerCase()}-finishes-reveal`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [{ spec: actor === witch ? 'Combat opens with Black Breath ready' : 'Authority advances to the next human', check: async () => {
        if (actor === witch) {
          for (const observer of seats) {
            await expect(observer.page.getByText('Round 1 · Combat Fate')).toBeVisible();
            await expect(force(observer, witch.name)).toContainText('Black Breath · ready');
          }
        } else await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
      } }, converged(accepted.value + 1)]);
    }

    expect(await currentSeat()).toBe(witch);
    const witchStrengthBefore = await strength(witch, witch.name);
    const targetStrengthBefore = await strength(witch, firstOpponent.name);
    await steps.gesture(witch.page, 'play-sudden-charge', `${witch.name} plays Sudden Charge`, async () => {
      await witch.page.getByRole('button', { name: /Play Sudden Charge/ }).click(); accepted.value += 1;
    }, [
      { spec: 'The Combat Fate grants exactly three Strength before the Commander choice', check: async () => {
        for (const observer of seats) await expect(force(observer, witch.name)).toContainText(`${witchStrengthBefore + 3} Strength`);
      } },
      { spec: 'Black Breath becomes a mandatory owner-only opponent choice', check: async () => {
        await expect(witch.page.getByRole('heading', { name: 'Who suffers the Black Breath?' })).toBeVisible();
        await expect(witch.page.getByRole('button', { name: `Afflict ${firstOpponent.name} · −1 Strength` })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== witch)) await expect(observer.page.getByRole('button', { name: `Afflict ${firstOpponent.name} · −1 Strength` })).toBeDisabled();
      } }, converged(accepted.value + 1)
    ]);

    await steps.gesture(firstOpponent.page, 'reload-pending-breath', `${firstOpponent.name} reloads the pending Black Breath`, async () => {
      await reloadGameClient(firstOpponent.page);
    }, [{ spec: 'Replay preserves the spent marker and redacted authority', check: async () => {
      await expect(force(firstOpponent, witch.name)).toContainText('Black Breath · spent this Battle');
      await expect(firstOpponent.page.getByRole('button', { name: `Afflict ${firstOpponent.name} · −1 Strength` })).toBeDisabled();
      await expect(firstOpponent.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
    } }, converged(accepted.value)]);

    await steps.gesture(witch.page, 'afflict-first-opponent', `${witch.name} afflicts ${firstOpponent.name}`, async () => {
      await witch.page.getByRole('button', { name: `Afflict ${firstOpponent.name} · −1 Strength` }).click(); accepted.value += 1;
    }, [
      { spec: 'The selected force loses exactly the mandatory base Strength', check: async () => {
        for (const observer of seats) await expect(force(observer, firstOpponent.name)).toContainText(`${Math.max(0, targetStrengthBefore - 1)} Strength`);
      } },
      { spec: 'The other opponent is unchanged and the Witch-king retains Combat authority', check: async () => {
        for (const observer of seats) await expect(force(observer, witch.name)).toContainText('Black Breath · spent this Battle');
        await expect(witch.page.getByTestId('pass-battle')).toBeEnabled();
      } }, converged(accepted.value + 1)
    ]);

    await steps.gesture(witch.page, 'reload-breath-result', `${witch.name} reloads the resolved Black Breath`, async () => {
      await reloadGameClient(witch.page);
    }, [{ spec: 'The exact loss, discarded Fate, and spent power replay without duplication', check: async () => {
      await expect(force(witch, firstOpponent.name)).toContainText(`${Math.max(0, targetStrengthBefore - 1)} Strength`);
      await expect(force(witch, witch.name)).toContainText('Black Breath · spent this Battle');
      await expect(witch.page.getByTestId('fate-discard')).toContainText('1 cards');
      await expect(witch.page.getByTestId('activity-log').locator('li').filter({ hasText: /chooses .* Black Breath/ })).toHaveCount(1);
    } }, converged(accepted.value)]);

    steps.generateDocs(
      'Witch-king — Black Breath',
      'Three isolated humans draw a physical Combat Fate, deploy genuine opposed Battle forces, Reveal, play the Fate by click, reload the mandatory owner-only Black Breath target choice, apply the exact base Strength loss, and reload the conserved spent result.'
    );
  } finally {
    await table.close();
  }
});
