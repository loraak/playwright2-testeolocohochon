import { test, expect, irA } from './ae-helpers';

test.describe('Suscripción (pie de página)', () => {
  for (const ruta of ['/', '/products', '/view_cart']) {
    test(`suscribirse con correo válido desde ${ruta}`, async ({ page }) => {
      await irA(page, ruta);
      await page.locator('#susbscribe_email').scrollIntoViewIfNeeded();
      await page.locator('#susbscribe_email').fill('ana@mailtest.com');
      await page.locator('#subscribe').click();
      await expect(page.locator('#success-subscribe')).toContainText('You have been successfully subscribed!');
    });
  }

  test('con correo inválido no se suscribe', async ({ page }) => {
    await irA(page, '/');
    await page.locator('#susbscribe_email').fill('no-es-correo');
    await page.locator('#subscribe').click();
    await expect(page.locator('#success-subscribe')).toBeHidden();
  });

  test('con campo vacío no se suscribe', async ({ page }) => {
    await irA(page, '/');
    await page.locator('#subscribe').click();
    await expect(page.locator('#success-subscribe')).toBeHidden();
  });
});

test.describe('Páginas informativas', () => {
  test('Test Cases lista los casos y sus enlaces', async ({ page }) => {
    await irA(page, '/test_cases');
    await expect(page.getByRole('heading', { name: 'Test Cases', exact: false }).first()).toBeVisible();
    const casos = page.locator('.panel-group .panel-title a, .panel-heading a');
    expect(await casos.count()).toBeGreaterThan(20);
    await expect(page.getByText('Test Case 1: Register User').first()).toBeVisible();
  });

  test('API Testing lista las APIs y permite abrir una', async ({ page }) => {
    await irA(page, '/api_list');
    await expect(page.getByText('APIs List for practice')).toBeVisible();
    await expect(page.getByText('API 1: Get All Products List')).toBeVisible();
    await page.getByRole('link', { name: /API 1: Get All Products List/ }).click();
    await expect(page.getByText('/api/productsList').first()).toBeVisible();
  });

  test('una URL inexistente muestra error 404', async ({ page }) => {
    const resp = await page.goto('https://www.automationexercise.com/ruta-que-no-existe');
    expect(resp?.status()).toBe(404);
  });
});