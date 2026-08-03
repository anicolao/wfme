import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Last March of the Ents permanently breaches the Dam through a final Battle victory', async ({ browser, page }, testInfo) => {
  test.setTimeout(330_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'last-march-ents', { phone: 'ENTPH', desktop: 'ENTDS' });
  const { seats, accepted, converged, currentSeat, row } = table;

  try {
    for (let round = 1; round <= 11; round += 1) {
      for (let turn = 0; turn < 3; turn += 1) {
        const actor = await currentSeat();
        await steps.gesture(actor.page, `round-${round}-reveal-${turn + 1}`, `${actor.name} Reveals in round ${round}`, async () => {
          await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click();
          accepted.value += 1;
        }, [
          { spec: 'The acting human exposes a real Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
          converged(accepted.value + 1)
        ]);
        await steps.gesture(actor.page, `round-${round}-finish-${turn + 1}`, `${actor.name} finishes Reveal in round ${round}`, async () => {
          await actor.page.getByRole('button', { name: 'Finish Reveal' }).click();
          accepted.value += 1;
        }, [
          { spec: turn < 2 ? 'Reveal authority advances clockwise' : round < 11 ? `The unopposed Battle closes and round ${round + 1} opens` : 'The twelfth reviewed Battle opens after eleven ordinary rounds', check: async () => {
            if (turn < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
            else if (round < 11) await expect(page.getByText(new RegExp(`Round ${round + 1} · Agent turns`, 'i'))).toBeVisible();
            else {
              for (const observer of seats) {
                await expect(observer.page.getByTestId('active-battle')).toContainText('Last March of the Ents');
                await expect(observer.page.getByTestId('dam-status')).toContainText('Intact');
              }
            }
          } },
          converged(accepted.value + 1)
        ]);
      }
    }

    const marcher = await currentSeat();
    const roadsCard = marcher.page.getByTestId('private-hand').getByRole('button', { name: /^(The Open Road|Muster the Host)/ }).first();
    const placementCard = await roadsCard.count()
      ? roadsCard
      : marcher.page.getByTestId('private-hand').getByRole('button', { name: /^Reconnaissance/ }).first();
    await steps.gesture(marcher.page, 'choose-march-card', `${marcher.name} chooses a real card for the Last March`, async () => {
      await placementCard.click();
    }, [
      { spec: 'The printed icon enables a genuine Battle destination', check: async () => {
        await expect.poll(async () =>
          Number(await marcher.page.getByTestId('space-edoras').isEnabled()) + Number(await marcher.page.getByTestId('space-minas-tirith').isEnabled())
        ).toBeGreaterThan(0);
      } }
    ]);
    const destinationId = await marcher.page.getByTestId('space-edoras').isEnabled() ? 'edoras' : 'minas-tirith';
    const destinationName = destinationId === 'edoras' ? 'Edoras' : 'Minas Tirith';
    await steps.gesture(marcher.page, 'enter-last-march', `${marcher.name} enters the Last March through ${destinationName}`, async () => {
      await marcher.page.getByTestId(`space-${destinationId}`).click();
      accepted.value += 1;
    }, [
      { spec: 'Every observer sees the Agent and an ordered card or Battle continuation', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId(`space-${destinationId}`)).toContainText(marcher.name);
        await expect(marcher.page.getByTestId('pending-choice')).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);
    if (await marcher.page.getByText('Choose an empty post for the Scout.').isVisible().catch(() => false)) {
      await steps.gesture(marcher.page, 'place-march-scout', `${marcher.name} places the card's required Scout`, async () => {
        await marcher.page.getByTestId('post-orthanc-eye').click();
        accepted.value += 1;
      }, [
        { spec: 'The finite Scout is public before Battle deployment', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId('post-orthanc-eye')).toContainText(marcher.name);
          await expect(marcher.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
        } },
        converged(accepted.value + 1)
      ]);
    }
    await steps.gesture(marcher.page, 'deploy-last-march-company', `${marcher.name} deploys one Company to the Last March`, async () => {
      await marcher.page.getByRole('button', { name: 'Deploy 1', exact: true }).click();
      accepted.value += 1;
    }, [
      { spec: 'Every observer sees one finite Company at the named Battle', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('active-battle').locator('article').filter({ hasText: marcher.name })).toContainText('1 Companies');
        }
      } },
      converged(accepted.value + 1)
    ]);

    for (let turn = 0; turn < 3; turn += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `march-reveal-${turn + 1}`, `${actor.name} Reveals for the Last March`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click();
        accepted.value += 1;
      }, [
        { spec: 'The real Muster row is public before Combat', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
        converged(accepted.value + 1)
      ]);
      await steps.gesture(actor.page, `march-finish-${turn + 1}`, `${actor.name} finishes the Last March Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click();
        accepted.value += 1;
      }, [
        { spec: turn < 2 ? 'Reveal authority advances to the next human' : 'The sole genuine participant receives Combat Fate authority', check: async () => {
          if (turn < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
          else await expect(marcher.page.getByText('Round 12 · Combat Fate')).toBeVisible();
        } },
        converged(accepted.value + 1)
      ]);
    }

    const renownBefore = Number((await row(marcher, marcher.name).getByText('Renown', { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1');
    const mithrilBefore = Number((await row(marcher, marcher.name).getByText('Mithril', { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1');
    await steps.gesture(marcher.page, 'win-last-march', `${marcher.name} passes and wins the Last March`, async () => {
      await marcher.page.getByTestId('pass-battle').click();
      accepted.value += 1;
    }, [
      { spec: 'Every observer sees exactly two Renown and two Mithril awarded', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, marcher.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(renownBefore + 2));
          await expect(row(observer, marcher.name).getByText('Mithril', { exact: true }).locator('..')).toContainText(String(mithrilBefore + 2));
        }
      } },
      { spec: 'The Horse Standard is owned and the Dam is permanently breached', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, marcher.name)).toContainText('Standards1 face up');
          await expect(observer.page.getByTestId('dam-status')).toContainText('Breached');
        }
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(marcher.page, 'reload-last-march', `${marcher.name} reloads the Last March victory`, async () => {
      await reloadGameClient(marcher.page);
    }, [
      { spec: 'The exact reward, Dam breach, trophy, and round-thirteen authority replay immutably', check: async () => {
        await expect(row(marcher, marcher.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(renownBefore + 2));
        await expect(row(marcher, marcher.name).getByText('Mithril', { exact: true }).locator('..')).toContainText(String(mithrilBefore + 2));
        await expect(row(marcher, marcher.name)).toContainText('Standards1 face up');
        await expect(marcher.page.getByTestId('dam-status')).toContainText('Breached');
        await expect(marcher.page.getByText('Round 13 · Agent turns')).toBeVisible();
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs('Last March of the Ents as the twelfth Battle', 'Three isolated humans exhaust eleven real Battles through ordinary Reveal turns, enter Last March of the Ents with a real card and destination, resolve its ordered continuation, deploy a finite Company, Reveal, win through Combat, receive exactly two Renown and two Mithril, permanently breach the Dam, and reload the converged Horse Standard and next round.');
  } finally {
    await table.close();
  }
});
