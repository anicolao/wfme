import { expect, test, type Locator } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable, type PlotSeat } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('the table enables, takes, replaces, declines, and completes War Efforts', async ({ browser, page }, testInfo) => {
  test.setTimeout(900_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser, page, testInfo, steps, 'war-effort-batch-0',
    { phone: 'WAR1P', desktop: 'WAR1D' },
    ['Aragorn', 'Treebeard', 'Gandalf'],
    true
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const mara = seats[0];
  let gesture = 0;
  let firstTaken = false;
  let replacementTaken = false;
  let declined = false;
  let completed = false;
  let completedRenown = -1;

  const number = async (observer: PlotSeat, player: PlotSeat, label: string) => Number(
    (await row(observer, player.name).getByText(label, { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1'
  );
  const visible = async (locator: Locator) => await locator.count() > 0 && await locator.first().isVisible() ? locator.first() : null;
  const record = async (actor: PlotSeat, id: string, description: string, action: () => Promise<void>, checks: Parameters<TestStepHelper['gesture']>[4] = []) => {
    gesture += 1;
    await steps.gesture(actor.page, `${id}-${gesture}`, description, action, [...checks, converged(accepted.value + 1)]);
  };

  try {
    for (let guard = 0; guard < 300 && !(replacementTaken && declined && completed); guard += 1) {
      const actor = await currentSeat();
      const effortChoice = await visible(actor.page.getByRole('heading', { name: 'Take a War Effort?' }));
      if (effortChoice) {
        if (actor === mara && !firstTaken) {
          await record(mara, 'take-arm-westfold', `${mara.name} takes Arm the Westfold`, async () => {
            await mara.page.getByRole('button', { name: 'Take Arm the Westfold' }).click(); accepted.value += 1;
            firstTaken = true;
          }, [
            { spec: 'The exact public card moves to Mara and its row slot refills immediately', check: async () => {
              for (const observer of seats) {
                await expect(observer.page.getByRole('button', { name: new RegExp(`^${mara.name} · Arm the Westfold`) })).toBeVisible();
                await expect(observer.page.getByTestId('war-effort-mithril-cause')).toBeVisible();
              }
            } },
            { spec: 'The enabled module suppresses the disabled-game two-Gold fallback', check: async () => {
              for (const observer of seats) await expect(row(observer, mara.name).getByText('Gold', { exact: true }).locator('..')).toContainText('0');
            } }
          ]);
        } else if (actor === mara && firstTaken && !replacementTaken) {
          await record(mara, 'replace-with-stores', `${mara.name} discards the incomplete effort and takes Stores for Winter`, async () => {
            await mara.page.getByRole('button', { name: 'Take Stores for Winter' }).click(); accepted.value += 1;
            replacementTaken = true;
          }, [
            { spec: 'Only one incomplete War Effort is held and the replaced physical card enters the public discard', check: async () => {
              for (const observer of seats) {
                await expect(observer.page.getByRole('button', { name: new RegExp(`^${mara.name} · Stores for Winter`) })).toBeVisible();
                await expect(observer.page.getByRole('button', { name: new RegExp(`^${mara.name} · Arm the Westfold`) })).toHaveCount(0);
                await expect(observer.page.getByTestId('war-efforts')).toContainText('1 discarded');
              }
            } }
          ]);
        } else {
          await record(actor, 'decline-efforts', `${actor.name} leaves both War Efforts in the row`, async () => {
            await actor.page.getByRole('button', { name: 'Leave the War Efforts' }).click(); accepted.value += 1;
            declined = true;
          }, [{ spec: 'Declining preserves the remaining face-up physical card and gives no fallback Gold', check: async () => {
            for (const observer of seats) await expect(observer.page.getByTestId('war-efforts').locator('[aria-label="Face-up War Efforts"] article')).toHaveCount(1);
          } }]);
        }
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

      if (actor === mara && replacementTaken && await number(mara, mara, 'Provision') >= 3) {
        const before = {
          provisions: await number(mara, mara, 'Provision'),
          mithril: await number(mara, mara, 'Mithril'),
          renown: await number(mara, mara, 'Renown')
        };
        completedRenown = before.renown + 1;
        await record(mara, 'complete-stores', `${mara.name} completes Stores for Winter`, async () => {
          await mara.page.getByRole('button', { name: new RegExp(`^${mara.name} · Stores for Winter`) }).click(); accepted.value += 1;
          completed = true;
        }, [
          { spec: 'The during-turn payment spends exactly three Provisions and grants one Renown plus two Mithril', check: async () => {
            for (const observer of seats) {
              await expect(row(observer, mara.name).getByText('Provision', { exact: true }).locator('..')).toContainText(String(before.provisions - 3));
              await expect(row(observer, mara.name).getByText('Mithril', { exact: true }).locator('..')).toContainText(String(before.mithril + 2));
              await expect(row(observer, mara.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(before.renown + 1));
              await expect(observer.page.getByTestId('war-efforts')).toContainText('2 discarded');
            }
          } },
          { spec: 'The completed effort leaves the player slot and can never reward again', check: async () => {
            for (const observer of seats) await expect(observer.page.getByRole('button', { name: new RegExp(`^${mara.name} · Stores for Winter`) })).toHaveCount(0);
          } }
        ]);
        continue;
      }

      let destination = '';
      let cardPattern: RegExp | null = null;
      if (actor === mara && !firstTaken) {
        destination = 'take-war-effort'; cardPattern = /^The Open Road/;
      } else if (actor === mara && firstTaken && !replacementTaken) {
        destination = 'tribute-shadow'; cardPattern = /^Diplomatic Mission/;
      } else if (actor === mara && replacementTaken && !completed) {
        destination = 'dwarven-caravans'; cardPattern = /^Diplomatic Mission/;
      } else if (!declined) {
        destination = 'take-war-effort'; cardPattern = /^The Open Road/;
      }

      const card = cardPattern ? actor.page.getByTestId('private-hand').getByRole('button', { name: cardPattern }).first() : null;
      const space = destination ? actor.page.getByTestId(`space-${destination}`) : null;
      const occupied = space ? (await space.getAttribute('aria-label'))?.includes('occupied by') ?? false : false;
      if (!card || !space || occupied || await card.count() === 0 || !await card.isEnabled()) {
        await record(actor, 'reveal-waiting', `${actor.name} Reveals while the War Effort route cycles`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        });
        continue;
      }

      gesture += 1;
      await steps.gesture(actor.page, `select-${destination}-${gesture}`, `${actor.name} selects the physical card for ${destination}`, async () => {
        await card.click();
      }, [{ spec: 'The ordinary printed icon enables the intended destination', check: async () => await expect(space).toBeEnabled() }]);
      await record(actor, `visit-${destination}`, `${actor.name} visits ${destination}`, async () => {
        await space.click(); accepted.value += 1;
      }, [{ spec: destination === 'dwarven-caravans'
        ? 'The base destination adds the Provision needed for the held effort'
        : 'The module opens its public take-or-decline decision only after the destination resolves', check: async () => {
          if (destination === 'dwarven-caravans') await expect(row(actor, mara.name).getByText('Provision', { exact: true }).locator('..')).not.toContainText('0');
          else await expect(actor.page.getByRole('heading', { name: 'Take a War Effort?' })).toBeVisible();
        } }]);
    }

    expect({ firstTaken, replacementTaken, declined, completed }).toEqual({ firstTaken: true, replacementTaken: true, declined: true, completed: true });
    await steps.gesture(mara.page, 'reload-war-efforts', `${mara.name} reloads the completed War Effort batch`, async () => {
      await reloadGameClient(mara.page);
    }, [
      { spec: 'Replay preserves the module, row, discard, exact reward, and no held effort', check: async () => {
        await expect(mara.page.getByTestId('war-efforts')).toContainText('War Efforts');
        await expect(mara.page.getByTestId('war-efforts')).toContainText('2 discarded');
        await expect(row(mara, mara.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(completedRenown));
        await expect(mara.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);
    steps.generateDocs('War Effort Payments', 'The host enables the optional module before every player readies. Three isolated humans then take, replace, decline, and complete physical War Efforts through ordinary destinations, exact payments, a public refill/discard lifecycle, and a conserved Firebase reload.');
  } finally {
    await table.close();
  }
});
