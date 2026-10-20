import { test, expect, irA, nuevoUsuario, registrarUsuario, iniciarSesion, eliminarCuenta } from './ae-helpers';

test.describe('Registro, login y logout', () => {
  test('registro completo, verificación de sesión y eliminación de cuenta', async ({ page }) => {
    const u = nuevoUsuario();
    await registrarUsuario(page, u);
    await expect(page.getByText(`Logged in as ${u.nombre}`)).toBeVisible();
    await eliminarCuenta(page);
  });

  test('registro con correo ya existente muestra error', async ({ page }) => {
    const u = nuevoUsuario();
    await registrarUsuario(page, u);
    await page.getByRole('link', { name: 'Logout' }).click();
    await irA(page, '/login');
    await page.locator('[data-qa="signup-name"]').fill(u.nombre);
    await page.locator('[data-qa="signup-email"]').fill(u.email);
    await page.locator('[data-qa="signup-button"]').click();
    await expect(page.getByText('Email Address already exist!')).toBeVisible();
    await iniciarSesion(page, u);
    await eliminarCuenta(page);
  });

  test('login correcto y logout', async ({ page }) => {
    const u = nuevoUsuario();
    await registrarUsuario(page, u);
    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/);
    await iniciarSesion(page, u);
    await expect(page.getByText(`Logged in as ${u.nombre}`)).toBeVisible();
    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page.getByText('Login to your account')).toBeVisible();
    await iniciarSesion(page, u);
    await eliminarCuenta(page);
  });

  test('login con credenciales incorrectas muestra error', async ({ page }) => {
    await irA(page, '/login');
    await page.locator('[data-qa="login-email"]').fill('no.existe@mailtest.com');
    await page.locator('[data-qa="login-password"]').fill('incorrecta');
    await page.locator('[data-qa="login-button"]').click();
    await expect(page.getByText('Your email or password is incorrect!')).toBeVisible();
  });

  test('login con campos vacíos no avanza (validación HTML5)', async ({ page }) => {
    await irA(page, '/login');
    await page.locator('[data-qa="login-button"]').click();
    await expect(page).toHaveURL(/\/login/);
    const valido = await page.locator('[data-qa="login-email"]').evaluate((e: HTMLInputElement) => e.checkValidity());
    expect(valido).toBe(false);
  });

  test('signup con campos vacíos no avanza', async ({ page }) => {
    await irA(page, '/login');
    await page.locator('[data-qa="signup-button"]').click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Enter Account Information')).toBeHidden();
  });

  test('el formulario de signup muestra ambos paneles', async ({ page }) => {
    await irA(page, '/login');
    await expect(page.getByText('Login to your account')).toBeVisible();
    await expect(page.getByText('New User Signup!')).toBeVisible();
  });

  test('el formulario de cuenta contiene todos los campos y selectores', async ({ page }) => {
    const u = nuevoUsuario();
    await irA(page, '/login');
    await page.locator('[data-qa="signup-name"]').fill(u.nombre);
    await page.locator('[data-qa="signup-email"]').fill(u.email);
    await page.locator('[data-qa="signup-button"]').click();
    for (const id of ['#id_gender1', '#id_gender2', '#newsletter', '#optin']) {
      await expect(page.locator(id)).toBeVisible();
    }
    for (const qa of ['password', 'days', 'months', 'years', 'first_name', 'last_name', 'company',
      'address', 'address2', 'country', 'state', 'city', 'zipcode', 'mobile_number', 'create-account']) {
      await expect(page.locator(`[data-qa="${qa}"]`)).toBeVisible();
    }
    await expect(page.locator('[data-qa="name"]')).toHaveValue(u.nombre);
    await expect(page.locator('[data-qa="email"]')).toBeDisabled();
  });

  test('los radios de título son excluyentes', async ({ page }) => {
    const u = nuevoUsuario();
    await irA(page, '/login');
    await page.locator('[data-qa="signup-name"]').fill(u.nombre);
    await page.locator('[data-qa="signup-email"]').fill(u.email);
    await page.locator('[data-qa="signup-button"]').click();
    await page.locator('#id_gender1').check();
    await page.locator('#id_gender2').check();
    await expect(page.locator('#id_gender1')).not.toBeChecked();
    await expect(page.locator('#id_gender2')).toBeChecked();
  });

  test('crear cuenta sin campos obligatorios no la crea', async ({ page }) => {
    const u = nuevoUsuario();
    await irA(page, '/login');
    await page.locator('[data-qa="signup-name"]').fill(u.nombre);
    await page.locator('[data-qa="signup-email"]').fill(u.email);
    await page.locator('[data-qa="signup-button"]').click();
    await page.locator('[data-qa="create-account"]').click();
    await expect(page.locator('[data-qa="account-created"]')).toBeHidden();
  });
});