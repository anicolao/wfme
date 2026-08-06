import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { TestStepHelper, type Verification } from '../helpers/test-step-helper';
import { openFirebaseClients, reloadGameClient, waitForCurrentSeat } from '../helpers/firebase-readiness';

type Seat = { name: string; page: Page; context?: BrowserContext };

test('Secret Ways places a Scout and resumes the same Agent turn', async ({ browser, page }, testInfo) => {
  test.setTimeout(300_000);
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
  const converged = (count: number, observers = seats): Verification => ({
    spec: `Every connected browser replays ${count} accepted events with no diagnostics`,
    check: async () => {
      for (const seat of observers) await expect(seat.page.getByTestId('replay-health')).toHaveText(` · ${count} accepted events · 0 replay diagnostics`, { timeout: 2_000 });
    }
  });
  const currentSeat = async () => waitForCurrentSeat(seats);
  const row = (observer: Seat, name: string) => observer.page.locator('.players article').filter({ hasText: name });

  try {
    await openFirebaseClients(seats.map((seat) => seat.page));
    await steps.gesture(page, 'host-name', 'Mara enters a table name', () => page.getByLabel('Display name').fill('Mara'), [
      { spec: 'The real lobby accepts the host name', check: async () => await expect(page.getByLabel('Display name')).toHaveValue('Mara') }
    ]);
    const code = testInfo.project.name === 'phone' ? 'PLTPH' : 'PLTDS';
    await steps.gesture(page, 'host-code', 'Mara enters the Plot Fate room code', () => page.getByLabel(/Room code/).fill(code), [
      { spec: 'The exact invitation is visible', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(code) }
    ]);
    await steps.gesture(page, 'create-room', 'Mara creates the Firebase room', async () => {
      await page.getByRole('button', { name: 'Create game' }).click(); accepted += 1;
    }, [{ spec: 'The requested room opens', check: async () => await expect(page.getByTestId('room-code')).toHaveText(code, { timeout: 2_000 }) }, converged(accepted + 1, seats.slice(0, 1))]);
    for (const [index, seat] of seats.slice(1).entries()) {
      await steps.gesture(seat.page, `guest-${index + 1}-name`, `${seat.name} enters a table name`, () => seat.page.getByLabel('Display name').fill(seat.name), [
        { spec: 'The isolated browser retains the name', check: async () => await expect(seat.page.getByLabel('Display name')).toHaveValue(seat.name) }
      ]);
      await steps.gesture(seat.page, `guest-${index + 1}-code`, `${seat.name} enters the invitation`, () => seat.page.getByLabel(/Room code/).fill(code), [
        { spec: 'The isolated browser uses the shared invitation', check: async () => await expect(seat.page.getByLabel(/Room code/)).toHaveValue(code) }
      ]);
      await steps.gesture(seat.page, `guest-${index + 1}-join`, `${seat.name} joins the room`, async () => {
        await seat.page.getByRole('button', { name: 'Join game' }).click(); accepted += 1;
      }, [{ spec: 'Every connected lobby sees the joined seat', check: async () => {
        for (const observer of seats.slice(0, index + 2)) await expect(observer.page.getByText(seat.name, { exact: true })).toBeVisible();
      } }, converged(accepted + 1, seats.slice(0, index + 2))]);
    }
    for (const [index, seat] of seats.entries()) {
      const commander = ['Aragorn', 'Galadriel', 'Gandalf'][index];
      await steps.gesture(seat.page, `commander-${index + 1}`, `${seat.name} selects ${commander}`, async () => {
        await seat.page.getByRole('button', { name: new RegExp(`^${commander}`) }).click(); accepted += 1;
      }, [{ spec: 'The unique identity is public', check: async () => await expect(seat.page.getByRole('button', { name: new RegExp(`^${commander}`) })).toHaveAttribute('aria-pressed', 'true') }, converged(accepted + 1)]);
      await steps.gesture(seat.page, `ready-${index + 1}`, `${seat.name} readies`, async () => {
        await seat.page.getByRole('button', { name: 'I am ready' }).click(); accepted += 1;
      }, [{ spec: 'Every observer sees the ready state', check: async () => {
        for (const observer of seats) await expect(observer.page.locator('.player-list article').filter({ hasText: seat.name })).toContainText('Ready');
      } }, converged(accepted + 1)]);
    }
    await steps.gesture(page, 'plot-seed', 'Mara enters the published Plot Fate seed', () => page.getByLabel('Match seed').fill('plot-0'), [
      { spec: 'The deterministic seed is visible', check: async () => await expect(page.getByLabel('Match seed')).toHaveValue('plot-0') }
    ]);
    await steps.gesture(page, 'start-match', 'Mara starts the Plot Fate match', async () => {
      await page.getByRole('button', { name: 'Start seeded match' }).click(); accepted += 1;
    }, [{ spec: 'Every human reaches the complete production board', check: async () => {
      for (const seat of seats) await expect(seat.page.getByText('22 / 22')).toBeVisible();
    } }, converged(accepted + 1)]);

    const fateHolder = await currentSeat();
    await steps.gesture(fateHolder.page, 'select-hall-card', `${fateHolder.name} selects Armed Escort`, async () => {
      await fateHolder.page.getByTestId('private-hand').getByRole('button', { name: /^Armed Escort/ }).first().click();
    }, [{ spec: 'The Council icon enables Hall of Fire through the actual card control', check: async () => await expect(fateHolder.page.getByTestId('space-hall-fire')).toBeEnabled() }]);
    await steps.gesture(fateHolder.page, 'enter-hall', `${fateHolder.name} enters Hall of Fire`, async () => {
      await fateHolder.page.getByTestId('space-hall-fire').click(); accepted += 1;
    }, [
      { spec: 'Every observer sees one private Fate card and the public Hall occupation', check: async () => {
        for (const observer of seats) {
          await expect(row(observer, fateHolder.name)).toContainText('Fate1');
          await expect(observer.page.getByTestId('space-hall-fire')).toContainText(fateHolder.name);
        }
      } },
      { spec: 'Only the owner can identify Secret Ways', check: async () => {
        await expect(fateHolder.page.getByRole('button', { name: /Play Secret Ways/ })).toHaveCount(0);
        for (const observer of seats.filter((seat) => seat !== fateHolder)) await expect(observer.page.getByText('Secret Ways')).toHaveCount(0);
      } },
      converged(accepted + 1)
    ]);

    for (let other = 0; other < 2; other += 1) {
      const actor = await currentSeat();
      await steps.gesture(actor.page, `other-reveal-${other + 1}`, `${actor.name} Reveals`, async () => {
        await actor.page.getByRole('button', { name: 'Reveal remaining hand' }).click(); accepted += 1;
      }, [{ spec: 'The actual hand becomes the public Muster row', check: async () => await expect(actor.page.getByTestId('reveal-panel')).toContainText(`${actor.name} Reveals`) }, converged(accepted + 1)]);
      await steps.gesture(actor.page, `other-finish-${other + 1}`, `${actor.name} finishes Reveal`, async () => {
        await actor.page.getByRole('button', { name: 'Finish Reveal' }).click(); accepted += 1;
      }, [{ spec: 'Authority advances without exposing the Fate identity', check: async () => {
        await expect(actor.page.getByTestId('reveal-panel')).toHaveCount(0);
        for (const observer of seats.filter((seat) => seat !== fateHolder)) await expect(observer.page.getByText('Secret Ways')).toHaveCount(0);
      } }, converged(accepted + 1)]);
    }

    expect(await currentSeat()).toBe(fateHolder);
    await steps.gesture(fateHolder.page, 'play-secret-ways', `${fateHolder.name} plays Secret Ways during the Agent turn`, async () => {
      await fateHolder.page.getByRole('button', { name: 'Play Secret Ways · Place 1 Scout' }).click(); accepted += 1;
    }, [
      { spec: 'The card enters the public Fate discard and opens mandatory Scout placement', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('fate-discard')).toContainText('1 cards');
        await expect(fateHolder.page.getByTestId('scout-network')).toContainText('Choose an empty post for the Scout.');
      } },
      { spec: 'Observers learn the played identity only from the public Chronicle', check: async () => {
        for (const observer of seats) await expect(observer.page.getByTestId('activity-log')).toContainText('plays Secret Ways during their Agent turn');
      } },
      converged(accepted + 1)
    ]);
    await steps.gesture(fateHolder.page, 'reload-pending-plot', `${fateHolder.name} reloads during Secret Ways`, async () => {
      await reloadGameClient(fateHolder.page);
    }, [
      { spec: 'The authorized Scout decision survives immutable replay', check: async () => await expect(fateHolder.page.getByTestId('scout-network')).toContainText('Choose an empty post for the Scout.') },
      converged(accepted)
    ]);
    await steps.gesture(fateHolder.page, 'place-plot-scout', `${fateHolder.name} places the Secret Ways Scout`, async () => {
      await fateHolder.page.getByTestId('post-orthanc-eye').click(); accepted += 1;
    }, [
      { spec: 'Every observer sees the same Scout and finite supply', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('post-orthanc-eye')).toContainText(`Scout · ${fateHolder.name}`);
          await expect(row(observer, fateHolder.name)).toContainText('Scouts2 supply');
        }
      } },
      { spec: 'The same human resumes the same Agent turn with one Agent still available', check: async () => {
        await expect(fateHolder.page.getByRole('button', { name: 'Reveal remaining hand' })).toBeVisible();
        await expect(row(fateHolder, fateHolder.name)).toContainText('Agents1');
        await expect(fateHolder.page.locator('footer')).toContainText(`Current actor ${fateHolder.name}`);
      } },
      converged(accepted + 1)
    ]);
    await steps.gesture(fateHolder.page, 'select-resumed-card', `${fateHolder.name} selects The Open Road after Plot resolution`, async () => {
      await fateHolder.page.getByTestId('private-hand').getByRole('button', { name: /^The Open Road/ }).first().click();
    }, [{ spec: 'The resumed Agent turn enables a real Roads destination', check: async () => await expect(fateHolder.page.getByTestId('space-take-war-effort')).toBeEnabled() }]);
    await steps.gesture(fateHolder.page, 'continue-agent-turn', `${fateHolder.name} continues to Take Up a War Effort`, async () => {
      await fateHolder.page.getByTestId('space-take-war-effort').click(); accepted += 1;
    }, [
      { spec: 'The same turn spends the remaining Agent and resolves its board reward', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('space-take-war-effort')).toContainText(fateHolder.name);
          await expect(row(observer, fateHolder.name)).toContainText('Agents0');
          await expect(row(observer, fateHolder.name)).toContainText('Gold2');
        }
      } },
      converged(accepted + 1)
    ]);
    steps.generateDocs(
      'Secret Ways Plot Fate tracer',
      'Three isolated human browsers draw a private Secret Ways card through Hall of Fire, preserve its identity boundary, play it during the owner’s Agent turn, reload the pending Scout decision, place the Scout, and prove the same turn resumes through another real Agent placement.'
    );
  } finally {
    await guestAContext.close();
    await guestBContext.close();
  }
});
