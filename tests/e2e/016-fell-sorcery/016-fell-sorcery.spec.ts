import { expect, test } from '@playwright/test';
import { TestStepHelper } from '../helpers/test-step-helper';
import { reloadGameClient } from '../helpers/firebase-readiness';
import { startPlotTable } from '../helpers/plot-table';

test('Fell Sorcery exacts its Mithril price from a real Battle participant', async ({ browser, page }, testInfo) => {
  test.setTimeout(420_000);
  const steps = new TestStepHelper(testInfo);
  const table = await startPlotTable(browser, page, testInfo, steps, 'fell-11', { phone: 'FELPH', desktop: 'FELDS' });
  const { seats, accepted, converged, currentSeat, row } = table;

  try {
    const caster = await currentSeat();
    await steps.gesture(caster.page, 'select-hall-card', `${caster.name} selects Armed Escort for Hall of Fire`, async () => {
      await caster.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).click();
    }, [{ spec: 'The actual Council icon enables Hall of Fire', check: async () => await expect(caster.page.getByTestId('space-hall-fire')).toBeEnabled() }]);
    await steps.gesture(caster.page, 'draw-fell-sorcery', `${caster.name} draws private Fell Sorcery`, async () => {
      await caster.page.getByTestId('space-hall-fire').click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees one Fate card while only its owner sees Fell Sorcery', check: async () => {
        for (const observer of seats) await expect(row(observer, caster.name)).toContainText('Fate1');
        await expect(caster.page.getByRole('button', { name: /Play Fell Sorcery/ })).toHaveCount(0);
        for (const observer of seats.filter((seat) => seat !== caster)) await expect(observer.page.getByText('Fell Sorcery')).toHaveCount(0);
      } },
      converged(accepted.value + 1)
    ]);

    const mara = await currentSeat();
    await steps.gesture(mara.page, 'select-minas-card', `${mara.name} selects Armed Escort for Minas Tirith`, async () => {
      await mara.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).click();
    }, [{ spec: 'The Stronghold icon enables Minas Tirith', check: async () => await expect(mara.page.getByTestId('space-minas-tirith')).toBeEnabled() }]);
    await steps.gesture(mara.page, 'enter-minas-tirith', `${mara.name} enters the first Battle`, async () => {
      await mara.page.getByTestId('space-minas-tirith').click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees the Battle occupation and ordered deployment', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('space-minas-tirith')).toContainText(mara.name);
        await expect(mara.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
      } }, converged(accepted.value + 1)
    ]);
    await steps.gesture(mara.page, 'deploy-minas-company', `${mara.name} deploys one Company`, async () => {
      await mara.page.getByRole('button', { name: 'Deploy 1', exact: true }).click(); accepted.value += 1;
    }, [{ spec: 'The real Battle force gains one Company', check: async () => {
      for (const observer of seats) await expect(observer.page.getByTestId('active-battle').locator('article').filter({ hasText: mara.name })).toContainText('1 Companies');
    } }, converged(accepted.value + 1)]);

    const rin = await currentSeat();
    await steps.gesture(rin.page, 'select-entwash-card', `${rin.name} selects The Open Road for Entwash`, async () => {
      await rin.page.getByTestId('private-hand').getByRole('button', { name: /^The Open Road/ }).first().click();
    }, [{ spec: 'The Roads icon and one Provision enable Entwash', check: async () => await expect(rin.page.getByTestId('space-entwash')).toBeEnabled() }]);
    await steps.gesture(rin.page, 'enter-entwash', `${rin.name} enters Entwash`, async () => {
      await rin.page.getByTestId('space-entwash').click(); accepted.value += 1;
    }, [{ spec: 'The Provision cost resolves before the Entwash choice', check: async () => {
      await expect(row(rin, rin.name).getByText('Provision', { exact: true }).locator('..')).toContainText('0');
      await expect(rin.page.getByRole('heading', { name: 'Call one Ent or take Mithril?' })).toBeVisible();
    } }, converged(accepted.value + 1)]);
    await steps.gesture(rin.page, 'take-entwash-mithril', `${rin.name} takes two Mithril`, async () => {
      await rin.page.getByRole('button', { name: 'Gain 2 Mithril' }).click(); accepted.value += 1;
    }, [{ spec: 'The exact reward resolves before Battle deployment', check: async () => {
      await expect(row(rin, rin.name).getByText('Mithril', { exact: true }).locator('..')).toContainText('2');
      await expect(rin.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
    } }, converged(accepted.value + 1)]);
    await steps.gesture(rin.page, 'deploy-entwash-company', `${rin.name} deploys one Company`, async () => {
      await rin.page.getByRole('button', { name: 'Deploy 1', exact: true }).click(); accepted.value += 1;
    }, [{ spec: 'A second real opponent joins the Battle', check: async () => {
      for (const observer of seats) await expect(observer.page.getByTestId('active-battle').locator('article').filter({ hasText: rin.name })).toContainText('1 Companies');
    } }, converged(accepted.value + 1)]);

    expect(await currentSeat()).toBe(caster);
    await steps.gesture(caster.page, 'select-edoras-card', `${caster.name} selects The Open Road for Edoras`, async () => {
      await caster.page.getByTestId('private-hand').getByRole('button', { name: /^The Open Road/ }).first().click();
    }, [{ spec: 'The caster has a real Roads route to Edoras', check: async () => await expect(caster.page.getByTestId('space-edoras')).toBeEnabled() }]);
    await steps.gesture(caster.page, 'earn-fell-price', `${caster.name} earns one Mithril at Edoras`, async () => {
      await caster.page.getByTestId('space-edoras').click(); accepted.value += 1;
    }, [{ spec: 'Every observer sees exactly one Mithril and ordered Battle deployment', check: async () => {
      for (const observer of seats) await expect(row(observer, caster.name).getByText('Mithril', { exact: true }).locator('..')).toContainText('1');
      await expect(caster.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible();
    } }, converged(accepted.value + 1)]);
    await steps.gesture(caster.page, 'deploy-caster-company', `${caster.name} deploys one Company`, async () => {
      await caster.page.getByRole('button', { name: 'Deploy 1', exact: true }).click(); accepted.value += 1;
    }, [{ spec: 'All three humans are genuine Battle participants', check: async () => {
      for (const observer of seats) {
        for (const participant of seats) await expect(observer.page.getByTestId('active-battle').locator('article').filter({ hasText: participant.name })).not.toContainText('0 Companies');
      }
    } }, converged(accepted.value + 1)]);

    for (let index = 0; index < 3; index += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `reveal-${index + 1}`, `${actor.name} Reveals`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
      }, [{ spec: 'The acting human exposes the real Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) }, converged(accepted.value + 1)]);
      await steps.gesture(actor.page, `finish-reveal-${index + 1}`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
      }, [{ spec: index < 2 ? 'Reveal authority advances clockwise' : 'The opposed Combat Fate window opens', check: async () => {
        if (index < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
        else for (const observer of seats) await expect(observer.page.getByText('Round 1 · Combat Fate')).toBeVisible();
      } }, converged(accepted.value + 1)]);
    }

    for (let index = 0; index < 3 && await currentSeat() !== caster; index += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `pass-to-caster-${index + 1}`, `${actor.name} passes Combat Fate`, async () => {
        await actor.page.getByTestId('pass-battle').click(); accepted.value += 1;
      }, [{ spec: 'Combat authority advances to the next participant', check: async () => await expect(actor.page.getByTestId('pass-battle')).toBeDisabled() }, converged(accepted.value + 1)]);
    }
    expect(await currentSeat()).toBe(caster);
    const opponent = seats.find((seat) => seat !== caster)!;
    const opponentForce = caster.page.getByTestId('active-battle').locator('article').filter({ hasText: opponent.name });
    const strengthBefore = Number((await opponentForce.getByText(/Strength/).textContent())?.match(/(\d+)/)?.[1] ?? '-1');
    await steps.gesture(caster.page, 'play-fell-sorcery', `${caster.name} pays one Mithril for Fell Sorcery`, async () => {
      await caster.page.getByRole('button', { name: /Play Fell Sorcery/ }).click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees the exact cost, public discard, and pending victim choice', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, caster.name).getByText('Mithril', { exact: true }).locator('..')).toContainText('0');
          await expect(observer.page.getByTestId('fate-discard')).toContainText('1 cards');
          await expect(observer.page.getByRole('heading', { name: 'Whose Strength will Fell Sorcery break?' })).toBeVisible();
        }
      } },
      { spec: 'Only the caster can choose a real opposing participant', check: async () => {
        await expect(caster.page.getByRole('button', { name: `Choose ${opponent.name} · lose 3 Strength` })).toBeEnabled();
        for (const observer of seats.filter((seat) => seat !== caster)) await expect(observer.page.getByRole('button', { name: `Choose ${opponent.name} · lose 3 Strength` })).toBeDisabled();
      } }, converged(accepted.value + 1)
    ]);
    await steps.gesture(caster.page, 'reload-fell-choice', `${caster.name} reloads the paid Fate choice`, async () => {
      await reloadGameClient(caster.page);
    }, [
      { spec: 'The zero balance, exact options, and actor authority replay immutably', check: async () => {
        await expect(row(caster, caster.name).getByText('Mithril', { exact: true }).locator('..')).toContainText('0');
        await expect(caster.page.getByRole('button', { name: `Choose ${opponent.name} · lose 3 Strength` })).toBeEnabled();
      } }, converged(accepted.value)
    ]);
    await steps.gesture(caster.page, 'choose-fell-victim', `${caster.name} breaks ${opponent.name}'s Strength`, async () => {
      await caster.page.getByRole('button', { name: `Choose ${opponent.name} · lose 3 Strength` }).click(); accepted.value += 1;
    }, [
      { spec: 'Every observer sees the exact clamped Strength loss', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('active-battle').locator('article').filter({ hasText: opponent.name })).toContainText(`${Math.max(0, strengthBefore - 3)} Strength`);
      } },
      { spec: 'The same caster retains Combat Fate authority after resolution', check: async () => await expect(caster.page.getByTestId('pass-battle')).toBeEnabled() },
      converged(accepted.value + 1)
    ]);

    steps.generateDocs('Fell Sorcery in an opposed Battle', 'Three isolated humans start a real match, draw Fell Sorcery privately, earn its Mithril price through Edoras, deploy three genuine forces, Reveal, pay the exact cost, preserve the ordered opponent choice through reload, and apply the clamped three-Strength loss with actor and observer agreement.');
  } finally {
    await table.close();
  }
});
