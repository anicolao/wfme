import { expect, test } from '@playwright/test';
import { openFirebaseClients, reloadGameClient, waitForCurrentSeat } from '../helpers/firebase-readiness';
import { TestStepHelper } from '../helpers/test-step-helper';

test('one human completes a round against two deterministic Rivals', async ({ page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const accepted = { value: 0 };
  const code = testInfo.project.name === 'phone' ? 'RVSLP' : 'RVSLD';
  const converged = (count: number) => ({
    spec: `${count} accepted events replay with no diagnostics`,
    check: async () => await expect(page.getByTestId('replay-health')).toHaveText(` · ${count} accepted events · 0 replay diagnostics`)
  });

  await openFirebaseClients([page]);
  await steps.gesture(page, 'host-name', 'Mara enters the solo table name', () => page.getByLabel('Display name').fill('Mara'), [
    { spec: 'The local identity is retained', check: async () => await expect(page.getByLabel('Display name')).toHaveValue('Mara') }
  ]);
  await steps.gesture(page, 'host-code', 'Mara enters a private solo room code', () => page.getByLabel(/Room code/).fill(code), [
    { spec: 'The exact private invitation is visible', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(code) }
  ]);
  await steps.gesture(page, 'create-room', 'Mara creates the solo room', async () => {
    await page.getByRole('button', { name: 'Create game' }).click(); accepted.value += 1;
  }, [{ spec: 'The requested room opens', check: async () => await expect(page.getByTestId('room-code')).toHaveText(code) }, converged(1)]);
  await steps.gesture(page, 'choose-solo', 'Mara selects one human against two Rivals', async () => {
    await page.getByLabel('Game format').selectOption('solo'); accepted.value += 1;
  }, [
    { spec: 'The lobby publishes the solo format and Captain difficulty', check: async () => {
      await expect(page.getByRole('strong').filter({ hasText: 'Solo + 2 Rivals' })).toBeVisible();
      await expect(page.getByLabel('Rival difficulty')).toHaveValue('captain');
    } },
    converged(2)
  ]);
  await steps.gesture(page, 'choose-commander', 'Mara selects Aragorn', async () => {
    await page.getByRole('button', { name: /^Aragorn/ }).click(); accepted.value += 1;
  }, [{ spec: 'Aragorn is the unique selected human identity', check: async () => await expect(page.getByRole('button', { name: /^Aragorn/ })).toHaveAttribute('aria-pressed', 'true') }, converged(3)]);
  await steps.gesture(page, 'ready', 'Mara readies the solo table', async () => {
    await page.getByRole('button', { name: 'I am ready' }).click(); accepted.value += 1;
  }, [{ spec: 'One ready human satisfies the solo player count', check: async () => await expect(page.getByRole('button', { name: 'Start seeded match' })).toBeEnabled() }, converged(4)]);
  await steps.gesture(page, 'seed', 'Mara publishes the Rival seed', () => page.getByLabel('Match seed').fill('rivals-browser-solo'), [
    { spec: 'The deterministic seed is visible', check: async () => await expect(page.getByLabel('Match seed')).toHaveValue('rivals-browser-solo') }
  ]);
  await steps.gesture(page, 'start', 'Mara starts the solo match', async () => {
    await page.getByRole('button', { name: 'Start seeded match' }).click(); accepted.value += 1;
  }, [
    { spec: 'The board shows one human and two distinct public Rival profiles', check: async () => {
      await expect(page.locator('.players article')).toHaveCount(3);
      await expect(page.locator('.players article > strong').filter({ hasText: /^Rival I$/ })).toBeVisible();
      await expect(page.locator('.players article > strong').filter({ hasText: /^Rival II$/ })).toBeVisible();
      await expect(page.getByTestId('rival-status')).toContainText('Automated opposition · captain');
    } },
    { spec: 'All three participants have a public Objective and the shared action deck is visible', check: async () => {
      await expect(page.locator('.players article').getByText(/White Tree|Horse|Star/)).toHaveCount(3);
      await expect(page.getByTestId('rival-status')).toContainText('action cards facedown');
    } },
    converged(5)
  ]);
  await steps.gesture(page, 'reveal', 'Mara Reveals instead of placing an Agent', async () => {
    await page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
  }, [{ spec: 'The ordinary human Reveal remains interactive', check: async () => await expect(page.getByRole('button', { name: 'Finish Reveal' })).toBeEnabled() }, converged(6)]);
  await steps.gesture(page, 'finish-round', 'Mara finishes Reveal and the Rivals complete the round automatically', async () => {
    await page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
  }, [
    { spec: 'Both Rivals use their ready Agents, skip Reveal and resolve Battle without synthetic client events', check: async () => {
      await expect(page.getByTestId('activity-log')).toContainText('Rival');
      await expect(page.getByTestId('rival-status')).toContainText('discarded');
      await expect(page.locator('.table-header .eyebrow')).toContainText('Round 2');
    } },
    converged(7)
  ]);
  await steps.gesture(page, 'reload', 'Mara reloads the automated round', async () => {
    await reloadGameClient(page);
  }, [
    { spec: 'Immutable replay restores the same round, profiles, resources, Objectives and action deck', check: async () => {
      await expect(page.locator('.table-header .eyebrow')).toContainText('Round 2');
      await expect(page.locator('.players article')).toHaveCount(3);
      await expect(page.getByTestId('replay-health')).toContainText('0 replay diagnostics');
    } },
    converged(7)
  ]);
  steps.generateDocs('Solo Rivals', 'One isolated human configures a Captain-difficulty solo table, receives two distinct automated opponents and public Objectives, completes an ordinary Reveal, watches every Rival Agent and Battle step resolve, and reloads the deterministic round-two state.', 'SOLO.md');
});

test('two humans alternate around one Rival', async ({ browser, page }, testInfo) => {
  const steps = new TestStepHelper(testInfo);
  const viewport = page.viewportSize() ?? { width: 1280, height: 960 };
  const guestContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5190', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const guestPage = await guestContext.newPage();
  const seats = [{ name: 'Mara', page }, { name: 'Rin', page: guestPage }];
  const accepted = { value: 0 };
  const code = testInfo.project.name === 'phone' ? 'RV2PP' : 'RV2PD';
  const converged = (count: number, observers = seats) => ({
    spec: `Both isolated humans replay ${count} accepted events with no diagnostics`,
    check: async () => {
      for (const seat of observers) await expect(seat.page.getByTestId('replay-health')).toHaveText(` · ${count} accepted events · 0 replay diagnostics`);
    }
  });

  try {
    await openFirebaseClients(seats.map((seat) => seat.page));
    await steps.gesture(page, 'two-host-name', 'Mara enters the two-player table name', () => page.getByLabel('Display name').fill('Mara'), [
      { spec: 'The host identity is retained', check: async () => await expect(page.getByLabel('Display name')).toHaveValue('Mara') }
    ]);
    await steps.gesture(page, 'two-host-code', 'Mara enters the two-player invitation', () => page.getByLabel(/Room code/).fill(code), [
      { spec: 'The invitation is exact', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(code) }
    ]);
    await steps.gesture(page, 'two-create', 'Mara creates the room', async () => {
      await page.getByRole('button', { name: 'Create game' }).click(); accepted.value += 1;
    }, [{ spec: 'The host room opens', check: async () => await expect(page.getByTestId('room-code')).toHaveText(code) }, converged(1, seats.slice(0, 1))]);
    await guestPage.getByLabel('Display name').fill('Rin');
    await guestPage.getByLabel(/Room code/).fill(code);
    await steps.gesture(guestPage, 'two-join', 'Rin joins from an isolated browser', async () => {
      await guestPage.getByRole('button', { name: 'Join game' }).click(); accepted.value += 1;
    }, [{ spec: 'Both humans see both lobby seats', check: async () => {
      for (const seat of seats) await expect(seat.page.getByText('Rin', { exact: true })).toBeVisible();
    } }, converged(2)]);
    await steps.gesture(page, 'two-choose-format', 'Mara seats one Rival between the humans', async () => {
      await page.getByLabel('Game format').selectOption('two-player'); accepted.value += 1;
    }, [{ spec: 'Both lobbies publish the two-human Rival format', check: async () => {
      for (const seat of seats) await expect(seat.page.getByRole('strong').filter({ hasText: '2 humans + Rival' })).toBeVisible();
    } }, converged(3)]);
    for (const [index, seat] of seats.entries()) {
      const commander = index === 0 ? 'Aragorn' : 'Treebeard';
      await steps.gesture(seat.page, `two-commander-${index + 1}`, `${seat.name} selects ${commander}`, async () => {
        await seat.page.getByRole('button', { name: new RegExp(`^${commander}`) }).click(); accepted.value += 1;
      }, [{ spec: 'The selected Commander is public and unique', check: async () => await expect(seat.page.getByRole('button', { name: new RegExp(`^${commander}`) })).toHaveAttribute('aria-pressed', 'true') }, converged(accepted.value + 1)]);
      await steps.gesture(seat.page, `two-ready-${index + 1}`, `${seat.name} readies`, async () => {
        await seat.page.getByRole('button', { name: 'I am ready' }).click(); accepted.value += 1;
      }, [{ spec: 'Readiness converges in both lobbies', check: async () => {
        for (const observer of seats) await expect(observer.page.locator('.player-list article').filter({ hasText: seat.name })).toContainText('Ready');
      } }, converged(accepted.value + 1)]);
    }
    await page.getByLabel('Match seed').fill('rivals-browser-two');
    await steps.gesture(page, 'two-start', 'Mara starts the two-player Rival match', async () => {
      await page.getByRole('button', { name: 'Start seeded match' }).click(); accepted.value += 1;
    }, [{ spec: 'Both clients show exactly two humans and one shared Rival', check: async () => {
      for (const seat of seats) {
        await expect(seat.page.locator('.players article')).toHaveCount(3);
        await expect(seat.page.locator('.players article').nth(1)).toContainText('Rival I');
      }
    } }, converged(8)]);

    const first = await waitForCurrentSeat(seats);
    const second = seats.find((seat) => seat !== first)!;
    await steps.gesture(first.page, 'two-first-reveal', `${first.name} Reveals first`, async () => {
      await first.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted.value += 1;
    }, [{ spec: 'The first human keeps authority through their ordinary Reveal', check: async () => await expect(first.page.getByRole('button', { name: 'Finish Reveal' })).toBeEnabled() }, converged(9)]);
    await steps.gesture(first.page, 'two-first-finish', `${first.name} finishes and the middle Rival acts once`, async () => {
      await first.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted.value += 1;
    }, [
      { spec: 'Turn authority advances through the automated middle seat to the other human', check: async () => await expect(second.page.locator('footer')).toContainText(`Current actor ${second.name}`) },
      { spec: 'Exactly one Rival Agent is visibly committed before the second human acts', check: async () => {
        for (const seat of seats) await expect(seat.page.locator('[data-testid^="space-"]').filter({ hasText: 'Agent · Rival I' })).toHaveCount(1);
      } },
      converged(10)
    ]);
    await steps.gesture(second.page, 'two-reload-middle', `${second.name} reloads at the alternating seat boundary`, async () => {
      await reloadGameClient(second.page);
    }, [
      { spec: 'Replay retains the Rival occupation and second-human authority', check: async () => {
        await expect(second.page.locator('footer')).toContainText(`Current actor ${second.name}`);
        await expect(second.page.locator('[data-testid^="space-"]').filter({ hasText: 'Agent · Rival I' })).toHaveCount(1);
      } },
      converged(10)
    ]);
    steps.generateDocs('Two-player Rival', 'Two isolated humans configure a shared Rival, start in deterministic human–Rival–human order, finish the first human Reveal, observe exactly one automatic middle-seat action, and reload the second human’s authority.', 'TWO_PLAYER.md');
  } finally {
    await guestContext.close();
  }
});
