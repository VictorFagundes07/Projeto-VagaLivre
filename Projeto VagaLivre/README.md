# VagaLivre

Plataforma P2P de locação de garagens. A solução está dividida em `backend/` (API ASP.NET Core .NET 8) e `frontend/VagaLivreMobile/` (aplicativo React Native com TypeScript e opção de execução web). Instruções do aplicativo em `frontend/README.md`.

## Primeiro módulo

O backend inicial inclui cadastro e login de usuários, edição e desativação da própria conta, e o CRUD de garagens. A identidade do usuário autenticado determina o proprietário de uma garagem; portanto, uma mesma conta pode anunciar vagas e também alugar vagas quando o módulo de reservas for incluído.

As exclusões são lógicas: contas e garagens são desativadas, preservando o histórico para as futuras reservas e pagamentos.

## Banco de dados PostgreSQL

1. Instale PostgreSQL e mantenha o serviço em execução. O EF Core cria a base automaticamente ao aplicar a migration, se o usuário configurado tiver permissão de criação. Se não tiver, crie a base com um usuário autorizado:

   ```sql
   CREATE DATABASE vagalivre;
   ```

2. Em `backend/VagaLivre.Api/appsettings.Development.json`, substitua `ALTERE_ESTA_SENHA` pela senha do usuário `postgres`. Não envie esse arquivo com senha real para um repositório público.

3. Na raiz do projeto, execute as migrations:

   ```powershell
   dotnet ef database update --project .\backend\VagaLivre.Api --startup-project .\backend\VagaLivre.Api
   ```

Entity Framework Core com o provider Npgsql faz o mapeamento Code-First: as classes `AppUser` e `Garage` geram as tabelas, a chave estrangeira e os índices no PostgreSQL automaticamente.

O serviço PostgreSQL local está em execução, mas a extensão PostGIS não está instalada. Ela será necessária antes do módulo de busca por raio/geolocalização; o CRUD inicial mantém latitude e longitude conforme o diagrama de classes.

## Executar a API

```powershell
dotnet run --project .\backend\VagaLivre.Api
```

Abra `/swagger` para testar os endpoints. Crie uma conta em `POST /api/auth/register`, obtenha o token em `POST /api/auth/login` e informe-o no botão **Authorize** do Swagger antes de criar ou administrar suas garagens.
