import { test, expect } from '@playwright/test';

test('conta e garagem: cadastro, edição, login e desativação', async ({
  page,
  request,
}) => {
  const stamp = String(Date.now());
  const email = `teste.frontend.${stamp}@example.com`;
  const password = 'TesteVagaLivre2026!';
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  let token = '';
  let garageId = '';
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Conexão com o servidor' }).click();
    await page
      .getByRole('textbox', { name: 'Endereço da API' })
      .fill('http://localhost:5108/api/');
    await page.getByRole('button', { name: 'Usar este endereço' }).click();
    await page.reload();
    await page.getByRole('button', { name: 'Conexão com o servidor' }).click();
    await expect(
      page.getByRole('textbox', { name: 'Endereço da API' }),
    ).toHaveValue('http://localhost:5108/api');
    await page.getByRole('button', { name: 'Fechar conexão' }).click();
    await expect(
      page.getByText('Bem-vindo ao seu próximo lugar.'),
    ).toBeVisible();
    await page.screenshot({ path: 'test-results/entrada.png', fullPage: true });
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(
      page.getByText('Preencha todos os campos para continuar.'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Quero criar uma conta' }).click();
    await page
      .getByRole('textbox', { name: 'Nome completo' })
      .fill('Teste Interface');
    await page
      .getByRole('textbox', { name: 'E-mail', exact: true })
      .fill(email);
    await page
      .getByRole('textbox', { name: 'Telefone', exact: true })
      .fill('11999999999');
    await page
      .getByRole('textbox', { name: 'CPF (somente números)', exact: true })
      .fill(stamp.slice(-11));
    await page.getByLabel('Senha', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Criar conta e entrar' }).click();
    await expect(page.getByText('Olá, Teste.')).toBeVisible();
    const login = await request.post('http://localhost:5108/api/auth/login', {
      data: { email, password },
    });
    token = (await login.json()).accessToken;
    await page
      .getByRole('button', { name: '+ Anunciar minha garagem', exact: true })
      .click();
    await expect(page.getByText('Um novo lugar começa aqui.')).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Título do anúncio' })
      .fill('Garagem teste de integração');
    await page
      .getByRole('textbox', { name: 'Descrição', exact: true })
      .fill('Registro de teste automático da interface.');
    await page
      .getByRole('textbox', { name: 'Endereço completo' })
      .fill('Rua de teste, 123, São Paulo');
    await page
      .getByRole('textbox', { name: 'Latitude', exact: true })
      .fill('-23.55052');
    await page
      .getByRole('textbox', { name: 'Longitude', exact: true })
      .fill('-46.63331');
    await page.getByRole('radio', { name: 'SUV', exact: true }).click();
    await page.getByRole('button', { name: 'Cadastrar garagem' }).click();
    await page
      .getByRole('button', {
        name: 'Ver Garagem teste de integração',
        exact: true,
      })
      .click();
    await expect(page.getByText('Porte máximo: SUV')).toBeVisible();
    const mine = await request.get('http://localhost:5108/api/garages/mine', {
      headers: { Authorization: `Bearer ${token}` },
    });
    garageId = (await mine.json())[0].id;
    await page
      .getByRole('button', { name: 'Editar garagem', exact: true })
      .click();
    await page
      .getByRole('textbox', { name: 'Título do anúncio' })
      .fill('Garagem teste editada');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await page
      .getByRole('tab', { name: 'Minhas garagens', exact: true })
      .click();
    await expect(
      page.getByRole('button', {
        name: 'Ver Garagem teste editada',
        exact: true,
      }),
    ).toBeVisible();
    await page.screenshot({
      path: 'test-results/garagens.png',
      fullPage: true,
    });
    await page.getByRole('tab', { name: 'Meu perfil', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Nome completo' })
      .fill('Teste Atualizado');
    await page.getByRole('button', { name: 'Salvar perfil' }).click();
    await expect(page.getByText('Perfil atualizado.')).toBeVisible();
    await page.getByRole('button', { name: 'Sair da conta' }).click();
    await page
      .getByRole('textbox', { name: 'E-mail', exact: true })
      .fill(email);
    await page.getByLabel('Senha', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.getByText('Olá, Teste.')).toBeVisible();
    await page
      .getByRole('tab', { name: 'Minhas garagens', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Ver Garagem teste editada', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Desativar garagem', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Confirmar desativação', exact: true })
      .click();
    await page
      .getByRole('tab', { name: 'Minhas garagens', exact: true })
      .click();
    await expect(page.getByText('Desativada', { exact: true })).toBeVisible();
    await page.getByRole('tab', { name: 'Meu perfil', exact: true }).click();
    await page
      .getByRole('button', { name: 'Desativar minha conta', exact: true })
      .click();
    await page
      .getByRole('button', {
        name: 'Confirmar desativação da conta',
        exact: true,
      })
      .click();
    await expect(
      page.getByText('Bem-vindo ao seu próximo lugar.'),
    ).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      if (garageId) {
        await request
          .delete(`http://localhost:5108/api/garages/${garageId}`, {
            headers,
            timeout: 5000,
          })
          .catch(() => {});
      }
      await request
        .delete('http://localhost:5108/api/users/me', {
          headers,
          timeout: 5000,
        })
        .catch(() => {});
    }
  }
});
