import { expect, test } from '@playwright/test';

test('the implementation shell is responsive and accessible', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page).toHaveTitle('The War for Middle-earth — Web prototype');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The War for Middle-earth');
  await expect(page.getByRole('status')).toHaveText('Implementation foundation · PR1');
  await expect(page.getByRole('img', { name: 'Illustrated board layout concept' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Round phases' }).getByRole('listitem')).toHaveCount(5);
  await expect(page.getByText('22 destinations')).toBeVisible();
  await expect(page.getByText('54 Chronicle cards')).toBeVisible();
  await expect(page.getByTestId('build-marker')).toHaveText('Build e2e-tes');

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(new URL(manifestHref ?? '', page.url()).pathname).toBe('/manifest.webmanifest');
  const manifest = await page.request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({
    name: 'The War for Middle-earth',
    display: 'standalone',
    theme_color: '#17251f'
  });

  const viewport = page.viewportSize();
  expect(viewport).toEqual(
    testInfo.project.name === 'phone'
      ? { width: 393, height: 852 }
      : { width: 1280, height: 960 }
  );
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);

  for (const link of await page.getByRole('link').all()) {
    await expect(link).toHaveAccessibleName(/.+/);
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});
