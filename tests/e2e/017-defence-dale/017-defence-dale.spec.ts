import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Defence of Dale rewards a selected Age II Battle victory with Dwarven standing', async ({ browser, page }, testInfo) => {
  test.setTimeout(420_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'defence-dale', { phone: 'DALPH', desktop: 'DALDS' });
  const { seats, accepted, converged, currentSeat, row } = table;

  try {
    for (let round = 1; round < 2; round += 1) {
      for (let turn = 0; turn < 3; turn += 1) {
        const actor = await currentSeat();
        await steps.gesture(actor.page, `round-${round}-reveal-${turn + 1}`, `${actor.name} Reveals in round ${round}`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
        }, [
          { spec: 'The acting human exposes a real Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
          converged(accepted.value + 1)
        ]);
        await steps.gesture(actor.page, `round-${round}-finish-${turn + 1}`, `${actor.name} finishes Reveal in round ${round}`, async () => {
          await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
        }, [
          { spec: turn < 2 ? 'Reveal authority advances clockwise' : 'The selected Age II Battle opens in round two', check: async () => {
            if (turn < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
            else for (const observer of seats) await expect(observer.page.getByTestId('active-battle')).toContainText('Defence of Dale');
          } },
          converged(accepted.value + 1)
        ]);
      }
    }

    const defender = await currentSeat();
    await steps.gesture(defender.page, 'choose-dale-reconnaissance', `${defender.name} chooses Reconnaissance for Defence of Dale`, async () => {
      await defender.page.getByTestId('private-hand').getByRole('button', { name: /^Reconnaissance/ }).click();
    }, [
      { spec: 'The printed Stronghold icon enables Minas Tirith', check: async () => await expect(defender.page.getByTestId('space-minas-tirith')).toBeEnabled() }
    ]);
    await steps.gesture(defender.page, 'enter-dale-through-minas', `${defender.name} enters the Battle through Minas Tirith`, async () => {
      await defender.page.getByTestId('space-minas-tirith').click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees the Agent while Reconnaissance interrupts with its Scout', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('space-minas-tirith')).toContainText(defender.name);
        await expect(defender.page.getByText('Choose an empty post for the Scout.')).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(defender.page, 'place-dale-scout', `${defender.name} places the Reconnaissance Scout`, async () => {
      await defender.page.getByTestId('post-orthanc-eye').click(); accepted.value += 1;
    }, [
      { spec: 'The finite Scout is public before ordered Battle deployment', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('post-orthanc-eye')).toContainText(defender.name);
        await expect(defender.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(defender.page, 'deploy-dale-company', `${defender.name} deploys one Company to Defence of Dale`, async () => {
      await defender.page.getByRole('button', { name: 'Deploy 1', exact: true }).click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees one real Company at the named Battle', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('active-battle').locator('article').filter({ hasText: defender.name })).toContainText('1 Companies');
      } },
      converged(accepted.value + 1)
    ]);

    for (let turn = 0; turn < 3; turn += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `dale-reveal-${turn + 1}`, `${actor.name} Reveals for Defence of Dale`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [{ spec: 'The real Muster row is public before Combat', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) }, converged(accepted.value + 1)]);
      await steps.gesture(actor.page, `dale-finish-${turn + 1}`, `${actor.name} finishes the Defence of Dale Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [{ spec: turn < 2 ? 'Reveal authority advances to the next human' : 'The sole genuine participant receives Combat Fate authority', check: async () => {
        if (turn < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
        else await expect(defender.page.getByText('Round 2 · Combat Fate')).toBeVisible();
      } }, converged(accepted.value + 1)]);
    }

    const renownBefore = Number((await row(defender, defender.name).getByText('Renown', { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1');
    const dwarvenBefore = Number((await row(defender, defender.name).getByText('Dwarven', { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1');
    await steps.gesture(defender.page, 'win-defence-dale', `${defender.name} passes and wins Defence of Dale`, async () => {
      await defender.page.getByTestId('pass-battle').click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees the exact one-Renown and one-Dwarven-standing reward', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, defender.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(renownBefore + 2));
          await expect(row(observer, defender.name).getByText('Dwarven', { exact: true }).locator('..')).toContainText(String(dwarvenBefore + 1));
        }
      } },
      { spec: 'The White Tree trophy is owned in the paired trophy area and the Company returns to finite supply', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, defender.name)).toContainText('Standards0 face up · 1 paired');
        }
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(defender.page, 'reload-defence-dale', `${defender.name} reloads the selected Battle reward`, async () => {
      await reloadGameClient(defender.page);
    }, [
      { spec: 'The exact reward, trophy, and round-three authority replay immutably', check: async () => {
        await expect(row(defender, defender.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(renownBefore + 2));
        await expect(row(defender, defender.name)).toContainText('Standards0 face up · 1 paired');
        await expect(defender.page.getByText('Round 3 · Agent turns')).toBeVisible();
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs('Defence of Dale as a selected Age II Battle', 'Three isolated humans reveal through the Age I Battle, see Defence of Dale selected from the shuffled Age II cards, enter with Reconnaissance, place its Scout, deploy a finite Company, Reveal, win through the sole-participant Combat window, receive exactly one Renown and one Dwarven standing, and reload the converged trophy and next round.');
  } finally {
    await table.close();
  }
});
