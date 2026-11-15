import { test, expect } from '@playwright/test';

test('CANARY user completes the synthetic shopping journey', async ({
  page,
  request,
}) => {
  // Infrastructure health must be healthy.
  const health = await request.get('/actuator/health');
  expect(health.status()).toBe(200);
  expect((await health.json()).status).toBe('UP');

  // Establish the deterministic CANARY router cohort.
  await page.goto('/?user=user10');

  // Authenticate the dedicated synthetic account.
  await page.getByRole('link', { name: 'LOGIN' }).click();
  await page
    .locator('input[autocomplete="email"]')
    .fill(process.env.E2E_EMAIL!);
  await page
    .locator('input[autocomplete="current-password"]')
    .fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: /LOGIN/ }).click();

  await expect(page).toHaveURL(/\/$/);

  const session = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('canary-shop-session') || 'null');
  });

  expect(session?.user?.cohort).toBe('CANARY');
  expect(session?.user?.featureEnabled).toBe(true);

  // Reset the synthetic user's cart before starting the journey.
  await page.goto('/cart');

  const cartLines = page.locator('.cart-line');

  while ((await cartLines.count()) > 0) {
    const previousCount = await cartLines.count();

    await cartLines
      .first()
      .getByRole('button', { name: /^Remove / })
      .click();

    await expect(cartLines).toHaveCount(previousCount - 1);
  }

  // Verify the CANARY offers experience.
  await page.getByRole('link', { name: /OFFERS/ }).click();

  await expect(
    page.getByRole('heading', { name: 'EXCLUSIVE OFFERS.' }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'NEW SEASON OFFERS ARE LIVE.' }),
  ).toBeVisible();

  // Search for a real product.
  await page.goto('/');

  const firstProduct = page.locator('.product-card').first();
  await expect(firstProduct).toBeVisible();

  const productName = (
    await firstProduct.locator('.product-name').innerText()
  ).trim();

  await page
    .getByRole('textbox', { name: 'Search products' })
    .fill(productName);

  const matchingProduct = page
    .locator('.product-card')
    .filter({ hasText: productName })
    .first();

  await expect(matchingProduct).toBeVisible();

  // Add it to the cart; do not place an order.
  await matchingProduct.getByRole('button', { name: /ADD TO CART/ }).click();

  await expect(page.getByText('ADDED TO CART')).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByText(productName).first()).toBeVisible();

  // Verify the CANARY checkout experience.
  await page.goto('/checkout');

  await expect(page.getByRole('heading', { name: /A NEW WAY/ })).toBeVisible();

  // Preserve evidence of the successful synthetic journey.
  await page.screenshot({
    path: 'test-results/canary-journey-passed.png',
    fullPage: true,
  });
});
