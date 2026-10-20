import { test, expect, irA, agregarProductoDesdeListado } from './ae-helpers';

test.describe('Listado de productos, búsqueda, categorías y marcas', () => {
  test.beforeEach(async ({ page }) => { await irA(page, '/products'); });

  test('muestra "All Products" con barra lateral de categorías y marcas', async ({ page }) => {
    await expect(page.locator('.features_items .title')).toHaveText(/All Products/i);
    await expect(page.locator('.left-sidebar')).toContainText('Category');
    await expect(page.locator('.left-sidebar')).toContainText('Brands');
    expect(await page.locator('.features_items .single-products').count()).toBeGreaterThan(20);
  });

  test('buscar un producto existente devuelve resultados relacionados', async ({ page }) => {
    await page.locator('#search_product').fill('Dress');
    await page.locator('#submit_search').click();
    await expect(page.locator('.features_items .title')).toHaveText(/Searched Products/i);
    const nombres = await page.locator('.features_items .productinfo p').allTextContents();
    expect(nombres.length).toBeGreaterThan(0);
    for (const n of nombres) expect(n.toLowerCase()).toContain('dress');
  });

  test('buscar algo inexistente no devuelve productos', async ({ page }) => {
    await page.locator('#search_product').fill('zzzxxxinexistente');
    await page.locator('#submit_search').click();
    await expect(page.locator('.features_items .single-products')).toHaveCount(0);
  });

  test('buscar con el campo vacío no rompe la página', async ({ page }) => {
    await page.locator('#submit_search').click();
    await expect(page.locator('.features_items')).toBeVisible();
  });

  test('todas las subcategorías abren su listado', async ({ page }) => {
    const subcats: [string, string, string][] = [
      ['Women', 'Dress', '1'], ['Women', 'Tops', '2'], ['Women', 'Saree', '7'],
      ['Men', 'Tshirts', '3'], ['Men', 'Jeans', '6'],
      ['Kids', 'Dress', '4'], ['Kids', 'Tops & Shirts', '5'],
    ];
    for (const [cat, sub, id] of subcats) {
      await irA(page, '/products');
      await page.locator(`.panel-title a[href="#${cat}"]`).click();
      await page.locator(`#${cat}`).getByRole('link', { name: sub }).click();
      await expect(page).toHaveURL(new RegExp(`category_products/${id}$`));
      await expect(page.locator('.features_items .title')).toContainText(`${cat} - ${sub}`, { ignoreCase: true });
    }
  });

  test('todas las marcas abren su listado', async ({ page }) => {
    const marcas = ['Polo', 'H&M', 'Madame', 'Mast & Harbour', 'Babyhug', 'Allen Solly Junior', 'Kookie Kids', 'Biba'];
    for (const m of marcas) {
      await irA(page, '/products');
      await page.locator('.brands-name a').filter({ hasText: m }).click();
      await expect(page.locator('.features_items .title')).toContainText(`Brand - ${m}`, { ignoreCase: true });
      expect(await page.locator('.features_items .single-products').count()).toBeGreaterThan(0);
    }
  });

  test('agregar dos productos distintos desde el listado', async ({ page }) => {
    await agregarProductoDesdeListado(page, 1);
    await page.locator('#cartModal').getByRole('button', { name: 'Continue Shopping' }).click();
    await agregarProductoDesdeListado(page, 2);
    await page.locator('#cartModal').getByRole('link', { name: 'View Cart' }).click();
    await expect(page.locator('#product-1')).toBeVisible();
    await expect(page.locator('#product-2')).toBeVisible();
  });
});