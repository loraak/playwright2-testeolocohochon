import { test, expect, irA, agregarProductoDesdeListado } from './ae-helpers';

test.describe('Página principal', () => {
  test.beforeEach(async ({ page }) => { await irA(page, '/'); });

  test('el slider principal se muestra y sus controles funcionan', async ({ page }) => {
    const slider = page.locator('#slider-carousel');
    await expect(slider).toBeVisible();
    const activo = slider.locator('.item.active');
    const antes = await activo.innerHTML();
    await slider.locator('.right.control-carousel').click();
    await expect(slider.locator('.item.active')).not.toHaveJSProperty('innerHTML', antes);
    await slider.locator('.left.control-carousel').click();
    await expect(slider.locator('.item.active')).toHaveCount(1);
  });

  test('los indicadores del slider cambian la diapositiva', async ({ page }) => {
    const indicadores = page.locator('#slider-carousel .carousel-indicators li');
    await expect(indicadores).toHaveCount(3);
    await indicadores.nth(2).click();
    await expect(indicadores.nth(2)).toHaveClass(/active/);
  });

  test('los botones "Test Cases" y "APIs list" del slider navegan', async ({ page }) => {
    await page.locator('#slider-carousel .item.active').getByRole('link', { name: 'Test Cases' }).click();
    await expect(page).toHaveURL(/test_cases/);
    await page.goBack();
    await page.locator('#slider-carousel .item.active').getByRole('link', { name: 'APIs list for practice' }).click();
    await expect(page).toHaveURL(/api_list/);
  });

  test('la sección de categorías se despliega', async ({ page }) => {
    for (const cat of ['Women', 'Men', 'Kids']) {
      await page.locator(`.panel-title a[href="#${cat}"]`).click();
      await expect(page.locator(`#${cat}`)).toBeVisible();
    }
  });

  test('cada categoría abre su listado', async ({ page }) => {
    const mapa: Record<string, [string, RegExp]> = {
      Women: ['Dress', /category_products\/1/],
      Men: ['Tshirts', /category_products\/3/],
      Kids: ['Tops & Shirts', /category_products\/5/],
    };
    for (const [cat, [sub, url]] of Object.entries(mapa)) {
      await irA(page, '/');
      await page.locator(`.panel-title a[href="#${cat}"]`).click();
      await page.locator(`#${cat}`).getByRole('link', { name: sub }).click();
      await expect(page).toHaveURL(url);
      await expect(page.locator('.features_items .title')).toContainText(cat, { ignoreCase: true });
    }
  });

  test('cada marca abre su listado', async ({ page }) => {
    const marcas = page.locator('.brands-name a');
    await expect(marcas).toHaveCount(8);
    await marcas.filter({ hasText: 'Polo' }).click();
    await expect(page).toHaveURL(/brand_products\/Polo/);
    await expect(page.locator('.features_items .title')).toContainText('Polo', { ignoreCase: true });
  });

  test('hay productos destacados con nombre y precio', async ({ page }) => {
    const items = page.locator('.features_items .single-products');
    expect(await items.count()).toBeGreaterThan(20);
    await expect(items.first().locator('h2').first()).toContainText('Rs.');
  });

  test('"View Product" abre el detalle del producto', async ({ page }) => {
    await page.locator('a[href="/product_details/1"]').click();
    await expect(page).toHaveURL(/product_details\/1/);
    await expect(page.locator('.product-information h2')).toHaveText('Blue Top');
  });

  test('"Add to cart" muestra el modal y permite continuar comprando', async ({ page }) => {
    await agregarProductoDesdeListado(page, 1);
    const modal = page.locator('#cartModal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Your product has been added to cart.');
    await modal.getByRole('button', { name: 'Continue Shopping' }).click();
    await expect(modal).toBeHidden();
  });

  test('"View Cart" del modal lleva al carrito', async ({ page }) => {
    await agregarProductoDesdeListado(page, 2);
    await page.locator('#cartModal').getByRole('link', { name: 'View Cart' }).click();
    await expect(page).toHaveURL(/view_cart/);
    await expect(page.locator('#product-2')).toBeVisible();
  });

  test('el carrusel de recomendados funciona y permite agregar al carrito', async ({ page }) => {
    const car = page.locator('#recommended-item-carousel');
    await car.scrollIntoViewIfNeeded();
    await expect(car).toBeVisible();
    await car.locator('.right.recommended-item-control').click();
    await car.locator('.item.active a.add-to-cart').first().click();
    await expect(page.locator('#cartModal')).toBeVisible();
  });

  test('el botón "scroll up" regresa al inicio', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const subir = page.locator('#scrollUp');
    await expect(subir).toBeVisible();
    await subir.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
  });
});