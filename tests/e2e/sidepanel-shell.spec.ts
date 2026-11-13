import { expect, test, chromium } from '@playwright/test';

test('loads the built sidepanel shell with branded controls', async () => {
  const extensionPath = decodeURIComponent(
    new URL('../../.output/chrome-mv3', import.meta.url).pathname,
  );
  const context = await chromium.launchPersistentContext('', {
    headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });

  try {
    const serviceWorker =
      context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    const extensionId = new URL(serviceWorker.url()).host;
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);

    await expect(page.getByRole('heading', { name: 'Інспектор кольорів' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pick element' })).toBeVisible();
    await expect(page.locator('body')).toContainText('No analytics');
  } finally {
    await context.close();
  }
});
