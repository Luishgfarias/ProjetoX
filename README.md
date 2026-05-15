# Projeto X

Aplicativo mobile feito com Expo e React Native para explorar missoes espaciais da SpaceX. O app lista lancamentos, permite buscar missoes pelo nome, exibe detalhes completos de cada lancamento e oferece atalhos para artigos, transmissao, Wikipedia e outros links relacionados.

## Objetivo

O Projeto X nasceu para entregar uma experiencia simples, rapida e agradavel para consultar lancamentos espaciais. A ideia central e transformar os dados publicos da SpaceX em uma interface mobile organizada, com:

- listagem paginada de missoes;
- busca por nome da missao;
- tela de detalhes com status, datas, imagens, links e informacoes tecnicas;
- cache local para melhorar a experiencia em novas consultas;
- suporte a tema claro e escuro;
- estados de carregamento, vazio e erro bem definidos;
- uma missao especial local integrada ao fluxo do app.

## Stack

| Area | Tecnologia |
| --- | --- |
| Base mobile | Expo SDK 54 |
| UI | React Native 0.81 |
| Linguagem | TypeScript |
| React | React 19 |
| Navegacao | React Navigation Native Stack |
| Estilizacao | NativeWind + Tailwind CSS |
| Estado global | Zustand |
| Requisicoes HTTP | Axios |
| Persistencia local | AsyncStorage |
| Video | expo-video |
| WebView | react-native-webview |
| Testes | Jest + jest-expo + Testing Library React Native |

## Requisitos

Antes de comecar, tenha instalado:

- Node.js 20.x ou superior;
- npm;
- Expo Go no dispositivo fisico, ou um emulador Android/iOS configurado;
- Git.

> O projeto usa Expo, entao o fluxo basico pode ser testado diretamente no proprio celular com o app Expo Go instalado. Tambem e possivel usar emulador Android/iOS, se preferir.

## Build disponivel

O build Android do app esta disponivel na raiz do repositorio:

```text
projetoX.apk
```

Esse arquivo pode ser instalado em um dispositivo Android compativel para testar o app sem iniciar o ambiente de desenvolvimento.

## Como instalar

Clone o repositorio e instale as dependencias:

```bash
git clone <url-do-repositorio>
cd projetoX
npm install
```

## Como rodar

Inicie o servidor de desenvolvimento do Expo:

```bash
npm start
```

Depois escolha uma das opcoes exibidas no terminal:

- ler o QR Code com o Expo Go;
- pressionar `a` para abrir no Android;
- pressionar `i` para abrir no iOS;
- pressionar `w` para abrir no navegador.

Para iniciar diretamente em uma plataforma especifica, use:

```bash
npm run android
npm run ios
npm run web
```

## Como rodar testes

Execute toda a suite:

```bash
npm test
```

Para uma execucao sequencial, util em CI ou para depurar saidas de teste:

```bash
npm test -- --runInBand
```

## Estrutura de pastas

```text
.
|-- App.tsx
|-- index.ts
|-- app.json
|-- assets/
|-- src/
|   |-- @types/
|   |-- components/
|   |-- constants/
|   |-- hooks/
|   |-- navigation/
|   |-- screens/
|   |-- services/
|   |-- storage/
|   |-- store/
|   |-- theme/
|   `-- utils/
|-- test/
|-- global.css
|-- jest.config.js
|-- metro.config.js
|-- tailwind.config.js
`-- tsconfig.json
```

### Principais diretorios

| Caminho | Responsabilidade |
| --- | --- |
| `assets/` | Imagens, icones, splash screen e midias locais do app |
| `src/@types/` | Tipagens compartilhadas, principalmente os contratos de lancamento |
| `src/components/` | Componentes reutilizaveis de UI, como cards, busca, estados vazios e erro |
| `src/constants/` | Constantes de API, mensagens, tema, cache, videos e configuracoes de lista |
| `src/hooks/` | Hooks de tela e comportamento, como busca, detalhes e duplo voltar para sair |
| `src/navigation/` | Configuracao das rotas e tipos da navegacao |
| `src/screens/` | Telas principais do aplicativo |
| `src/services/` | Cliente HTTP e servicos de acesso aos lancamentos |
| `src/storage/` | Persistencia local com AsyncStorage |
| `src/store/` | Estado global da listagem e detalhes de missoes |
| `src/theme/` | Provider de tema claro/escuro integrado ao NativeWind e React Navigation |
| `src/utils/` | Funcoes puras de formatacao, status, retry e mapeamento de dados |
| `test/` | Mocks e apoio para ambiente de teste |

## Arquitetura

O app segue uma arquitetura simples por camadas:

```text
Telas
  usam hooks e componentes

Hooks
  coordenam estado, efeitos e eventos da interface

Store
  concentra dados da listagem, busca, paginacao, carregamento e erros

Services
  fazem chamadas HTTP para a API da SpaceX

Storage
  salva cache de paginas e preferencia de tema localmente

Utils
  formatam e adaptam dados para a interface
```

### Fluxo da listagem

1. A tela `LaunchListScreen` renderiza busca, lista, estados de carregamento e controle de tema.
2. O hook `useSearchLaunches` conecta a interface com a store.
3. A store `launchStore` gerencia pagina atual, busca, cache, carregamento, refresh e erro.
4. O service `launchService` consulta a API da SpaceX usando `launches/query`.
5. O retorno e convertido para o formato de card por `mapLaunchToCard`.
6. As paginas sao salvas no AsyncStorage para reuso local.

### Fluxo de detalhes

1. A tela `LaunchDetailsScreen` recebe o `id` da missao pela navegacao.
2. O hook `useLaunchDetails` busca os dados completos da missao.
3. O service `getLaunchById` consulta `launches/:id`, exceto para a missao especial local.
4. A tela renderiza imagem, status, datas, links, payloads, tripulacao, falhas e video quando disponivel.

## Decisoes tecnicas

- **Expo como base do projeto:** reduz a complexidade de setup nativo e permite rodar rapidamente com Expo Go.
- **TypeScript:** garante contratos mais claros para dados vindos da API e para parametros de navegacao.
- **React Navigation com Native Stack:** entrega navegacao nativa entre lista, detalhes e WebView de artigo.
- **Zustand para estado global:** oferece uma store pequena e direta para listagem, paginacao, busca e cache de detalhes.
- **Axios centralizado:** o cliente HTTP fica em `src/services/api.ts`, com `baseURL`, timeout e retry automatico.
- **AsyncStorage para cache:** paginas de lancamentos e preferencia de tema ficam persistidas localmente.
- **NativeWind + Tailwind CSS:** facilita estilos consistentes com suporte a dark mode por classes.
- **Separacao por responsabilidade:** telas cuidam de renderizacao, hooks coordenam comportamento, services acessam API e utils mantem regras puras testaveis.
- **Testes focados:** componentes, telas, services, store e utils possuem cobertura com Jest e Testing Library.

## API utilizada

O projeto usa a API publica da SpaceX:

```text
https://api.spacexdata.com/v5/
```

Constantes relacionadas:

```ts
export const API_BASE_URL = "https://api.spacexdata.com/v5/";
export const API_TIMEOUT_MS = 10000;
```

### Endpoints usados

| Endpoint | Metodo | Uso |
| --- | --- | --- |
| `/launches/query` | `POST` | Buscar lancamentos paginados, com filtro por nome e ordenacao por data |
| `/launches/:id` | `GET` | Buscar detalhes completos de uma missao especifica |
| `/launches` | `GET` | Buscar todos os lancamentos, disponivel no service |

### Paginacao e busca

A listagem usa `POST /launches/query` com:

- `page`: pagina atual;
- `limit`: tamanho da pagina definido em `LAUNCH_LIST_PAGE_SIZE`;
- `sort`: ordenacao por `date_utc` descendente;
- `select`: campos minimos necessarios para renderizar os cards;
- `query.name.$regex`: filtro case-insensitive quando existe texto de busca.

## Scripts disponiveis

| Script | Descricao |
| --- | --- |
| `npm start` | Inicia o Expo Dev Server |
| `npm run android` | Inicia o app no Android |
| `npm run ios` | Inicia o app no iOS |
| `npm run web` | Inicia o app na web |
| `npm test` | Executa os testes |
| `npm run test:watch` | Executa os testes em modo watch |
