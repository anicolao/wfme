import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('a uniquely lowest faction completes Unlikely Alliance at its exact timing', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser, page, testInfo, steps, 'unlikely-browser-2',
    { phone: 'UNLKP', desktop: 'UNLKD' },
    ['Aragorn', 'Treebeard', 'Gandalf'],
    true
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const mara = seats[0];
  let gesture = 0;
  let stage = 0;
  let completed = false;
  let expectedRenown = -1;
  let expectedFate = -1;

  const visible = async (locator: Locator) => await locator.count() > 0 && await locator.first().isVisible() ? locator.first() : null;
  const number = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await row(observer, player.name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const record = async (actor: PlotSeat, id: string, description: string, action: () => Promise<void>, checks: Parameters<TestStepHelper['gesture']>[4] = []) => {
    gesture += 1;
    await steps.gesture(actor.page, `${id}-${gesture}`, description, action, [...checks, converged(accepted.value + 1)]);
  };

  try {
    for (let guard = 0; guard < 180 && !completed; guard += 1) {
      const actor = await currentSeat();

      const effortChoice = await visible(actor.page.getByRole('heading', { name: 'Take a War Effort?' }));
      if (effortChoice) {
        if (actor === mara && stage === 0) {
          await record(mara, 'take-unlikely-alliance', `${mara.name} takes Unlikely Alliance`, async () => {
            await mara.page.getByRole('button', { name: 'Take Unlikely Alliance' }).click(); accepted.value += 1;
            stage = 1;
          }, [{ spec: 'The exact trigger card leaves the row, refills its slot, and becomes Mara’s sole held effort', check: async () => {
            for (const observer of seats) {
              await expect(observer.page.getByRole('button', { name: new RegExp(`^${mara.name} · Unlikely Alliance`) })).toBeVisible();
              await expect(observer.page.getByTestId('war-efforts').locator('[aria-label="Face-up War Efforts"] article')).toHaveCount(2);
              await expect(observer.page.getByTestId('war-efforts')).toContainText('9 facedown');
            }
          } }]);
        } else {
          await record(actor, 'decline-unrelated-efforts', `${actor.name} leaves the unrelated War Efforts`, async () => {
            await actor.page.getByRole('button', { name: 'Leave the War Efforts' }).click(); accepted.value += 1;
          });
        }
        continue;
      }

      const seekChoice = await visible(actor.page.getByRole('button', { name: 'Keep Seek Allies' }));
      if (seekChoice) {
        await record(actor, 'keep-seek-allies', `${actor.name} keeps Seek Allies`, async () => {
          await seekChoice.click(); accepted.value += 1;
        });
        continue;
      }

      const deployment = await visible(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' }));
      if (deployment) {
        await record(actor, 'deploy-zero', `${actor.name} keeps every Company in garrison`, async () => {
          await actor.page.getByRole('button', { name: 'Deploy 0', exact: true }).click(); accepted.value += 1;
        });
        continue;
      }

      const finish = await visible(actor.page.getByRole('button', { name: 'Finish Reveal' }));
      if (finish) {
        await record(actor, 'finish-reveal', `${actor.name} finishes Reveal`, async () => {
          await finish.click(); accepted.value += 1;
        });
        continue;
      }

      const battlePass = actor.page.getByTestId('pass-battle');
      if (await battlePass.count() > 0 && await battlePass.isEnabled()) {
        await record(actor, 'pass-battle', `${actor.name} passes Combat Fate`, async () => {
          await battlePass.click(); accepted.value += 1;
        });
        continue;
      }

      if (actor !== mara) {
        await record(actor, 'reveal-support', `${actor.name} Reveals while Mara prepares the alliance`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        });
        continue;
      }

      const route = stage === 0
        ? { spaceId: 'take-war-effort', card: /^The Open Road/, label: 'Take Up a War Effort' }
        : stage === 1
          ? { spaceId: 'dwarven-caravans', card: /^(Diplomatic Mission|Seek Allies)/, label: 'Dwarven Caravans' }
          : stage === 2
            ? { spaceId: 'tribute-shadow', card: /^(Diplomatic Mission|Seek Allies)/, label: 'Tribute to the Shadow' }
            : stage === 3
              ? { spaceId: 'hidden-counsel', card: /^(Diplomatic Mission|Seek Allies)/, label: 'Hidden Counsel' }
              : { spaceId: 'hidden-paths', card: /^(Diplomatic Mission|Seek Allies)/, label: 'Hidden Paths' };
      const card = mara.page.getByTestId('private-hand').getByRole('button', { name: route.card }).first();
      const space = mara.page.getByTestId(`space-${route.spaceId}`);
      if (await card.count() === 0 || !await card.isEnabled() || (await space.getAttribute('aria-label'))?.includes('occupied by')) {
        await record(mara, 'reveal-for-cycle', `${mara.name} Reveals to cycle the required faction card`, async () => {
          await mara.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        });
        continue;
      }

      if (stage === 4) {
        expectedRenown = await number(mara, mara, 'Renown') + 1;
        expectedFate = await number(mara, mara, 'Fate') + 1;
        for (const observer of seats) {
          await expect(row(observer, mara.name).getByText('Shadow', { exact: true }).locator('..')).toContainText('1');
          await expect(row(observer, mara.name).getByText('Dwarven', { exact: true }).locator('..')).toContainText('1');
          await expect(row(observer, mara.name).getByText('Elven', { exact: true }).locator('..')).toContainText('1');
          await expect(row(observer, mara.name).getByText('Wild', { exact: true }).locator('..')).toContainText('0');
        }
      }
      gesture += 1;
      await steps.gesture(mara.page, `select-${route.spaceId}-${gesture}`, `${mara.name} selects a physical faction card for ${route.label}`, async () => {
        await card.click();
      }, [{ spec: 'The printed icon enables only the intended unoccupied destination', check: async () => await expect(space).toBeEnabled() }]);
      const completing = stage === 4;
      await record(mara, `visit-${route.spaceId}`, `${mara.name} visits ${route.label}`, async () => {
        await space.click(); accepted.value += 1;
        if (stage > 0) stage += 1;
        if (completing) completed = true;
      }, [completing
        ? { spec: 'Only the uniquely lowest standing gain completes the effort for exactly one Renown and one private Fate', check: async () => {
          for (const observer of seats) {
            await expect(row(observer, mara.name).getByText('Wild', { exact: true }).locator('..')).toContainText('1');
            await expect(row(observer, mara.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(expectedRenown));
            await expect(row(observer, mara.name).getByText('Fate', { exact: true }).locator('..')).toContainText(String(expectedFate));
            await expect(observer.page.getByRole('button', { name: new RegExp(`^${mara.name} · Unlikely Alliance`) })).toHaveCount(0);
            await expect(observer.page.getByTestId('war-efforts')).toContainText('1 discarded');
          }
        } }
        : { spec: 'The held effort remains incomplete before its uniquely lowest faction is raised', check: async () => {
          if (stage > 1) for (const observer of seats) await expect(observer.page.getByRole('button', { name: new RegExp(`^${mara.name} · Unlikely Alliance`) })).toBeVisible();
        } }]);
    }

    expect(completed).toBe(true);
    await steps.gesture(mara.page, 'reload-triggered-effort', `${mara.name} reloads the triggered War Effort result`, async () => {
      await reloadGameClient(mara.page);
    }, [
      { spec: 'Immutable replay retains the exact trigger reward and physical discard with no held card', check: async () => {
        await expect(row(mara, mara.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(expectedRenown));
        await expect(row(mara, mara.name).getByText('Fate', { exact: true }).locator('..')).toContainText(String(expectedFate));
        await expect(mara.page.getByTestId('war-efforts')).toContainText('1 discarded');
        await expect(mara.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);
    steps.generateDocs('Triggered War Effort', 'Three isolated humans enable the full twelve-card module. Mara holds Unlikely Alliance through three non-qualifying standing gains, then raises the one uniquely lowest faction, receives the exact Renown and private Fate reward, discards the physical effort once, and reloads the converged event stream.');
  } finally {
    await table.close();
  }
});
