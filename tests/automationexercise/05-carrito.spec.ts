import { test, expect, irA, agregarProductoDesdeListado } from './ae-helpers';

test.describe('Carrito de compras', () => {
  test('carrito vacío muestra el mensaje correspondiente', async ({ page }) => {
    await irA(page, '/view_cart');
    await expect(page.getByText('Cart is empty!')).toBeVisible();
    await page.getByRole('link', { name: 'here' }).click();
    await expect(page).toHaveURL(/products/);
  });

  test('el carrito muestra imagen, descripción, precio, cantidad y total', async ({ page }) => {
    await irA(page, '/products');
    await agregarProductoDesdeListado(page, 1);
    await page.locator('#cartModal').getByRole('link', { name: 'View Cart' }).click();
    const fila = page.locator('#product-1');
    await expect(fila.locator('.cart_product img')).toBeVisible();
    await expect(fila.locator('.cart_description h4 a')).toHaveText('Blue Top');
    await expect(fila.locator('.cart_price')).toHaveText('Rs. 500');
    await expect(fila.locator('.cart_quantity button')).toHaveText('1');
    await expect(fila.locator('.cart_total_price')).toHaveText('Rs. 500');
  });

  test('el nombre del producto en el carrito enlaza a su detalle', async ({ page }) => {
    await irA(page, '/products');
    await agregarProductoDesdeListado(page, 1);
    await page.locator('#cartModal').getByRole('link', { name: 'View Cart' }).click();
    await page.locator('#product-1 .cart_description h4 a').click();
    await expect(page).toHaveURL(/product_details\/1/);
  });

  test('el total por fila es precio por cantidad con varios productos', async ({ page }) => {
    await irA(page, '/products');
    await agregarProductoDesdeListado(page, 1);
    await page.locator('#cartModal').getByRole('button', { name: 'Continue Shopping' }).click();
    await agregarProductoDesdeListado(page, 2);
    await page.locator('#cartModal').getByRole('link', { name: 'View Cart' }).click();
    await expect(page.locator('#product-1 .cart_total_price')).toHaveText('Rs. 500');
    await expect(page.locator('#product-2 .cart_total_price')).toHaveText('Rs. 400');
  });

  test('eliminar un producto con la "X" lo quita del carrito', async ({ page }) => {
    await irA(page, '/products');
    await agregarProductoDesdeListado(page, 1);
    await page.locator('#cartModal').getByRole('link', { name: 'View Cart' }).click();
    await page.locator('#product-1 .cart_quantity_delete').click();
    await expect(page.locator('#product-1')).toHaveCount(0);
    await expect(page.getByText('Cart is empty!')).toBeVisible();
  });

  test('sin sesión, "Proceed To Checkout" ofrece registrarse o iniciar sesión', async ({ page }) => {
    await irA(page, '/products');
    await agregarProductoDesdeListado(page, 1);
    await page.locator('#cartModal').getByRole('link', { name: 'View Cart' }).click();
    await page.getByText('Proceed To Checkout').click();
    const modal = page.locator('#checkoutModal');
    await expect(modal).toBeVisible();
    await modal.getByRole('link', { name: 'Register / Login' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('sin sesión, "Continue On Cart" cierra el modal de checkout', async ({ page }) => {
    await irA(page, '/products');
    await agregarProductoDesdeListado(page, 1);
    await page.locator('#cartModal').getByRole('link', { name: 'View Cart' }).click();
    await page.getByText('Proceed To Checkout').click();
    await page.locator('#checkoutModal').getByRole('button', { name: 'Continue On Cart' }).click();
    await expect(page.locator('#checkoutModal')).toBeHidden();
  });

  test('la suscripción también está disponible en el carrito', async ({ page }) => {
    await irA(page, '/view_cart');
    await page.locator('#susbscribe_email').fill('ana@mailtest.com');
    await page.locator('#subscribe').click();
    await expect(page.locator('#success-subscribe')).toBeVisible();
  });
});