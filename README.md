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
git clone https://github.com/Luishgfarias/ProjetoX
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
|-- mocks/
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
| `mocks/` | Mocks e apoio para ambiente de teste |

## Fluxo de dados da lista

A lista de missoes segue um caminho simples: os dados saem da API da SpaceX, passam pelo servico de requisicao, podem ser guardados em cache, entram no estado do app e finalmente aparecem na tela.

```text
SpaceX API
  -> Axios Service
  -> AsyncStorage Cache
  -> Zustand Store
  -> Screen
  -> Components
```

### Responsabilidade de cada camada

| Camada | O que faz |
| --- | --- |
| SpaceX API | Fornece os dados oficiais dos lancamentos |
| Axios Service | Busca os dados na API e prepara a resposta para o app |
| AsyncStorage Cache | Guarda paginas ja carregadas para reaproveitar depois |
| Zustand Store | Controla lista, busca, pagina atual, carregamento, erro e refresh |
| Screen | Decide o que mostrar em cada momento: lista, loading, erro ou vazio |
| Components | Renderizam as partes visuais, como busca, cards e mensagens |

### Como a lista carrega

Quando a tela de missoes abre, o app pede a primeira pagina de lancamentos. Antes de chamar a API, ele verifica se ja existe uma versao salva no cache local. Se existir, essa lista aparece rapidamente na tela. Depois disso, o app tenta buscar os dados mais recentes na API da SpaceX e atualiza a lista.

Esse comportamento deixa a tela mais rapida quando ja existem dados salvos, mas ainda permite que a lista seja atualizada com informacoes novas.

### Cache

O cache fica no `AsyncStorage`. Ele guarda cada pagina de lancamentos separadamente, considerando tambem o texto pesquisado.

Exemplo: uma busca vazia na pagina 1 e uma busca por `falcon` na pagina 1 sao salvas como consultas diferentes. Assim, o app nao mistura resultados de buscas diferentes.

O cache ajuda principalmente em tres momentos:

- ao abrir a lista novamente;
- ao repetir uma busca ja feita;
- ao carregar uma pagina que ja tinha sido buscada antes.

### Paginacao

A lista nao carrega todos os lancamentos de uma vez. Ela usa paginacao para buscar uma parte por vez.

Na primeira abertura, o app carrega a pagina 1. Quando o usuario chega ao fim da lista, o app verifica se existe uma proxima pagina. Se existir, busca mais missoes e adiciona ao final da lista atual.

Isso evita uma tela pesada e melhora a experiencia, principalmente em celulares.

### Refresh

O refresh acontece quando o usuario puxa a lista para atualizar.

Nesse caso, o app limpa o cache dos lancamentos, busca novamente a primeira pagina na API e substitui a lista atual pelos dados mais recentes. Esse fluxo tambem limpa detalhes antigos salvos em memoria, garantindo que a lista volte para um estado atualizado.

## Decisoes tecnicas

Boa parte das decisoes tecnicas deste app partiram de escolhas humanas minhas, com apoio de IA na execucao para agilizar o desenvolvimento. A organizacao geral do projeto tambem foi pensada por mim e, ao longo do processo, recebeu ajustes e refinamentos com ajuda da IA.

Entre as principais decisoes de base do projeto, optei por usar **Zustand** como store para centralizar os dados de forma simples e direta, principalmente pela minha familiaridade com a biblioteca e pela forma enxuta como ela atende ao que o app precisa. Para as requisicoes a **API da SpaceX**, escolhi o **Axios**, tambem por familiaridade e por ele se encaixar bem no fluxo de consumo da API. Na parte de interface, o **NativeWind** foi uma escolha pessoal para facilitar a estilizacao com classes e manter o suporte aos temas claro e escuro.

Pensando no consumo de dados, decidi usar a API de forma paginada na listagem e buscar apenas os campos necessarios em cada consulta. Essa escolha ajuda a deixar as requisicoes mais leves, agiliza o processamento e contribui para um uso mais eficiente de memoria. Tambem optei por utilizar cache local, para reaproveitar dados ja carregados anteriormente e melhorar a experiencia de uso em novas consultas.

Na estrutura do projeto, a organizacao e a separacao das pastas tambem foram definidas por mim, buscando manter uma base que fizesse sentido tanto visualmente quanto na logica do app. A ideia foi deixar o codigo mais facil de entender, manter e evoluir com o tempo, separando melhor as responsabilidades entre partes como `services`, `store`, `hooks`, `screens` e `components`.

Na parte de video, optei por usar o **react-native-webview** como solucao principal para conteudos do YouTube, pensando na UX ao manter o player incorporado na propria UI do app. Assim, o video pode ser exibido de forma embutida na tela, sem exigir que o usuario saia do fluxo para assistir. Alem disso, esse formato ajuda a evitar que o video precise ser baixado por completo para a memoria do app, ja que o consumo acontece de forma mais sob demanda, o que contribui para um uso mais eficiente de memoria. Ja o **expo-video** foi utilizado como player padrao para videos fora do YouTube, aproveitando melhor o suporte nativo para esse tipo de conteudo.

O suporte a temas tambem foi uma decisao pensada desde a base da interface, com o objetivo de oferecer mais conforto visual ao usuario e permitir que cada pessoa utilize o app da forma que achar mais adequada no dia a dia.


Os testes automatizados tambem contaram em boa parte com apoio de IA, sempre com meu acompanhamento, principalmente por eu ainda estar aprofundando meu aprendizado sobre testes em sistemas mobile. Ainda assim, eles foram pensados para validar partes importantes do app, como telas, componentes, store, services e funcoes auxiliares. Alem disso, a organizacao desses testes em uma pasta `__tests__`, sugerida pela IA e aceita por mim, ajudou a manter o projeto mais organizado e facilitou a leitura e o entendimento da estrutura.


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

A listagem usa o endpoint `/launches/query` para buscar os lancamentos aos poucos. O app informa qual pagina deseja carregar, quantos itens devem vir por pagina e, quando existe uma busca, envia o texto digitado para filtrar as missoes pelo nome.

Os resultados sao exibidos dos lancamentos mais recentes para os mais antigos.

## Scripts disponiveis

| Script | Descricao |
| --- | --- |
| `npm start` | Inicia o Expo Dev Server |
| `npm run android` | Inicia o app no Android |
| `npm run ios` | Inicia o app no iOS |
| `npm run web` | Inicia o app na web |
| `npm test` | Executa os testes |
| `npm run test:watch` | Executa os testes em modo watch |
