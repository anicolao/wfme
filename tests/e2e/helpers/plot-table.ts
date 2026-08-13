import { expect, type Browser, type BrowserContext, type Page, type TestInfo } from '@playwright/test';
import { TestStepHelper, type Verification } from './test-step-helper';
import { openFirebaseClients, waitForCurrentSeat } from './firebase-readiness';

export type PlotSeat = { name: string; page: Page; context?: BrowserContext };

const roomCodeOwners = new Map<string, string>();

function claimRoomCodes(seed: string, roomCodes: { phone: string; desktop: string }) {
  for (const code of [roomCodes.phone, roomCodes.desktop]) {
    const owner = roomCodeOwners.get(code);
    if (owner && owner !== seed) {
      throw new Error(`E2E room code ${code} is already claimed by seed ${owner}; ${seed} must use a unique code.`);
    }
    roomCodeOwners.set(code, seed);
  }
}

export async function startPlotTable(
  browser: Browser,
  page: Page,
  testInfo: TestInfo,
  steps: TestStepHelper,
  seed: string,
  roomCodes: { phone: string; desktop: string },
  commanders: readonly [string, string, string] = ['Aragorn', 'Galadriel', 'Gandalf'],
  warEffortsEnabled = false
) {
  claimRoomCodes(seed, roomCodes);
  const viewport = page.viewportSize() ?? { width: 1280, height: 960 };
  const guestAContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5190', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const guestBContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5190', viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const seats: PlotSeat[] = [
    { name: 'Mara', page },
    { name: 'Rin', page: await guestAContext.newPage(), context: guestAContext },
    { name: 'Pip', page: await guestBContext.newPage(), context: guestBContext }
  ];
  const accepted = { value: 0 };
  const converged = (count: number, observers = seats): Verification => ({
    spec: `Every connected browser replays ${count} accepted events with no diagnostics`,
    check: async () => {
      for (const seat of observers) await expect(seat.page.getByTestId('replay-health')).toHaveText(` · ${count} accepted events · 0 replay diagnostics`, { timeout: 2_000 });
    }
  });
  const currentSeat = async () => waitForCurrentSeat(seats);
  const row = (observer: PlotSeat, name: string) => observer.page.locator('.players article').filter({ hasText: name });
  const commanderForesightPending = (
    actor: PlotSeat,
    expectedFateCount: number,
    expectedFateName?: string
  ): Verification[] => [
    {
      spec: 'The Fate draw pauses at Galadriel’s once-per-round Foresight without drawing early',
      check: async () => {
        for (const observer of seats) {
          await expect(row(observer, actor.name).getByText('Fate', { exact: true }).locator('..')).toContainText(String(expectedFateCount));
          await expect(observer.page.getByRole('heading', { name: 'Which Fate does Galadriel foresee?' })).toBeVisible();
        }
      }
    },
    {
      spec: 'Only Galadriel can identify and choose either exact Fate option',
      check: async () => {
        const actorOptions = actor.page.getByTestId('pending-choice').getByRole('button', { name: /^Take / });
        await expect(actorOptions).toHaveCount(2);
        if (expectedFateName) {
          await expect(actor.page.getByRole('button', { name: `Take ${expectedFateName}`, exact: true })).toBeEnabled();
        }
        for (const observer of seats.filter((seat) => seat !== actor)) {
          for (const ordinal of [1, 2]) {
            await expect(observer.page.getByRole('button', { name: `Private Fate option ${ordinal}`, exact: true })).toBeDisabled();
          }
          if (expectedFateName) await expect(observer.page.getByText(expectedFateName, { exact: true })).toHaveCount(0);
        }
      }
    }
  ];
  const resolveCommanderForesight = async (
    actor: PlotSeat,
    id: string,
    desiredFateName?: string,
    drawCount = 1,
    continuationVerifications: Verification[] = []
  ) => {
    const fateCounter = row(actor, actor.name).getByText('Fate', { exact: true }).locator('..');
    const fateBeforeText = await fateCounter.textContent();
    const fateBefore = Number(fateBeforeText?.match(/Fate\s*(\d+)/)?.[1] ?? Number.NaN);
    const discardText = await actor.page.getByTestId('fate-discard').textContent();
    const discardBefore = Number(discardText?.match(/(\d+) cards/)?.[1] ?? Number.NaN);
    expect(Number.isFinite(fateBefore)).toBe(true);
    expect(Number.isFinite(discardBefore)).toBe(true);
    const option = desiredFateName
      ? actor.page.getByRole('button', { name: `Take ${desiredFateName}`, exact: true })
      : actor.page.getByTestId('pending-choice').getByRole('button', { name: /^Take / }).first();
    const optionText = (await option.textContent())?.trim() ?? 'a private Fate card';
    await steps.gesture(actor.page, id, `${actor.name} resolves Foresight and takes ${optionText.replace(/^Take /, '')}`, async () => {
      await option.click(); accepted.value += 1;
    }, [
      { spec: `Exactly ${drawCount} private Fate ${drawCount === 1 ? 'card enters' : 'cards enter'} the acting hand`, check: async () => {
        for (const observer of seats) {
          await expect(row(observer, actor.name).getByText('Fate', { exact: true }).locator('..')).toContainText(String(fateBefore + drawCount));
        }
      } },
      { spec: 'The unchosen exact Fate card goes to the deck bottom without entering the public discard', check: async () => {
        for (const observer of seats) {
          await expect(observer.page.getByTestId('fate-discard')).toContainText(`${discardBefore} cards`);
          await expect(observer.page.getByTestId('activity-log')).toContainText('puts the other on the bottom of the Fate deck');
        }
      } },
      { spec: 'The private Commander choice closes before the interrupted effect continues', check: async () => {
        for (const observer of seats) await expect(observer.page.getByRole('heading', { name: 'Which Fate does Galadriel foresee?' })).toHaveCount(0);
      } },
      ...continuationVerifications,
      converged(accepted.value + 1)
    ]);
  };

  await openFirebaseClients(seats.map((seat) => seat.page));
  await steps.gesture(page, 'host-name', 'Mara enters a table name', () => page.getByLabel('Display name').fill('Mara'), [
    { spec: 'The real lobby accepts the host name', check: async () => await expect(page.getByLabel('Display name')).toHaveValue('Mara') }
  ]);
  const code = testInfo.project.name === 'phone' ? roomCodes.phone : roomCodes.desktop;
  await steps.gesture(page, 'host-code', 'Mara enters the Plot Fate room code', () => page.getByLabel(/Room code/).fill(code), [
    { spec: 'The exact invitation is visible', check: async () => await expect(page.getByLabel(/Room code/)).toHaveValue(code) }
  ]);
  await steps.gesture(page, 'create-room', 'Mara creates the Firebase room', async () => {
    await page.getByRole('button', { name: 'Create game' }).click(); accepted.value += 1;
  }, [{ spec: 'The requested room opens', check: async () => await expect(page.getByTestId('room-code')).toHaveText(code, { timeout: 2_000 }) }, converged(accepted.value + 1, seats.slice(0, 1))]);
  for (const [index, seat] of seats.slice(1).entries()) {
    await steps.gesture(seat.page, `guest-${index + 1}-name`, `${seat.name} enters a table name`, () => seat.page.getByLabel('Display name').fill(seat.name), [
      { spec: 'The isolated browser retains the name', check: async () => await expect(seat.page.getByLabel('Display name')).toHaveValue(seat.name) }
    ]);
    await steps.gesture(seat.page, `guest-${index + 1}-code`, `${seat.name} enters the invitation`, () => seat.page.getByLabel(/Room code/).fill(code), [
      { spec: 'The isolated browser uses the shared invitation', check: async () => await expect(seat.page.getByLabel(/Room code/)).toHaveValue(code) }
    ]);
    await steps.gesture(seat.page, `guest-${index + 1}-join`, `${seat.name} joins the room`, async () => {
      await seat.page.getByRole('button', { name: 'Join game' }).click(); accepted.value += 1;
    }, [{ spec: 'Every connected lobby sees the joined seat', check: async () => {
      for (const observer of seats.slice(0, index + 2)) await expect(observer.page.getByText(seat.name, { exact: true })).toBeVisible();
    } }, converged(accepted.value + 1, seats.slice(0, index + 2))]);
  }
  if (warEffortsEnabled) {
    await steps.gesture(page, 'enable-war-efforts', 'Mara enables the optional War Effort module', async () => {
      await page.getByLabel('Enable optional War Efforts').check(); accepted.value += 1;
    }, [
      { spec: 'Every connected lobby publicly shows the enabled module before readiness', check: async () => {
        for (const seat of seats) await expect(seat.page.getByText('Enabled', { exact: true })).toBeVisible();
      } },
      converged(accepted.value + 1)
    ]);
  }
  for (const [index, seat] of seats.entries()) {
    const commander = commanders[index];
    await steps.gesture(seat.page, `commander-${index + 1}`, `${seat.name} selects ${commander}`, async () => {
      await seat.page.getByRole('button', { name: new RegExp(`^${commander}`) }).click(); accepted.value += 1;
    }, [{ spec: 'The unique identity is public', check: async () => await expect(seat.page.getByRole('button', { name: new RegExp(`^${commander}`) })).toHaveAttribute('aria-pressed', 'true') }, converged(accepted.value + 1)]);
    await steps.gesture(seat.page, `ready-${index + 1}`, `${seat.name} readies`, async () => {
      await seat.page.getByRole('button', { name: 'I am ready' }).click(); accepted.value += 1;
    }, [{ spec: 'Every observer sees the ready state', check: async () => {
      for (const observer of seats) await expect(observer.page.locator('.player-list article').filter({ hasText: seat.name })).toContainText('Ready');
    } }, converged(accepted.value + 1)]);
  }
  await steps.gesture(page, 'plot-seed', 'Mara enters the published Plot Fate seed', () => page.getByLabel('Match seed').fill(seed), [
    { spec: 'The deterministic seed is visible', check: async () => await expect(page.getByLabel('Match seed')).toHaveValue(seed) }
  ]);
  await steps.gesture(page, 'start-match', 'Mara starts the Plot Fate match', async () => {
    await page.getByRole('button', { name: 'Start seeded match' }).click(); accepted.value += 1;
  }, [{ spec: 'Every human reaches the complete production board', check: async () => {
    for (const seat of seats) await expect(seat.page.locator('[data-testid^="space-"]')).toHaveCount(22);
  } }, converged(accepted.value + 1)]);

  return {
    seats,
    accepted,
    converged,
    currentSeat,
    row,
    commanderForesightPending,
    resolveCommanderForesight,
    close: async () => {
      await guestAContext.close();
      await guestBContext.close();
    }
  };
}
