import { expect, test } from '@playwright/test';

test('customer configures and orders a cellular shade through the simplified flow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Without the markup/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cellular Shades' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Roller Shades' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Faux Wood Blinds' })).toBeVisible();

  await page.getByRole('link', { name: /Start your order/i }).first().click();
  await page.getByRole('button', { name: /Cellular Shades/i }).click();
  await page.getByRole('button', { name: /Continue to Mount/i }).click();
  await expect(page.getByRole('heading', { name: 'How will it mount?' })).toBeVisible();
  await page.getByRole('button', { name: /Continue to Size/i }).click();

  await expect(page.getByText(/Do not deduct/i)).toBeVisible();
  await page.getByLabel('Width whole inches').fill('36');
  await page.getByLabel('Height whole inches').fill('48');
  await expect(page.getByText('Your price: $96.03')).toBeVisible();
  await page.getByRole('button', { name: /Continue to Details/i }).click();

  await page.getByRole('button', { name: 'Room darkening' }).click();
  await page.getByRole('button', { name: /Continue to Review/i }).click();
  await expect(page.getByText('Supplier cost')).toBeVisible();
  await expect(page.getByText('SnapShades 10%')).toBeVisible();
  await expect(page.getByText('$104.76')).toBeVisible();
  await expect(page.getByText('$10.48')).toBeVisible();

  await page.getByRole('button', { name: /Add to cart/i }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole('heading', { name: 'Your cart' })).toBeVisible();
  await expect(page.getByText('Supplier freight').last()).toBeVisible();
  await expect(page.getByText('$25.00').last()).toBeVisible();
  await expect(page.getByText('Calculated at payment')).toBeVisible();

  await page.getByRole('button', { name: /Continue to checkout/i }).click();
  await page.getByLabel('Email').fill('customer@example.com');
  await page.getByLabel('First name').fill('Taylor');
  await page.getByLabel('Last name').fill('Customer');
  await page.getByLabel('Phone').fill('805-555-0100');
  await page.getByLabel('Street address').fill('123 Main Street');
  await page.getByLabel('City').fill('Ventura');
  await page.getByLabel('State').selectOption('CA');
  await page.getByLabel('ZIP code').fill('93001');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Continue to payment/i }).click();

  await expect(page).toHaveURL(/\/order-confirmation/);
  await expect(page.getByRole('heading', { name: 'Thank you.' })).toBeVisible();
  await expect(page.getByText(/Order number/i)).toBeVisible();
});

test('legacy product routes enter the simplified three-product order flow', async ({ page }) => {
  await page.goto('/products/plantation-shutters');
  await expect(page).toHaveURL(/\/order$/);
  await expect(page.getByRole('heading', { name: 'Choose your product.' })).toBeVisible();
});

test('faux wood flow captures supplier-ready slat and tilt details', async ({ page }) => {
  await page.goto('/order?product=faux-wood');
  await expect(page.getByRole('heading', { name: 'How will it mount?' })).toBeVisible();
  await page.getByRole('button', { name: /Continue to Size/i }).click();
  await page.getByLabel('Width whole inches').fill('96');
  await page.getByLabel('Height whole inches').fill('96');
  await expect(page.getByRole('alert')).toContainText('Enter a width and height');
  await page.getByLabel('Height whole inches').fill('48');
  await page.getByRole('button', { name: /Continue to Details/i }).click();
  await page.getByRole('button', { name: /2½" slats/i }).click();
  await page.getByRole('button', { name: 'Left' }).click();
  await page.getByRole('button', { name: /Continue to Review/i }).click();
  await expect(page.getByText('2½" slats · Left tilt')).toBeVisible();
});
