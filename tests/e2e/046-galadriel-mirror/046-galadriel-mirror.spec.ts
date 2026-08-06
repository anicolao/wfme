import { expect, test } from '@playwright/test';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';
import { TestStepHelper } from '../helpers/test-step-helper';

test('Galadriel places a second Scout and draws through Mirror Unveiled', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(
    browser,
    page,
    testInfo,
    steps,
    'galadriel-mirror-1',
    { phone: 'MIRRP', desktop: 'MIRRD' },
    ['Galadriel', 'Aragorn', 'Gandalf']
  );
  const { seats, accepted, converged, currentSeat, row } = table;
  const counter = (observer: (typeof seats)[number], playerName: string, label: string) =>
    row(observer, playerName).getByText(label, { exact: true }).locator('..');

  try {
    const galadriel = await currentSeat();
    expect(galadriel.name).toBe('Mara');
    const reconnaissance = galadriel.page.getByTestId('private-hand').getByRole('button', { name: /^Reconnaissance/ });

    await steps.gesture(galadriel.page, 'select-reconnaissance', `${galadriel.name} selects Reconnaissance`, async () => {
      await reconnaissance.click();
    }, [{ spec: 'The physical Scout card enables its printed Roads destination', check: async () => {
      await expect(galadriel.page.getByTestId('space-take-war-effort')).toBeEnabled();
    } }]);

    await steps.gesture(galadriel.page, 'play-reconnaissance', `${galadriel.name} scouts from Take Up a War Effort`, async () => {
      await galadriel.page.getByTestId('space-take-war-effort').click(); accepted.value += 1;
    }, [
      { spec: 'The ordinary destination draws one card and grants exactly two Gold before Scout placement', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, galadriel.name, 'Hand')).toContainText('5');
          await expect(counter(observer, galadriel.name, 'Gold')).toContainText('2');
          await expect(counter(observer, galadriel.name, 'Scouts')).toContainText('3');
        }
      } },
      { spec: 'Reconnaissance opens the real nine-post board network', check: async () => {
        await expect(galadriel.page.getByRole('heading', { name: 'Choose an empty post for the Scout.' })).toBeVisible();
        await expect(galadriel.page.getByTestId('post-redhorn-pass')).toBeEnabled();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(galadriel.page, 'place-first-scout', `${galadriel.name} places a Scout at Redhorn Pass`, async () => {
      await galadriel.page.getByTestId('post-redhorn-pass').click(); accepted.value += 1;
    }, [
      { spec: 'One finite Scout moves from supply onto its exact observation post', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('post-redhorn-pass')).toContainText(`Scout · ${galadriel.name}`);
          await expect(counter(observer, galadriel.name, 'Scouts')).toContainText('2');
        }
      } },
      { spec: 'An ordinary Scout placement does not invoke Galadriel’s Ring or draw another card', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, galadriel.name, 'Hand')).toContainText('5');
          await expect(observer.page.getByTestId('activity-log')).not.toContainText('with Mirror Unveiled');
        }
      } },
      converged(accepted.value + 1)
    ]);

    for (let turn = 0; turn < 2; turn += 1) {
      const actor = await currentSeat();
      expect(actor.name).not.toBe(galadriel.name);
      await steps.gesture(actor.page, `reveal-${turn + 1}`, `${actor.name} Reveals`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [
        { spec: 'The ordinary public Muster row belongs to the acting human', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`);
        } },
        converged(accepted.value + 1)
      ]);
      await steps.gesture(actor.page, `finish-reveal-${turn + 1}`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [
        { spec: 'Authority advances without changing Galadriel’s hand or Scout network', check: async () => {
          await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
          await expect(counter(actor, galadriel.name, 'Hand')).toContainText('5');
          await expect(counter(actor, galadriel.name, 'Scouts')).toContainText('2');
        } },
        converged(accepted.value + 1)
      ]);
    }

    expect((await currentSeat()).name).toBe(galadriel.name);
    const token = galadriel.page.getByTestId('private-hand').getByRole('button', { name: /^Token of Command/ });
    await steps.gesture(galadriel.page, 'select-token', `${galadriel.name} selects Token of Command`, async () => {
      await token.click();
    }, [{ spec: 'Galadriel’s active Ring card enables the real Minas Tirith Battle space', check: async () => {
      await expect(galadriel.page.getByTestId('space-minas-tirith')).toBeEnabled();
    } }]);

    await steps.gesture(galadriel.page, 'place-token', `${galadriel.name} sends Token of Command to Minas Tirith`, async () => {
      await galadriel.page.getByTestId('space-minas-tirith').click(); accepted.value += 1;
    }, [
      { spec: 'The Agent is committed before either the Ring or destination changes the hand and forces', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-minas-tirith')).toContainText(`Agent · ${galadriel.name}`);
          await expect(counter(observer, galadriel.name, 'Hand')).toContainText('4');
          await expect(counter(observer, galadriel.name, 'Garrison')).toContainText('3');
          await expect(counter(observer, galadriel.name, 'Supply')).toContainText('9');
        }
      } },
      { spec: 'Only Galadriel can order Mirror Unveiled before or after the destination', check: async () => {
        await expect(galadriel.page.getByRole('heading', { name: 'When will Mirror Unveiled?' })).toBeVisible();
        await expect(galadriel.page.getByRole('button', { name: 'Ring ability first' })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== galadriel)) {
          await expect(observer.page.getByRole('button', { name: 'Ring ability first' })).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(galadriel.page, 'ring-first', `${galadriel.name} resolves Mirror Unveiled first`, async () => {
      await galadriel.page.getByRole('button', { name: 'Ring ability first' }).click(); accepted.value += 1;
    }, [
      { spec: 'Mirror Unveiled pauses at an exact finite Scout placement before checking the draw condition', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByRole('heading', { name: 'Where will Mirror Unveiled place Galadriel’s Scout?' })).toBeVisible();
          await expect(counter(observer, galadriel.name, 'Hand')).toContainText('4');
          await expect(counter(observer, galadriel.name, 'Garrison')).toContainText('3');
        }
        await expect(galadriel.page.getByTestId('post-northern-eaves')).toBeEnabled();
      } },
      { spec: 'Observers see the ordered placement but cannot place Galadriel’s Scout', check: async () => {
        for (const observer of seats.filter((seat) => seat !== galadriel)) {
          await expect(observer.page.getByTestId('post-northern-eaves')).toBeDisabled();
        }
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(galadriel.page, 'reload-mirror-placement', `${galadriel.name} reloads the pending Mirror placement`, async () => {
      await reloadGameClient(galadriel.page);
    }, [
      { spec: 'Replay restores the same Ring placement without drawing or resolving Minas Tirith early', check: async () => {
        await expect(galadriel.page.getByRole('heading', { name: 'Where will Mirror Unveiled place Galadriel’s Scout?' })).toBeVisible();
        await expect(galadriel.page.getByTestId('post-northern-eaves')).toBeEnabled();
        await expect(counter(galadriel, galadriel.name, 'Hand')).toContainText('4');
        await expect(counter(galadriel, galadriel.name, 'Garrison')).toContainText('3');
      } },
      converged(accepted.value)
    ]);

    await steps.gesture(galadriel.page, 'place-mirror-scout', `${galadriel.name} places the Mirror Scout at Northern Eaves`, async () => {
      await galadriel.page.getByTestId('post-northern-eaves').click(); accepted.value += 1;
    }, [
      { spec: 'The second finite Scout occupies a different exact observation post', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('post-redhorn-pass')).toContainText(`Scout · ${galadriel.name}`);
          await expect(observer.page.getByTestId('post-northern-eaves')).toContainText(`Scout · ${galadriel.name}`);
          await expect(counter(observer, galadriel.name, 'Scouts')).toContainText('1');
        }
      } },
      { spec: 'Two different posts satisfy Mirror Unveiled and draw exactly one physical card', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, galadriel.name, 'Hand')).toContainText('6');
          await expect(observer.page.getByTestId('activity-log')).toContainText('Galadriel draws 1 card with Mirror Unveiled because her Scouts watch 2 different observation posts.');
        }
      } },
      { spec: 'Only after the Ring draw, Minas Tirith recruits one finite Company and opens normal deployment', check: async () => {
        for (const observer of seats) {
          await expect(counter(observer, galadriel.name, 'Garrison')).toContainText('4');
          await expect(counter(observer, galadriel.name, 'Supply')).toContainText('8');
        }
        await expect(galadriel.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(galadriel.page, 'decline-deployment', `${galadriel.name} keeps all Companies in the garrison`, async () => {
      await galadriel.page.getByRole('button', { name: 'Deploy 0', exact: true }).click(); accepted.value += 1;
    }, [
      { spec: 'The ordered Ring turn closes with no Battle Company and returns Galadriel to her required Reveal', check: async () => {
        await expect(galadriel.page.getByTestId('pending-choice')).toHaveCount(0);
        await expect(galadriel.page.locator('footer')).toContainText(`Current actor ${galadriel.name}`);
        await expect(galadriel.page.getByRole('button', { name: 'Reveal remaining hand' })).toBeEnabled();
        const force = galadriel.page.getByTestId('active-battle').locator('.battle-forces article').filter({ hasText: galadriel.name });
        await expect(force).toContainText('0 Companies');
      } },
      converged(accepted.value + 1)
    ]);

    await steps.gesture(galadriel.page, 'reload-mirror-result', `${galadriel.name} reloads the completed Mirror turn`, async () => {
      await reloadGameClient(galadriel.page);
    }, [
      { spec: 'Replay conserves two board Scouts, one supply Scout, six hand cards, and one Ring draw', check: async () => {
        await expect(galadriel.page.getByTestId('post-redhorn-pass')).toContainText(`Scout · ${galadriel.name}`);
        await expect(galadriel.page.getByTestId('post-northern-eaves')).toContainText(`Scout · ${galadriel.name}`);
        await expect(counter(galadriel, galadriel.name, 'Scouts')).toContainText('1');
        await expect(counter(galadriel, galadriel.name, 'Hand')).toContainText('6');
        await expect(galadriel.page.getByTestId('activity-log').locator('li').filter({ hasText: 'draws 1 card with Mirror Unveiled' })).toHaveCount(1);
        await expect(galadriel.page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
      } },
      converged(accepted.value)
    ]);

    steps.generateDocs(
      'Galadriel — Mirror Unveiled',
      'Three isolated humans select Galadriel, establish one ordinary Scout, play the one physical Token of Command into a real Battle space, choose Mirror Unveiled before the destination, reload the pending Ring authority, place a second finite Scout on a different observation post, draw exactly one physical card, resume Minas Tirith and deployment, and replay the conserved result through Firebase.'
    );
  } finally {
    await table.close();
  }
});
