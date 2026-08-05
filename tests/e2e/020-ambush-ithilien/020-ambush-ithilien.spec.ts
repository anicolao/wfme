import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Ambush in Ithilien awards a real victory and places its finite Scout before Recall', async ({ browser, page }, testInfo) => {
  test.setTimeout(360_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'ambush-ithilien-3', { phone: 'ITHIP', desktop: 'ITHID' });
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
          { spec: turn < 2 ? 'Reveal authority advances clockwise' : 'Ambush in Ithilien opens as the first selected Age II Battle', check: async () => {
            if (turn < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
            else for (const observer of seats) {
              await expect(observer.page.getByTestId('active-battle')).toContainText('Ambush in Ithilien');
              await expect(observer.page.getByTestId('active-battle')).toContainText('First: 1 Renown + place 1 Scout');
              await expect(observer.page.getByTestId('active-battle')).toContainText('Second: 1 Mithril + draw 1 Fate');
              await expect(observer.page.getByTestId('active-battle')).toContainText('Third: 1 Mithril');
            }
          } },
          converged(accepted.value + 1)
        ]);
      }
    }

    const ambusher = await currentSeat();
    const roadsCard = ambusher.page.getByTestId('private-hand').getByRole('button', { name: /^(The Open Road|Muster the Host)/ }).first();
    const placementCard = await roadsCard.count()
      ? roadsCard
      : ambusher.page.getByTestId('private-hand').getByRole('button', { name: /^Reconnaissance/ }).first();
    await steps.gesture(ambusher.page, 'choose-ambush-card', `${ambusher.name} chooses a real card for the Ambush`, async () => {
      await placementCard.click();
    }, [
      { spec: 'The printed icon enables a genuine Battle destination', check: async () => await expect.poll(async () =>
        Number(await ambusher.page.getByTestId('space-edoras').isEnabled()) + Number(await ambusher.page.getByTestId('space-minas-tirith').isEnabled())
      ).toBeGreaterThan(0) }
    ]);
    const destinationId = await ambusher.page.getByTestId('space-edoras').isEnabled() ? 'edoras' : 'minas-tirith';
    const destinationName = destinationId === 'edoras' ? 'Edoras' : 'Minas Tirith';
    await steps.gesture(ambusher.page, 'enter-ambush', `${ambusher.name} enters the Ambush through ${destinationName}`, async () => {
      await ambusher.page.getByTestId(`space-${destinationId}`).click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees the Agent and an ordered continuation', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId(`space-${destinationId}`)).toContainText(ambusher.name);
        await expect(ambusher.page.getByTestId('pending-choice')).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);
    if (await ambusher.page.getByText('Choose an empty post for the Scout.').isVisible().catch(() => false)) {
      const journeyPost = ambusher.page.locator('[data-testid^="post-"]:not([disabled])').first();
      const journeyPostId = await journeyPost.getAttribute('data-testid');
      await steps.gesture(ambusher.page, 'place-journey-scout', `${ambusher.name} places the card's Journey Scout`, async () => {
        await journeyPost.click(); accepted.value += 1;
      }, [
        { spec: 'The finite Journey Scout is public before Battle deployment', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId(journeyPostId!)).toContainText(ambusher.name);
          await expect(ambusher.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
        } },
        converged(accepted.value + 1)
      ]);
    }
    await steps.gesture(ambusher.page, 'deploy-ambush-company', `${ambusher.name} deploys one Company to the Ambush`, async () => {
      await ambusher.page.getByRole('button', { name: 'Deploy 1', exact: true }).click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees one finite Company at Ambush in Ithilien', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('active-battle').locator('article').filter({ hasText: ambusher.name })).toContainText('1 Companies');
      } },
      converged(accepted.value + 1)
    ]);

    for (let turn = 0; turn < 3; turn += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `ambush-reveal-${turn + 1}`, `${actor.name} Reveals for the Ambush`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'The real Muster row is public before Combat', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) },
        converged(accepted.value + 1)
      ]);
      await steps.gesture(actor.page, `ambush-finish-${turn + 1}`, `${actor.name} finishes the Ambush Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [
        { spec: turn < 2 ? 'Reveal authority advances to the next human' : 'The sole genuine participant receives Combat Fate authority', check: async () => {
          if (turn < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
          else await expect(ambusher.page.getByText('Round 2 · Combat Fate')).toBeVisible();
        } },
        converged(accepted.value + 1)
      ]);
    }

    const renownBefore = Number((await row(ambusher, ambusher.name).getByText('Renown', { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1');
    const scoutsBefore = Number((await row(ambusher, ambusher.name).getByText('Scouts', { exact: true }).locator('..').textContent())?.match(/(\d+)/)?.[1] ?? '-1');
    await steps.gesture(ambusher.page, 'win-ambush', `${ambusher.name} passes and wins the Ambush`, async () => {
      await ambusher.page.getByTestId('pass-battle').click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees exactly one Renown and the Horse Standard awarded', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, ambusher.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(renownBefore + 1));
          await expect(row(observer, ambusher.name)).toContainText('Standards1 face up');
        }
      } },
      { spec: 'Recall waits on the mandatory finite Scout placement', check: async () => {
        for (const observer of seats) await expect(observer.page.getByText('Choose an empty post for the Scout.')).toBeVisible();
        await expect(ambusher.page.getByText('Round 2 · Combat Fate')).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);
    await steps.gesture(ambusher.page, 'reload-ambush-scout', `${ambusher.name} reloads the Ambush Scout reward`, async () => {
      await reloadGameClient(ambusher.page);
    }, [
      { spec: 'The exact winner, Renown, Standard, and Scout authority replay before Recall', check: async () => {
        await expect(row(ambusher, ambusher.name).getByText('Renown', { exact: true }).locator('..')).toContainText(String(renownBefore + 1));
        await expect(row(ambusher, ambusher.name)).toContainText('Standards1 face up');
        await expect(ambusher.page.getByText('Choose an empty post for the Scout.')).toBeVisible();
      } },
      converged(accepted.value)
    ]);
    const rewardPost = ambusher.page.locator('[data-testid^="post-"]:not([disabled])').first();
    const rewardPostId = await rewardPost.getAttribute('data-testid');
    await steps.gesture(ambusher.page, 'place-ambush-scout', `${ambusher.name} places the Ambush reward Scout`, async () => {
      await rewardPost.click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees the finite Scout at the chosen observation post', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId(rewardPostId!)).toContainText(ambusher.name);
          await expect(row(observer, ambusher.name).getByText('Scouts', { exact: true }).locator('..')).toContainText(String(scoutsBefore - 1));
        }
      } },
      { spec: 'Recall completes only after the ranked reward is fully resolved', check: async () => {
        for (const observer of seats) await expect(observer.page.getByText('Round 3 · Agent turns')).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);

    steps.generateDocs('Ambush in Ithilien as a selected Age II Battle', 'Three isolated humans reveal through the Age I Battle, enter selected Ambush in Ithilien through a real card and destination, deploy a finite Company, win through Combat, receive exactly one Renown and the Horse Standard, reload the persisted ranked Scout authority, place that finite Scout by click, and only then complete Recall.');
  } finally {
    await table.close();
  }
});
