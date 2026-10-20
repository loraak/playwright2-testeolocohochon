import { test, expect, irA } from './ae-helpers';

test.describe('Formulario de contacto', () => {
  test.beforeEach(async ({ page }) => { await irA(page, '/contact_us'); });

  test('muestra todos los campos', async ({ page }) => {
    await expect(page.getByText('Get In Touch')).toBeVisible();
    for (const qa of ['name', 'email', 'subject', 'message', 'submit-button']) {
      await expect(page.locator(`[data-qa="${qa}"]`)).toBeVisible();
    }
    await expect(page.locator('input[name="upload_file"]')).toBeVisible();
    await expect(page.getByText('Feedback For Us')).toBeVisible();
  });

  test('envío completo con archivo adjunto y botón Home', async ({ page }) => {
    await page.locator('[data-qa="name"]').fill('Ana García');
    await page.locator('[data-qa="email"]').fill('ana@mailtest.com');
    await page.locator('[data-qa="subject"]').fill('Consulta de prueba');
    await page.locator('[data-qa="message"]').fill('Este es un mensaje de prueba automatizada.');
    await page.locator('input[name="upload_file"]').setInputFiles({
      name: 'adjunto.txt', mimeType: 'text/plain', buffer: new TextEncoder().encode('contenido de prueba') as any,
    });
    page.once('dialog', d => d.accept()); // confirmación del navegador
    await page.locator('[data-qa="submit-button"]').click();
    await expect(page.locator('.status.alert-success')).toContainText('Success! Your details have been submitted successfully.');
    await page.locator('#form-section').getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL(/automationexercise\.com\/?$/);
  });

  test('cancelar el diálogo de confirmación no envía el formulario', async ({ page }) => {
    await page.locator('[data-qa="name"]').fill('Ana');
    await page.locator('[data-qa="email"]').fill('ana@mailtest.com');
    await page.locator('[data-qa="subject"]').fill('Asunto');
    await page.locator('[data-qa="message"]').fill('Mensaje');
    page.once('dialog', d => d.dismiss());
    await page.locator('[data-qa="submit-button"]').click();
    await expect(page.locator('.status.alert-success')).toBeHidden();
  });

  test('con campos vacíos no se envía', async ({ page }) => {
    await page.locator('[data-qa="submit-button"]').click();
    await expect(page.locator('.status.alert-success')).toBeHidden();
  });

  test('con correo inválido no se envía', async ({ page }) => {
    await page.locator('[data-qa="name"]').fill('Ana');
    await page.locator('[data-qa="email"]').fill('no-es-correo');
    await page.locator('[data-qa="subject"]').fill('Asunto');
    await page.locator('[data-qa="message"]').fill('Mensaje');
    await page.locator('[data-qa="submit-button"]').click();
    await expect(page.locator('.status.alert-success')).toBeHidden();
  });
});