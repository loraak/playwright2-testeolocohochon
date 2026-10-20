import { test, expect, irA, nuevoUsuario, registrarUsuario, eliminarCuenta, agregarProductoDesdeListado, Usuario } from './ae-helpers';
import type { Page } from '@playwright/test';

async function llegarACheckout(page: Page, u: Usuario) {
  await irA(page, '/products');
  await agregarProductoDesdeListado(page, 1);
  await page.locator('#cartModal').getByRole('link', { name: 'View Cart' }).click();
  await page.getByText('Proceed To Checkout').click();
}

test.describe('Checkout y pago (usuario registrado)', () => {
  test('flujo completo: checkout, pago, confirmación, factura y eliminación', async ({ page }) => {
    const u = nuevoUsuario();
    await registrarUsuario(page, u);
    await llegarACheckout(page, u);

    // Revisión de direcciones y pedido
    await expect(page.getByText('Address Details')).toBeVisible();
    await expect(page.locator('#address_delivery')).toContainText(u.direccion);
    await expect(page.locator('#address_invoice')).toContainText(u.direccion);
    await expect(page.getByText('Review Your Order')).toBeVisible();
    await expect(page.locator('#product-1')).toBeVisible();
    await expect(page.locator('.cart_total_price').last()).toHaveText('Rs. 500');

    // Comentario y realizar pedido
    await page.locator('textarea[name="message"]').fill('Entregar en horario de oficina');
    await page.getByRole('link', { name: 'Place Order' }).click();

    // Pago
    await expect(page).toHaveURL(/payment/);
    await page.locator('[data-qa="name-on-card"]').fill('Ana García');
    await page.locator('[data-qa="card-number"]').fill('4111111111111111');
    await page.locator('[data-qa="cvc"]').fill('123');
    await page.locator('[data-qa="expiry-month"]').fill('12');
    await page.locator('[data-qa="expiry-year"]').fill('2030');
    await page.locator('[data-qa="pay-button"]').click();

    // Confirmación
    await expect(page.locator('[data-qa="order-placed"]')).toBeVisible();
    const descarga = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download Invoice' }).click();
    expect((await descarga).suggestedFilename()).toBeTruthy();
    await page.locator('[data-qa="continue-button"]').click();

    await eliminarCuenta(page);
  });

  test('el pago con campos vacíos no confirma el pedido', async ({ page }) => {
    const u = nuevoUsuario();
    await registrarUsuario(page, u);
    await llegarACheckout(page, u);
    await page.getByRole('link', { name: 'Place Order' }).click();
    await page.locator('[data-qa="pay-button"]').click();
    await expect(page.locator('[data-qa="order-placed"]')).toBeHidden();
    await eliminarCuenta(page);
  });

  test('con sesión iniciada se puede ir a checkout sin modal de login', async ({ page }) => {
    const u = nuevoUsuario();
    await registrarUsuario(page, u);
    await llegarACheckout(page, u);
    await expect(page).toHaveURL(/checkout/);
    await expect(page.locator('#checkoutModal')).toBeHidden();
    await eliminarCuenta(page);
  });

  test('los productos agregados antes del registro se conservan en el checkout', async ({ page }) => {
    const u = nuevoUsuario();
    await irA(page, '/products');
    await agregarProductoDesdeListado(page, 2);
    await page.locator('#cartModal').getByRole('button', { name: 'Continue Shopping' }).click();
    await registrarUsuario(page, u);
    await irA(page, '/view_cart');
    await expect(page.locator('#product-2')).toBeVisible();
    await page.getByText('Proceed To Checkout').click();
    await expect(page.locator('#product-2')).toBeVisible();
    await page.locator('.cart_quantity_delete').first().isVisible().catch(() => {});
    await eliminarCuenta(page);
  });
});