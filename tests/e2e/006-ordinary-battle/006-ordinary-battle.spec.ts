import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';

type Seat = { name: string; page: Page; context?: BrowserContext };

test('three humans deploy, Reveal, pass, and resolve an ordinary Battle', async ({ browser, page }, testInfo) => {
  test.setTimeout(180_000);
  const steps = new TestStepHelper(testInfo);
  const viewport = page.viewportSize() ?? { width: 1280, height: 960 };
  const guestAContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5189', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const guestBContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5189', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const seats: Seat[] = [
    { name: 'Mara', page },
    { name: 'Rin', page: await guestAContext.newPage(), context: guestAContext },
    { name: 'Pip', page: await guestBContext.newPage(), context: guestBContext }
  ];
  let accepted = 0;
  const converged = (expected: number, observers = seats): Verification => ({
    spec: `Every connected browser replays ${expected} accepted events with no diagnostics`,
    check: async () => {
      for (const seat of observers) await expect(seat.page.getByTestId('replay-health')).toHaveText(` · ${expected} accepted events · 0 replay diagnostics`, { timeout: 30_000 });
    }
  });
  const currentSeat = async () => {
    for (const seat of seats) if ((await seat.page.locator('footer').textContent())?.includes(`Current actor ${seat.name}`)) return seat;
    throw new Error('No current human is visible');
  };

  try {
    for (const seat of seats) {
      await seat.page.emulateMedia({ reducedMotion: 'reduce' });
      await seat.page.goto('/');
      await expect(seat.page.getByTestId('firebase-status')).toHaveText('Live Firebase ready', { timeout: 30_000 });
    }
    await steps.gesture(page, 'host-name', 'Mara enters her name', () => page.getByLabel('Display name').fill('Mara'), [
      { spec: 'The lobby receives the name through its labeled input', check: async () => await expect(page.getByLabel('Display name')).toHaveValue('Mara') }
    ]);
    const code = testInfo.project.name === 'phone' ? 'BTLPH' : 'BTLDS';
    await steps.gesture(page, 'host-code', 'Mara chooses a private Battle room', () => page.getByLabel(/Room code/).fill(code), [
      { spec: 'The five-character invitation is visible', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(code) }
    ]);
    await steps.gesture(page, 'create-room', 'Mara creates the live room', async () => {
      await page.getByRole('button', { name: 'Create game' }).click(); accepted += 1;
    }, [{ spec: 'The host sees the requested live room', check: async () => await expect(page.getByTestId('room-code')).toHaveText(code, { timeout: 30_000 }) }, converged(1, seats.slice(0, 1))]);

    for (const [index, seat] of seats.slice(1).entries()) {
      await steps.gesture(seat.page, `guest-${index + 1}-name`, `${seat.name} enters a name`, () => seat.page.getByLabel('Display name').fill(seat.name), [
        { spec: 'The isolated browser receives the player name', check: async () => await expect(seat.page.getByLabel('Display name')).toHaveValue(seat.name) }
      ]);
      await steps.gesture(seat.page, `guest-${index + 1}-code`, `${seat.name} enters the invitation`, () => seat.page.getByLabel(/Room code/).fill(code), [
        { spec: 'The invitation is entered through the real control', check: async () => await expect(seat.page.getByLabel(/Room code/)).toHaveValue(code) }
      ]);
      await steps.gesture(seat.page, `guest-${index + 1}-join`, `${seat.name} joins the room`, async () => {
        await seat.page.getByRole('button', { name: 'Join game' }).click(); accepted += 1;
      }, [{ spec: `Every connected browser sees ${index + 2} seats`, check: async () => {
        for (const observer of seats.slice(0, index + 2)) await expect(observer.page.locator('.player-list article')).toHaveCount(index + 2);
      } }, converged(accepted + 1, seats.slice(0, index + 2))]);
    }

    for (const [index, seat] of seats.entries()) {
      const commander = ['Aragorn', 'Galadriel', 'Gandalf'][index];
      await steps.gesture(seat.page, `seat-${index + 1}-commander`, `${seat.name} chooses ${commander}`, async () => {
        await seat.page.getByRole('button', { name: new RegExp(`^${commander}`) }).click(); accepted += 1;
      }, [{ spec: 'The unique identity is selected publicly', check: async () => await expect(seat.page.getByRole('button', { name: new RegExp(`^${commander}`) })).toHaveAttribute('aria-pressed', 'true') }, converged(accepted + 1)]);
      await steps.gesture(seat.page, `seat-${index + 1}-ready`, `${seat.name} readies`, async () => {
        await seat.page.getByRole('button', { name: 'I am ready' }).click(); accepted += 1;
      }, [{ spec: 'All observers see the ready state', check: async () => {
        for (const observer of seats) await expect(observer.page.locator('.player-list article').filter({ hasText: seat.name })).toContainText('Ready');
      } }, converged(accepted + 1)]);
    }
    await steps.gesture(page, 'battle-seed', 'Mara chooses the published Battle seed', () => page.getByLabel('Match seed').fill('battle-three'), [
      { spec: 'The deterministic setup seed is visible', check: async () => await expect(page.getByLabel('Match seed')).toHaveValue('battle-three') }
    ]);
    await steps.gesture(page, 'start-match', 'Mara starts the match', async () => {
      await page.getByRole('button', { name: 'Start seeded match' }).click(); accepted += 1;
    }, [
      { spec: 'Every human sees Crossing of the Isen as the active Battle', check: async () => {
        for (const seat of seats) await expect(seat.page.getByTestId('active-battle')).toContainText('Crossing of the Isen');
      } },
      { spec: 'The production board exposes Minas Tirith as the fifteenth executable destination', check: async () => await expect(page.getByText('15 / 22')).toBeVisible() },
      converged(accepted + 1)
    ]);

    const usedSpaces = new Set<string>();
    for (let deployment = 0; deployment < 3; deployment += 1) {
      const actor = await currentSeat();
      let chosenCard: ReturnType<Page['getByRole']> | null = null;
      let chosenSpace = '';
      for (const cardName of ['Armed Escort', 'Diplomatic Mission', 'Seek Allies', 'Reconnaissance']) {
        const candidate = actor.page.getByTestId('private-hand').getByRole('button', { name: new RegExp(`^${cardName}`) }).first();
        if (!await candidate.isVisible().catch(() => false)) continue;
        await candidate.click();
        for (const spaceId of ['minas-tirith', 'hidden-paths', 'ranger-mustering']) {
          if (!usedSpaces.has(spaceId) && await actor.page.getByTestId(`space-${spaceId}`).isEnabled()) {
            chosenCard = candidate;
            chosenSpace = spaceId;
            break;
          }
        }
        if (chosenSpace) break;
      }
      if (!chosenCard || !chosenSpace) throw new Error(`${actor.name} has no legal unused Battle destination`);
      usedSpaces.add(chosenSpace);
      await steps.observe(actor.page, `choose-battle-card-${deployment + 1}`, `${actor.name} chooses a card for Battle`, [
        { spec: `The real card gesture enables ${chosenSpace}`, check: async () => await expect(actor.page.getByTestId(`space-${chosenSpace}`)).toBeEnabled() }
      ]);
      await steps.gesture(actor.page, `enter-battle-space-${deployment + 1}`, `${actor.name} enters ${chosenSpace}`, async () => {
        await actor.page.getByTestId(`space-${chosenSpace}`).click(); accepted += 1;
      }, [
        { spec: 'The chosen Agent is publicly visible at the Battle destination', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId(`space-${chosenSpace}`)).toContainText(actor.name);
        } }, converged(accepted + 1)
      ]);

      if (await actor.page.getByRole('heading', { name: 'Trash a card from hand or discard?' }).isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `keep-ranger-cards-${deployment + 1}`, `${actor.name} declines the Ranger trash`, async () => {
          await actor.page.getByRole('button', { name: 'Keep all cards' }).click(); accepted += 1;
        }, [{ spec: 'The ordered Battle deployment follows the Ranger choice', check: async () => await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible() }, converged(accepted + 1)]);
      }
      if (await actor.page.getByTestId('scout-network').getByText('Choose an empty post for the Scout.').isVisible().catch(() => false)) {
        const post = actor.page.getByTestId('post-orthanc-eye');
        await steps.gesture(actor.page, `place-battle-scout-${deployment + 1}`, `${actor.name} resolves Reconnaissance first`, async () => {
          await post.click(); accepted += 1;
        }, [{ spec: 'The ordered Battle deployment follows Scout placement', check: async () => await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible() }, converged(accepted + 1)]);
      }
      if (await actor.page.getByRole('heading', { name: 'Trash Seek Allies?' }).isVisible().catch(() => false)) {
        await steps.gesture(actor.page, `keep-seek-${deployment + 1}`, `${actor.name} keeps Seek Allies`, async () => {
          await actor.page.getByRole('button', { name: 'Keep Seek Allies' }).click(); accepted += 1;
        }, [{ spec: 'Battle deployment follows the Journey choice', check: async () => await expect(actor.page.getByRole('heading', { name: 'Deploy Companies to the active Battle?' })).toBeVisible() }, converged(accepted + 1)]);
      }
      const deploymentButtons = actor.page.getByRole('button', { name: /^Deploy \d+$/ });
      const maximum = deploymentButtons.last();
      await steps.gesture(actor.page, `deploy-companies-${deployment + 1}`, `${actor.name} deploys the maximum legal force`, async () => {
        await maximum.click(); accepted += 1;
      }, [
        { spec: 'Every observer sees this participant’s Companies in the active Battle', check: async () => {
          for (const observer of seats) await expect(observer.page.getByTestId('active-battle').locator('article').filter({ hasText: actor.name })).not.toContainText('0 Companies');
        } }, converged(accepted + 1)
      ]);
    }

    for (let reveal = 0; reveal < 3; reveal += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `reveal-${reveal + 1}`, `${actor.name} Reveals Battle swords`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted += 1;
      }, [{ spec: 'All observers see the public Muster row and sword total', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`);
      } }, converged(accepted + 1)]);
      await steps.gesture(actor.page, `finish-reveal-${reveal + 1}`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted += 1;
      }, [{ spec: reveal < 2 ? 'The next participating human receives the turn' : 'The Combat Fate window opens after all three Reveals', check: async () => {
        if (reveal < 2) await expect(actor.page.locator('footer')).not.toContainText(`Current actor ${actor.name}`);
        else for (const observer of seats) await expect(observer.page.getByText(/Round 1 · Combat Fate/)).toBeVisible();
      } }, converged(accepted + 1)]);
    }

    const fateActor = await currentSeat();
    await steps.gesture(fateActor.page, 'reload-fate-window', `${fateActor.name} reloads during Combat Fate`, async () => { await fateActor.page.reload(); }, [
      { spec: 'Replay restores the same authorized pass decision and all three forces', check: async () => {
        await expect(fateActor.page.getByTestId('pass-battle')).toBeEnabled();
        await expect(fateActor.page.getByTestId('active-battle').locator('.battle-forces article')).toHaveCount(3);
      } }, converged(accepted)
    ]);
    for (let pass = 0; pass < 3; pass += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `pass-fate-${pass + 1}`, `${actor.name} passes Combat Fate`, async () => {
        await actor.page.getByTestId('pass-battle').click(); accepted += 1;
      }, [{ spec: pass < 2 ? 'Pass authority advances clockwise to the next participant' : 'The third consecutive pass resolves rewards, cleanup, and Recall', check: async () => {
        if (pass < 2) await expect(actor.page.getByTestId('pass-battle')).toBeDisabled();
        else for (const observer of seats) {
          await expect(observer.page.getByText('Round 2 · Agent turns')).toBeVisible();
          await expect(observer.page.getByTestId('activity-log')).toContainText('Crossing of the Isen is won');
          await expect(observer.page.getByTestId('active-battle')).toHaveCount(0);
        }
      } }, converged(accepted + 1)]);
    }

    steps.generateDocs(
      'Three-player ordinary Battle',
      'Three isolated humans start in the real lobby, enter three final board spaces, deploy legal forces, Reveal swords, reload inside the Combat Fate window, pass in order, and observe ranked rewards and cleanup.'
    );
  } finally {
    await guestAContext.close();
    await guestBContext.close();
  }
});
