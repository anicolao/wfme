import { expect, type Page } from '@playwright/test';

export async function waitForFirebaseSession(page: Page) {
  await expect(page.getByTestId('firebase-status')).toHaveText('Live Firebase ready', {
    timeout: 2_000
  });
  await page.waitForFunction(() => document.fonts.status === 'loaded', undefined, {
    timeout: 2_000
  });
}

async function seedEmulatorAuth(page: Page) {
  const response = await fetch('http://127.0.0.1:9204/identitytoolkit.googleapis.com/v1/accounts:signUp?key=e2e-api-key', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true }),
    signal: AbortSignal.timeout(2_000)
  });
  if (!response.ok) throw new Error(`Auth Emulator account setup failed with ${response.status}`);
  const credential = await response.json() as {
    idToken: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
  };
  const now = Date.now();
  await page.addInitScript(({ key, user }) => {
    sessionStorage.setItem(key, JSON.stringify(user));
  }, {
    key: 'firebase:authUser:e2e-api-key:[DEFAULT]',
    user: {
      uid: credential.localId,
      emailVerified: false,
      isAnonymous: true,
      providerData: [],
      stsTokenManager: {
        refreshToken: credential.refreshToken,
        accessToken: credential.idToken,
        expirationTime: now + Number(credential.expiresIn) * 1_000
      },
      createdAt: String(now),
      lastLoginAt: String(now),
      apiKey: 'e2e-api-key',
      appName: '[DEFAULT]'
    }
  });
}

export async function openFirebaseClients(pages: readonly Page[]) {
  for (const page of pages) await page.emulateMedia({ reducedMotion: 'reduce' });
  // Authentication is pre-seeded per isolated page, so clients can initialize
  // together and a multiplayer table pays one strict readiness window.
  await Promise.all(pages.map(async (page) => {
    await seedEmulatorAuth(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 2_000 });
    await waitForFirebaseSession(page);
  }));
}

export async function waitForCurrentSeat<T extends { name: string; page: Page }>(seats: readonly T[]): Promise<T> {
  let currentName = '';
  await expect.poll(async () => {
    const footers = await Promise.all(seats.map((seat) => seat.page.locator('footer').textContent()));
    const names = footers.map((footer) => seats.find((seat) => footer?.includes(`Current actor ${seat.name}`))?.name ?? '');
    currentName = names[0] ?? '';
    return currentName !== '' && names.every((name) => name === currentName) ? currentName : '';
  }, { timeout: 2_000 }).not.toBe('');
  return seats.find((seat) => seat.name === currentName)!;
}

export async function reloadGameClient(page: Page) {
  const replayHealthBefore = await page.getByTestId('replay-health').textContent({
    timeout: 2_000
  });
  await page.evaluate(() => { history.scrollRestoration = 'manual'; });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 2_000 });
  await waitForFirebaseSession(page);
  if (replayHealthBefore !== null) {
    await expect(page.getByTestId('replay-health')).toHaveText(replayHealthBefore, {
      timeout: 2_000
    });
  }
  await page.evaluate(() => scrollTo(0, 0));
}
