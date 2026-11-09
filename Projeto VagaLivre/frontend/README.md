# Frontend VagaLivre

O aplicativo está em `VagaLivreMobile/`, com React Native CLI, TypeScript, React Navigation e Axios. Android e iOS usam o projeto nativo; a versão web usa os mesmos componentes com React Native Web.

## Testar no navegador

Mantenha a API em execução na porta 5108. Em outro terminal, partindo da raiz `Projeto VagaLivre`:

```powershell
cd .\frontend\VagaLivreMobile
npm install
npm run web
```

Abra http://127.0.0.1:5173. As dependências já foram instaladas na máquina atual; `npm install` só é necessário em uma nova instalação ou após mudanças de dependências.

Crie uma conta, entre e utilize Encontrar, Minhas garagens e Meu perfil. O endereço da API pode ser alterado em Conexão com o servidor, na tela de entrada. Não há dados fictícios embutidos: os cadastros são gravados pela API no PostgreSQL.

## Executar no Android

Configure o JDK e Android Studio/SDK conforme a documentação do React Native, crie e abra um emulador Android. Em `frontend/VagaLivreMobile`, execute em dois terminais:

```powershell
npm start
```

```powershell
npm run android
```

A API padrão no emulador Android é `http://10.0.2.2:5108/api`. Para celular físico, use o IP do computador na mesma rede, faça a API escutar na interface de rede (`dotnet run --project .\backend\VagaLivre.Api --urls http://0.0.0.0:5108`) e permita somente o acesso necessário na rede local. O endereço pode ser trocado na tela de entrada. O HTTP está habilitado pelo modelo nativo apenas no build de desenvolvimento.

Para iOS, use macOS com Xcode e instale os pods antes de executar `npm run ios`.

## Funcionalidades

- Cadastro, login, edição do próprio perfil, saída e desativação da conta com confirmação.
- Consulta de garagens ativas e busca local por título ou endereço.
- Cadastro, detalhes, edição e desativação das próprias garagens com confirmação.
- Campos de latitude/longitude e porte de veículo conforme o contrato da API.
- Logo local e paleta azul claro, azul escuro e branco.
- Estados de carregamento, lista vazia, validação e mensagens de falha de conexão.

O endereço da API é salvo no dispositivo e restaurado ao abrir o aplicativo. A sessão permanece em memória: recarregar a página ou fechar o aplicativo exige novo login. Mapa, fotos, preços, disponibilidade, reservas e pagamentos ainda dependem dos próximos módulos do backend.

## APK independente para testes

Ambiente configurado nesta máquina:

- Java do Android Studio: `C:\Program Files\Android\Android Studio\jbr` (variável `JAVA_HOME`).
- Android SDK: `C:\Users\nz\AppData\Local\Android\Sdk` (variável `ANDROID_HOME`).
- SDK Platform 37.0, Build-Tools 37.0.0, Platform-Tools, NDK 27.1.12297006 e CMake 3.22.1.
- Gradle 9.4.1, baixado automaticamente pelo wrapper do projeto.

Reabra o terminal ou o editor para que novos terminais recebam as variáveis atualizadas. O atalho `apk:teste` também detecta os caminhos padrão do Android Studio e do SDK, mesmo quando o terminal ainda mantém as variáveis antigas. O arquivo `android/local.properties` aponta para o SDK desta máquina e não deve ser versionado.

Com Java e Android SDK configurados, execute dentro de `frontend/VagaLivreMobile`:

```powershell
npm.cmd run apk:teste
```

O arquivo será gerado em `android/app/build/outputs/apk/homologacao/app-homologacao.apk`. Transfira e instale no celular. Esta variante inclui o JavaScript e os recursos, dispensa Metro/USB e aparece como **VagaLivre Teste**. Usa certificado de desenvolvimento para distribuição interna; a publicação em loja exige assinatura própria.

A primeira compilação foi concluída e uma cópia foi disponibilizada em `frontend/apk/VagaLivre-teste.apk`. Novas compilações atualizam o arquivo em `android/app/build/outputs/apk/homologacao/`; a cópia em `frontend/apk/` precisa ser atualizada manualmente. A assinatura foi verificada com `apksigner`. A execução em aparelho físico ainda precisa ser validada.

A versão **1.0.1-teste** está em `frontend/apk/VagaLivre-teste-1.0.1.apk` e inclui a logo como ícone Android. Usa o mesmo identificador e certificado da versão anterior, com `versionCode` incrementado, permitindo instalar como atualização. Os ícones tradicionais são gerados por `scripts/generate-android-icons.ps1` a partir de `src/assets/logo.jpg`; os ícones adaptativos estão em `android/app/src/main/res/mipmap-anydpi-v26/`.

Na tela inicial, abra **Conexão com o servidor** e salve a URL terminando em `/api`. Para uma API hospedada, use seu endereço HTTPS. Para a API no computador, inicie-a na raiz do repositório:

```powershell
dotnet run --project .\backend\VagaLivre.Api --urls http://0.0.0.0:5108
```

Conecte o celular à mesma rede Wi-Fi. Use `http://IP_DO_COMPUTADOR:5108/api`, substituindo o IP pelo IPv4 exibido por `ipconfig`. Confirme pelo navegador do celular que `http://IP_DO_COMPUTADOR:5108/swagger` abre. Se necessário, permita a porta 5108 no firewall somente para a rede privada. `0.0.0.0` é o endereço de escuta do servidor, não o endereço a cadastrar no app. `localhost` no celular aponta para o próprio celular.

A variante de teste permite HTTP para a API local. Para uso fora dessa rede, hospede a API em um servidor acessível pela internet com HTTPS; o banco continua acessado apenas pelo backend.

## Verificações

```powershell
npm run typecheck
npm run lint -- --quiet
npm run build:web
npm run test:e2e
```

O teste de integração exige a API local ativa e Microsoft Edge instalado. Cria uma conta e uma garagem identificadas como teste, exercita os fluxos e desativa os registros ao concluir. Eles permanecem no banco devido à exclusão lógica do backend.
