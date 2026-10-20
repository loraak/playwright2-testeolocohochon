import { test, expect, irA } from './ae-helpers';

test.describe('Navegación: menú superior y pie de página', () => {
  const enlaces: [string, RegExp, string][] = [
    ['Products', /\/products/, 'All Products'],
    ['Cart', /\/view_cart/, 'Shopping Cart'],
    ['Signup / Login', /\/login/, 'New User Signup!'],
    ['Test Cases', /\/test_cases/, 'Test Cases'],
    ['API Testing', /\/api_list/, 'APIs List for practice'],
    ['Contact us', /\/contact_us/, 'Get In Touch'],
  ];

  for (const [texto, url, contenido] of enlaces) {
    test(`el enlace "${texto}" del menú navega correctamente`, async ({ page }) => {
      await irA(page, '/');
      await page.locator('.navbar-nav').getByRole('link', { name: texto }).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByText(contenido, { exact: false }).first()).toBeVisible();
    });
  }

  test('el enlace Home regresa a la página principal', async ({ page }) => {
    await irA(page, '/products');
    await page.locator('.navbar-nav').getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL(/automationexercise\.com\/?$/);
  });

  test('el logo regresa a la página principal', async ({ page }) => {
    await irA(page, '/products');
    await page.locator('.logo a, a img[alt="Website for automation practice"]').first().click();
    await expect(page).toHaveURL(/automationexercise\.com\/?$/);
  });

  test('el enlace de Video Tutorials apunta a YouTube', async ({ page }) => {
    await irA(page, '/');
    const href = await page.locator('.navbar-nav').getByRole('link', { name: 'Video Tutorials' }).getAttribute('href');
    expect(href).toContain('youtube.com');
  });

  test('el pie de página muestra copyright y suscripción', async ({ page }) => {
    await irA(page, '/');
    await expect(page.getByText('Copyright ©')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Subscription' })).toBeVisible();
  });
});