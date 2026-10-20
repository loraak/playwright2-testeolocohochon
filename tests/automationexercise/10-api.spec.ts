import { test, expect } from '@playwright/test';

const API = 'https://automationexercise.com/api';

// Esta API devuelve el código real dentro del JSON (responseCode)
test.describe('API REST', () => {
  test('GET productsList devuelve productos', async ({ request }) => {
    const r = await request.get(`${API}/productsList`);
    const j = await r.json();
    expect(j.responseCode).toBe(200);
    expect(j.products.length).toBeGreaterThan(0);
  });

  test('POST productsList no está permitido (405)', async ({ request }) => {
    const j = await (await request.post(`${API}/productsList`)).json();
    expect(j.responseCode).toBe(405);
  });

  test('GET brandsList devuelve marcas', async ({ request }) => {
    const j = await (await request.get(`${API}/brandsList`)).json();
    expect(j.responseCode).toBe(200);
    expect(j.brands.length).toBeGreaterThan(0);
  });

  test('PUT brandsList no está permitido (405)', async ({ request }) => {
    const j = await (await request.put(`${API}/brandsList`)).json();
    expect(j.responseCode).toBe(405);
  });

  test('POST searchProduct con parámetro devuelve resultados', async ({ request }) => {
    const j = await (await request.post(`${API}/searchProduct`, { form: { search_product: 'top' } })).json();
    expect(j.responseCode).toBe(200);
    expect(j.products.length).toBeGreaterThan(0);
  });

  test('POST searchProduct sin parámetro devuelve 400', async ({ request }) => {
    const j = await (await request.post(`${API}/searchProduct`)).json();
    expect(j.responseCode).toBe(400);
  });

  test('POST verifyLogin con credenciales válidas e inválidas', async ({ request }) => {
    const mal = await (await request.post(`${API}/verifyLogin`, { form: { email: 'x@x.com', password: 'mala' } })).json();
    expect(mal.responseCode).toBe(404);
    const sinParam = await (await request.post(`${API}/verifyLogin`, { form: { email: 'x@x.com' } })).json();
    expect(sinParam.responseCode).toBe(400);
    const metodo = await (await request.delete(`${API}/verifyLogin`)).json();
    expect(metodo.responseCode).toBe(405);
  });

  test('ciclo CRUD de usuario: crear, consultar, actualizar y eliminar', async ({ request }) => {
    const id = Date.now();
    const u = {
      name: `API${id}`, email: `api.${id}@mailtest.com`, password: 'Clave123!', title: 'Mr',
      birth_date: '10', birth_month: 'May', birth_year: '1990', firstname: 'Ana', lastname: 'García',
      company: 'Empresa', address1: 'Calle 1', address2: 'Piso 2', country: 'Canada', zipcode: '12345',
      state: 'Ontario', city: 'Toronto', mobile_number: '5551234567',
    };
    const crear = await (await request.post(`${API}/createAccount`, { form: u })).json();
    expect(crear.responseCode).toBe(201);

    const leer = await (await request.get(`${API}/getUserDetailByEmail`, { params: { email: u.email } })).json();
    expect(leer.responseCode).toBe(200);
    expect(leer.user.email).toBe(u.email);

    const actualizar = await (await request.put(`${API}/updateAccount`, { form: { ...u, city: 'Ottawa' } })).json();
    expect(actualizar.responseCode).toBe(200);

    const borrar = await (await request.delete(`${API}/deleteAccount`, { form: { email: u.email, password: u.password } })).json();
    expect(borrar.responseCode).toBe(200);
  });
});