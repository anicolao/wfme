import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Keeper of Oaths rewards two Alliances earned through ordinary play', async ({ browser, page }, testInfo) => {
  test.setTimeout(450_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'keeper-4', { phone: 'KEEPP', desktop: 'KEEPD' });
  const { seats, accepted, converged, currentSeat, row } = table;
  let gestureNumber = 0;

  const count = async (observer: PlotSeat, name: string, label: string) => Number(
    (await row(observer, name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );

  const reveal = async (actor: PlotSeat) => {
    gestureNumber += 1;
    await steps.gesture(actor.page, `reveal-${gestureNumber}`, `${actor.name} Reveals the remaining hand`, async () => {
      await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
    }, [
      { spec: 'The acting human exposes a real Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
      converged(accepted.value + 1)
    ]);
    gestureNumber += 1;
    await steps.gesture(actor.page, `finish-${gestureNumber}`, `${actor.name} finishes Reveal`, async () => {
      await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
    }, [
      { spec: 'Reveal authority advances or the unopposed Battle closes', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0) },
      converged(accepted.value + 1)
    ]);
  };

  try {
    const keeper = await currentSeat();
    await steps.gesture(keeper.page, 'choose-hall-card', `${keeper.name} chooses Armed Escort`, async () => {
      await keeper.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [
      { spec: 'The printed Council icon enables Hall of Fire', check: async () => await expect(keeper.page.getByTestId('space-hall-fire')).toBeEnabled() }
    ]);
    await steps.gesture(keeper.page, 'draw-keeper', `${keeper.name} draws private Fate at Hall of Fire`, async () => {
      await keeper.page.getByTestId('space-hall-fire').click(); accepted.value += 1;
    }, [
      { spec: 'Only the public Fate count is shared before Endgame', check: async () => {
        for (const observer of seats) await expect(row(observer, keeper.name).getByText('Fate', { exact: true }).locator('..')).toContainText('1');
      } },
      converged(accepted.value + 1)
    ]);

    for (let guard = 0; guard < 160; guard += 1) {
      if (await page.getByTestId('endgame-window').isVisible().catch(() => false)) break;
      const actor = await currentSeat();
      const keeperAlliances = await Promise.all([
        page.getByTestId('alliance-dwarven').getByText(keeper.name, { exact: true }).isVisible().catch(() => false),
        page.getByTestId('alliance-shadow').getByText(keeper.name, { exact: true }).isVisible().catch(() => false)
      ]);
      const factionCard = actor === keeper
        ? actor.page.getByTestId('private-hand').getByRole('button', { name: /^(Diplomatic Mission|Seek Allies)/ }).first()
        : null;
      if (actor === keeper && keeperAlliances.filter(Boolean).length < 2 && factionCard && await factionCard.count()) {
        const dwarvenBefore = await count(page === keeper.page ? keeper : seats[0], keeper.name, 'Dwarven');
        const shadowBefore = await count(page === keeper.page ? keeper : seats[0], keeper.name, 'Shadow');
        gestureNumber += 1;
        await steps.gesture(keeper.page, `choose-faction-${gestureNumber}`, `${keeper.name} chooses a real faction card`, async () => {
          await factionCard.click();
        }, [
          { spec: 'At least one unfinished Alliance destination is enabled by the printed icon', check: async () => {
            const dwarfEnabled = await keeper.page.getByTestId('space-dwarven-caravans').isEnabled();
            const shadowEnabled = await keeper.page.getByTestId('space-tribute-shadow').isEnabled();
            expect((dwarvenBefore < 4 && dwarfEnabled) || (shadowBefore < 4 && shadowEnabled)).toBe(true);
          } }
        ]);
        const destination = dwarvenBefore < 4 && await keeper.page.getByTestId('space-dwarven-caravans').isEnabled()
          ? { id: 'dwarven-caravans', faction: 'Dwarven', before: dwarvenBefore }
          : { id: 'tribute-shadow', faction: 'Shadow', before: shadowBefore };
        gestureNumber += 1;
        await steps.gesture(keeper.page, `earn-standing-${gestureNumber}`, `${keeper.name} visits ${destination.faction === 'Dwarven' ? 'Dwarven Caravans' : 'Tribute to the Shadow'}`, async () => {
          await keeper.page.getByTestId(`space-${destination.id}`).click(); accepted.value += 1;
        }, [
          { spec: `Exactly one ${destination.faction} standing resolves publicly`, check: async () => {
            for (const observer of seats) await expect(row(observer, keeper.name).getByText(destination.faction, { exact: true }).locator('..')).toContainText(String(destination.before + 1));
          } },
          { spec: 'Standing four visibly awards the corresponding Alliance', check: async () => {
            if (destination.before + 1 === 4) await expect(page.getByTestId(`alliance-${destination.faction.toLowerCase()}`)).toContainText(keeper.name);
          } },
          converged(accepted.value + 1)
        ]);
        if (await keeper.page.getByRole('button', { name: 'Keep Seek Allies' }).isVisible().catch(() => false)) {
          gestureNumber += 1;
          await steps.gesture(keeper.page, `keep-seek-${gestureNumber}`, `${keeper.name} keeps Seek Allies`, async () => {
            await keeper.page.getByRole('button', { name: 'Keep Seek Allies' }).click(); accepted.value += 1;
          }, [
            { spec: 'The optional Journey choice completes before authority advances', check: async () => await expect(keeper.page.getByRole('button', { name: 'Keep Seek Allies' })).toHaveCount(0) },
            converged(accepted.value + 1)
          ]);
        }
      } else await reveal(actor);
    }

    await expect(page.getByTestId('endgame-window')).toBeVisible();
    for (const alliance of ['dwarven', 'shadow']) {
      for (const observer of seats) await expect(observer.page.getByTestId(`alliance-${alliance}`)).toContainText(keeper.name);
    }
    for (let guard = 0; guard < seats.length && await currentSeat() !== keeper; guard += 1) {
      const actor = await currentSeat();
      gestureNumber += 1;
      await steps.gesture(actor.page, `pre-keeper-pass-${gestureNumber}`, `${actor.name} passes to Keeper of Oaths`, async () => {
        await actor.page.getByTestId('pass-endgame').click(); accepted.value += 1;
      }, [
        { spec: 'Endgame authority advances clockwise', check: async () => await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`) },
        converged(accepted.value + 1)
      ]);
    }

    const renownBefore = await count(seats[0], keeper.name, 'Renown');
    await steps.gesture(keeper.page, 'play-keeper-oaths', `${keeper.name} plays Keeper of Oaths`, async () => {
      await keeper.page.getByRole('button', { name: /Play Keeper of Oaths/ }).click(); accepted.value += 1;
    }, [
      { spec: 'Two publicly held Alliances grant exactly one Renown and retain Endgame authority', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, keeper.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(renownBefore + 1));
          await expect(observer.page.getByTestId('fate-discard')).toContainText('1 cards');
        }
        await expect(keeper.page.getByTestId('pass-endgame')).toBeEnabled();
      } },
      converged(accepted.value + 1)
    ]);

    for (let pass = 0; pass < seats.length; pass += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `final-pass-${pass + 1}`, `${actor.name} passes Endgame`, async () => {
        await actor.page.getByTestId('pass-endgame').click(); accepted.value += 1;
      }, [
        { spec: pass < seats.length - 1 ? 'Endgame authority advances after the real pass' : 'Three consecutive passes record final scoring', check: async () => {
          if (pass < seats.length - 1) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
          else for (const observer of seats) await expect(observer.page.getByTestId('final-result')).toContainText(keeper.name);
        } },
        converged(accepted.value + 1)
      ]);
    }

    await steps.gesture(keeper.page, 'reload-keeper-result', `${keeper.name} reloads the finished match`, async () => {
      await reloadGameClient(keeper.page);
    }, [
      { spec: 'Immutable replay reproduces the Alliance-backed victory', check: async () => {
        await expect(keeper.page.getByRole('heading', { name: 'Victory in Middle-earth' })).toBeVisible();
        await expect(keeper.page.getByTestId('final-result')).toContainText(keeper.name);
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs('Keeper of Oaths through two Alliances', 'Three isolated humans play ordinary rounds while one Commander draws Keeper of Oaths privately, earns Dwarven and Shadow standing through real faction cards and destinations, claims both public Alliances, reaches Battle-deck exhaustion, plays the Endgame Fate by click for exactly one Renown, passes clockwise, and reloads the deterministic final result.');
  } finally {
    await table.close();
  }
});
