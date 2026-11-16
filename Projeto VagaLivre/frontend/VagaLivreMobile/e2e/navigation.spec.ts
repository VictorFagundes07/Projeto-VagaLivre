import { test, expect } from '@playwright/test';

test('menu lateral, favoritos por conta e configurações', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const garage = {
    id: 'garage-preview',
    ownerId: 'another-user',
    title: 'Garagem no Centro',
    address: 'Rua das Flores, 123',
    description: 'Garagem coberta com acesso fácil.',
    latitude: -23.55,
    longitude: -46.63,
    maxVehicleType: 3,
    isActive: true,
  };
  let email = 'victor@example.com';
  await page.route('**/api/**', route => {
    const url = route.request().url();
    if (url.endsWith('/auth/login')) {
      email = route.request().postDataJSON().email;
      return route.fulfill({ json: { accessToken: 'preview-token' } });
    }
    if (url.endsWith('/users/me')) {
      return route.fulfill({
        json: {
          id: email,
          fullName: 'Victor Teste',
          email,
          phone: '11999999999',
          isActive: true,
          rating: 0,
        },
      });
    }
    return route.fulfill({ json: [garage] });
  });
  async function login(address = 'victor@example.com') {
    await page.getByLabel('E-mail', { exact: true }).fill(address);
    await page.getByLabel('Senha', { exact: true }).fill('Teste2026!');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByText('Olá, Victor.')).toBeVisible();
  }
  async function menu(name: string) {
    await page
      .getByRole('button', { name: 'Abrir opções', exact: true })
      .click();
    await page.getByRole('button', { name, exact: true }).click();
  }
  await page.goto('/');
  await expect(
    page.getByRole('img', { name: 'Logo VagaLivre', exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: 'test-results/login-logo.png',
    fullPage: true,
  });
  await login();
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const menuBox = await page
      .getByRole('button', { name: 'Abrir opções', exact: true })
      .boundingBox();
    const logoBox = await page
      .getByRole('button', { name: 'VagaLivre, voltar ao início', exact: true })
      .boundingBox();
    expect(menuBox!.x).toBeLessThan(logoBox!.x);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText(garage.title, { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/home-menu.png', fullPage: true });
  await page.getByRole('button', { name: 'Abrir opções', exact: true }).click();
  const labels = [
    'PERFIL',
    'MINHAS GARAGENS',
    'GARAGENS FAVORITAS',
    'CONFIGURAÇÕES',
  ];
  const positions: number[] = [];
  for (const name of labels) {
    positions.push(
      (await page.getByRole('button', { name, exact: true }).boundingBox())!.y,
    );
  }
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  await expect
    .poll(() =>
      page.getByTestId('navigation-drawer').evaluate(element => {
        let current: Element | null = element;
        while (current) {
          if (Number(getComputedStyle(current).opacity) < 1) {
            return false;
          }
          current = current.parentElement;
        }
        return true;
      }),
    )
    .toBe(true);
  await page.screenshot({
    path: 'test-results/menu-lateral.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page
    .getByRole('button', { name: 'Favoritar: ' + garage.title, exact: true })
    .click();
  await expect(
    page.getByRole('button', {
      name: 'Remover dos favoritos: ' + garage.title,
      exact: true,
    }),
  ).toBeVisible();
  await menu('GARAGENS FAVORITAS');
  await expect(page.getByText(garage.title, { exact: true })).toBeVisible();
  await page.reload();
  await login();
  await menu('GARAGENS FAVORITAS');
  await expect(page.getByText(garage.title, { exact: true })).toBeVisible();
  await menu('CONFIGURAÇÕES');
  await page
    .getByRole('button', { name: 'Conexão com o servidor', exact: true })
    .click();
  await expect(
    page.getByLabel('Endereço da API', { exact: true }),
  ).toBeVisible();
  await menu('MINHAS GARAGENS');
  await expect(page.getByText('Seus espaços', { exact: true })).toBeVisible();
  await menu('PERFIL');
  await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue(
    'Victor Teste',
  );
  await page
    .getByRole('button', { name: 'Sair da conta', exact: true })
    .click();
  await login('other@example.com');
  await menu('GARAGENS FAVORITAS');
  await expect(
    page.getByText('Seus favoritos começam aqui.', { exact: true }),
  ).toBeVisible();
  await menu('PERFIL');
  await page
    .getByRole('button', { name: 'Sair da conta', exact: true })
    .click();
  await login();
  await menu('GARAGENS FAVORITAS');
  await page
    .getByRole('button', {
      name: 'Remover dos favoritos: ' + garage.title,
      exact: true,
    })
    .click();
  await expect(
    page.getByText('Seus favoritos começam aqui.', { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
