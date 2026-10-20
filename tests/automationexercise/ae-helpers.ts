import { test as base, expect, Page } from '@playwright/test';

export const BASE = 'https://www.automationexercise.com';

// Bloquea anuncios que tapan elementos y rompen las pruebas
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/googlesyndication|doubleclick|googleads|adservice|adsbygoogle/, r => r.abort());
    await use(page);
  },
});
export { expect };

export type Usuario = ReturnType<typeof nuevoUsuario>;

export function nuevoUsuario() {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    nombre: `QA${id}`,
    email: `qa.${id}@mailtest.com`,
    password: 'Clave123!',
    apellido: 'García',
    empresa: 'Mi Empresa',
    direccion: 'Calle Falsa 123',
    direccion2: 'Piso 4',
    pais: 'Canada',
    estado: 'Ontario',
    ciudad: 'Toronto',
    cp: '12345',
    movil: '5551234567',
  };
}

export async function irA(page: Page, ruta = '/') {
  await page.goto(BASE + ruta);
  const consent = page.getByRole('button', { name: 'Consent' });
  if (await consent.isVisible().catch(() => false)) await consent.click();
}

export async function registrarUsuario(page: Page, u: Usuario) {
  await irA(page, '/login');
  await page.locator('[data-qa="signup-name"]').fill(u.nombre);
  await page.locator('[data-qa="signup-email"]').fill(u.email);
  await page.locator('[data-qa="signup-button"]').click();
  await page.locator('#id_gender1').check();
  await page.locator('[data-qa="password"]').fill(u.password);
  await page.locator('[data-qa="days"]').selectOption('10');
  await page.locator('[data-qa="months"]').selectOption('May');
  await page.locator('[data-qa="years"]').selectOption('1990');
  await page.locator('#newsletter').check();
  await page.locator('#optin').check();
  await page.locator('[data-qa="first_name"]').fill(u.nombre);
  await page.locator('[data-qa="last_name"]').fill(u.apellido);
  await page.locator('[data-qa="company"]').fill(u.empresa);
  await page.locator('[data-qa="address"]').fill(u.direccion);
  await page.locator('[data-qa="address2"]').fill(u.direccion2);
  await page.locator('[data-qa="country"]').selectOption(u.pais);
  await page.locator('[data-qa="state"]').fill(u.estado);
  await page.locator('[data-qa="city"]').fill(u.ciudad);
  await page.locator('[data-qa="zipcode"]').fill(u.cp);
  await page.locator('[data-qa="mobile_number"]').fill(u.movil);
  await page.locator('[data-qa="create-account"]').click();
  await expect(page.locator('[data-qa="account-created"]')).toBeVisible();
  await page.locator('[data-qa="continue-button"]').click();
}

export async function iniciarSesion(page: Page, u: Usuario) {
  await irA(page, '/login');
  await page.locator('[data-qa="login-email"]').fill(u.email);
  await page.locator('[data-qa="login-password"]').fill(u.password);
  await page.locator('[data-qa="login-button"]').click();
}

export async function eliminarCuenta(page: Page) {
  await page.goto(BASE + '/delete_account');
  await expect(page.locator('[data-qa="account-deleted"]')).toBeVisible();
  await page.locator('[data-qa="continue-button"]').click();
}

// Agrega un producto desde el listado (hover + botón del overlay)
export async function agregarProductoDesdeListado(page: Page, id: number) {
  const tarjeta = page.locator('.single-products', { has: page.locator(`a[data-product-id="${id}"]`) }).first();
  await tarjeta.scrollIntoViewIfNeeded();
  await tarjeta.hover();
  await tarjeta.locator(`.product-overlay a[data-product-id="${id}"]`).click();
}