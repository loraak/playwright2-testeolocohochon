import { test, expect, irA } from './ae-helpers';

test.describe('Detalle de producto', () => {
  test.beforeEach(async ({ page }) => { await irA(page, '/product_details/1'); });

  test('muestra nombre, categoría, precio, disponibilidad, condición y marca', async ({ page }) => {
    const info = page.locator('.product-information');
    await expect(info.locator('h2')).toHaveText('Blue Top');
    await expect(info).toContainText('Category: Women > Tops');
    await expect(info).toContainText('Rs. 500');
    await expect(info).toContainText('Availability:');
    await expect(info).toContainText('Condition:');
    await expect(info).toContainText('Brand:');
  });

  test('cambiar cantidad y agregar al carrito refleja la cantidad en el carrito', async ({ page }) => {
    await page.locator('#quantity').fill('4');
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.locator('#cartModal').getByRole('link', { name: 'View Cart' }).click();
    await expect(page.locator('#product-1 .cart_quantity button')).toHaveText('4');
    await expect(page.locator('#product-1 .cart_total_price')).toHaveText('Rs. 2000');
  });

  test('"Continue Shopping" cierra el modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.locator('#cartModal').getByRole('button', { name: 'Continue Shopping' }).click();
    await expect(page.locator('#cartModal')).toBeHidden();
  });

  test('el formulario de reseña valida y envía correctamente', async ({ page }) => {
    await expect(page.getByText('Write Your Review')).toBeVisible();
    await page.locator('#name').fill('Ana García');
    await page.locator('#email').fill('ana@mailtest.com');
    await page.locator('#review').fill('Excelente producto, muy buena calidad.');
    await page.locator('#button-review').click();
    await expect(page.getByText('Thank you for your review.')).toBeVisible();
  });

  test('la reseña con correo inválido no se envía', async ({ page }) => {
    await page.locator('#name').fill('Ana');
    await page.locator('#email').fill('correo-invalido');
    await page.locator('#review').fill('Texto');
    await page.locator('#button-review').click();
    await expect(page.getByText('Thank you for your review.')).toBeHidden();
  });

  test('un producto inexistente no muestra información de producto', async ({ page }) => {
    await irA(page, '/product_details/99999');
    await expect(page.locator('.product-information h2')).toHaveCount(0);
  });
});