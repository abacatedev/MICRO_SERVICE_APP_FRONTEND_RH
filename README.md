# Pré-Censo dos Servidores

Painel de diagnóstico do Pré-Censo dos servidores municipais: mostra quantos vínculos estão com
cadastro inconsistente, em quais secretarias e em quais regras, para o RH saber onde agir primeiro.

Construído com **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS v4**, **shadcn/ui**
(componentes escritos no projeto, sem CLI) e **Recharts**.

## Como rodar

```bash
git clone https://github.com/abacatedev/MICRO_SERVICE_APP_FRONTEND_RH.git
cd MICRO_SERVICE_APP_FRONTEND_RH
npm install
cp .env.example .env.local     # ajuste BACKEND_URL se o backend não estiver em localhost:8000
npm run dev
```

Abra http://localhost:3000. O backend do RH precisa estar no ar — sem ele as telas mostram erro
com botão "Tentar novamente", não dados falsos.

Build de produção:

```bash
npm run build && npm start
```

## Estado atual das telas

| Rota | Tela | Origem dos dados |
| --- | --- | --- |
| `/` | Visão geral | API do RH (`/rh/diagnostico`, `/rh/diagnostico/por-divisao`, `/rh/servidores`) |
| `/raio-x` | Raio-X das Secretarias | API do RH (`/rh/diagnostico/por-divisao/regras`, `/perfil`, `/rh/diagnostico`) |
| `/vendas` | Vendas | mock (`lib/data.ts`) |
| `/clientes` | Clientes | mock (`lib/data.ts`) |
| `/afastamentos` | Afastamentos | API do RH (`/rh/afastamentos/*`, `/rh/esocial/*`) |
| `/produtos` | — | redirect para `/afastamentos` |
| `/relatorios` | Relatórios | mock |
| `/configuracoes` | Configurações | mock |

As telas de mock são herança do template comercial que originou o projeto. Não têm endpoint no
backend do RH e não devem receber dado inventado — quando houver API, seguem o mesmo caminho das
duas primeiras.

**Afastamentos (25/10/2026 → 26/10/2026):** a tela de Produtos virou **Afastamentos** com conteúdo
próprio: quatro abas (Panorama, Servidores, Conferência, Relatórios), ficha do servidor
(`/afastamentos/servidor/[registro]`) e exportação de CSV. A rota mudou para `/afastamentos`;
`/produtos` redireciona para o novo endereço. A camada de dados está em `lib/afastamentos/*` e os
componentes em `components/afastamentos/*`, seguindo o mesmo padrão da Visão geral e do Raio-X.
A abas Perícias e Saúde (CID) ficam desativadas até o backend disponibilizar os endpoints
(`NEXT_PUBLIC_AFASTAMENTOS_FUTURO`).

## Como o front conversa com o backend

O navegador nunca fala com o backend diretamente. Ele chama `/api/rh/...` (mesma origem) e o
`next.config.ts` reescreve para `${BACKEND_URL}/rh/...`, repassando o cookie de sessão httpOnly.
Não há CORS no meio e o front nunca vê token.

```
componente → hook (lib/rh/api.ts | lib/raio-x/api.ts) → useRecurso (lib/http/recurso.ts)
           → /api/rh/... → rewrite do Next → backend → JSON → adaptadores → tela
```

`lib/http/recurso.ts` é o **único** cliente HTTP do projeto. Ele cuida de timeout, de
`credentials: "include"` e do tratamento de sessão: 401 manda para o login, 403 mostra "seu perfil
não tem acesso".

O passo a passo completo, com o rastreio de um número do JSON até a tela, está em
[`docs/raio-x-fluxo-de-dados.md`](docs/raio-x-fluxo-de-dados.md).

## Estrutura

```
app/
  layout.tsx                  → ThemeProvider + AppShell (sidebar/topbar), fontes, metadados
  page.tsx                    → Visão geral (backend)
  raio-x/page.tsx             → Raio-X das Secretarias: barra de filtros + 4 abas
  afastamentos/page.tsx       → Afastamentos: barra de filtros + 4 abas + exportação
  afastamentos/servidor/[registro]/page.tsx → Ficha do servidor (espelho de afastamentos)
  api/rh/login/route.ts       → rota de login do proxy
  icon.svg                    → favicon (marca)
  globals.css                 → tokens shadcn em Tailwind v4, claro e escuro
components/
  layout/                     → sidebar colapsável, topbar, app-shell, marca (SVG)
  visao-geral/                → blocos da Visão geral (KPIs, barras, rosca, funil, tabela)
  raio-x/                     → abas, cards de regra, barra de filtros, gráficos
  afastamentos/               → abas, cards, barra de filtros, gráficos, UI compartilhada
  ui/                         → shadcn/ui: button, card, table, select, progress, skeleton…
  charts/                     → gráficos Recharts das telas de mock
lib/
  http/recurso.ts             → cliente HTTP único
  rh/                         → tipos, adaptadores, hooks e fixtures da Visão geral
  raio-x/                     → tipos, cálculos puros, adaptadores, hooks e mock
  afastamentos/               → tipos, cálculos puros, hooks, formatação e exportação
  paleta.ts                   → paleta gov.br (única fonte de hexadecimais)
  data.ts                     → dados de demonstração das telas sem backend
  nav.ts                      → configuração do menu
docs/
  raio-x-fluxo-de-dados.md    → como o front busca os dados, passo a passo
  raio-x-backend.md           → contrato de campos que o backend expõe
preview/                      → mockups estáticos (HTML) para validar o desenho sem subir o Next
scripts/testar-backend.mjs    → confere as rotas do backend sem abrir o browser
```

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Testes das derivações puras (Vitest) |
| `npm run testar:backend` | Chama as rotas `/rh/*` e imprime o status. Aceita URL: `npm run testar:backend -- http://localhost:8010` |
| `npm run lint` | ESLint |

Os testes cobrem a camada que transforma JSON em tela (`lib/rh/adaptadores.test.ts` e
`lib/raio-x/*.test.ts`), com fixtures em `__fixtures__/`. Nada de rede nos testes.

## Design system

- Paleta do **Padrão Digital de Governo** (azul-marinho `#0C2350`, azul `#1351B4`, fundo
  `#F3F6FA`), definida uma única vez em `lib/paleta.ts`. `lib/raio-x/cores.ts` só reexporta como
  `RX` para as telas antigas.
- Tipografia **IBM Plex Sans** (texto) e **IBM Plex Sans Condensed** (números, utilitário
  `.num-cond`), via `next/font/google`.
- Tema claro/escuro com `next-themes` (classe `.dark` no `<html>`).
- Sidebar colapsável (`Ctrl/⌘+B`), preferência em `localStorage`.

### Como o tema escuro é aplicado
Duas regras, e nenhuma tela foge delas:

1. **Superfície, texto e borda em HTML usam token**, nunca hex: `bg-card`, `text-foreground`,
   `text-muted-foreground`, `border-border`, `bg-muted`, `bg-accent`, `text-destructive`,
   `text-warning`. O valor de cada token por tema está em `app/globals.css`.
2. **Gráfico e cor de série não podem ser classe** (o Recharts escreve atributo SVG), então
   passam por `corNoTema(cor, escuro)` de `lib/paleta.ts`, que traduz a cor clara para a
   equivalente escura. O `useTemaEscuro()` (`lib/tema.ts`) diz qual usar.

`bg-white` e hex inline em componente são considerados bug: foi exatamente isso que deixou a
tela Raio-X ilegível no escuro (card branco com texto de token claro por cima).

### Paleta dos gráficos

Definida em `GRAFICO` (`lib/paleta.ts`), reexportada como `GX` em `lib/raio-x/cores.ts`:

| Papel | Claro | Uso |
| --- | --- | --- |
| `principal` | `#1351B4` | barras principais e a regra em foco |
| `escuro` | `#0C326F` | destaque, comparação entre séries |
| `claro` | `#5992ED` | série secundária |
| `verde` | `#168821` | indicador positivo, quando aplicável |
| `cinza` | `#6C757D` | demais vínculos e séries neutras |
| `cinzaClaro` | `#D8DEE8` | grades, linhas de referência e divisores |

Série de gráfico **não usa vermelho nem laranja**: pendência é volume a comparar, não erro de
sistema. Por isso `corDaRegra` (que devolvia vermelho para a regra crítica) foi removida de
`lib/raio-x/calculos.ts`.

Onde há duas cores, elas vêm da mesma rampa e sempre com legenda. É o caso do gráfico A da aba
Pendência: `escuro` para as secretarias acima da referência da Prefeitura, `principal` para
as demais e `claro` para a selecionada — a legenda abaixo do gráfico imprime o valor da
referência, então a cor nunca é a única portadora da informação.

Existe **uma** exceção declarada, e ela vale para um gráfico só: a faixa etária dos dependentes
usa dourado (`desconformidade`, `#C2850C`) e amarelo (`desconformidadeLeve`, `#FFCD07`) porque
ali a cor representa uma condição de negócio ("exige comprovação"), não volume. O eixo X imprime
a palavra "comprovação" sob a faixa e a legenda repete, então a cor continua não sendo a única
portadora do significado.

Já as colunas de "Apontamentos por categoria" usam **uma cor só** para as cinco categorias:
são o mesmo tipo de número (apontamentos) e quem identifica a categoria é o rótulo do eixo.
Categoria cujo `0` é falta de dado no backend carrega `semContagem` e mostra `—` em vez de `0`.

O donut "De que regra vêm os apontamentos" usa os três tons da mesma rampa para marcar a
**categoria** de cada regra — `principal`, `escuro` e `claro` —, e a legenda abre um grupo por
categoria com o nome escrito ao lado do quadradinho. Dentro do grupo, quem separa as fatias é o
vão; o que distingue uma regra da outra é a ordem (a mesma da legenda) e o tooltip.

As "Outras regras do diagnóstico" também usam os três tons, mas ali a cor é o `tipo` que o
**backend** classifica (`erro` / `alerta` / `conferencia` / `recadastro` / `indicador`), agrupado
em três leituras: erro, alerta e conferência, recadastro e indicador. Isso não é enfeite — sem
separar as naturezas, "sem dependentes em nenhum registro" (844) vira a segunda maior barra
parecendo 844 problemas. Quando o backend não manda `tipo`, a barra sai **cinza e a legenda diz
"Sem classificação"**: o front não chuta severidade.

### Layout da aba Inconsistências

"Apontamentos por categoria" e "De que regra vêm os apontamentos" dividem a mesma linha em
80/20 (`xl:grid-cols-[minmax(0,4fr)_minmax(216px,1fr)]`). Abaixo de `xl` os dois empilham: em
1024px o painel tem 712px e 20% dariam ~142px, menos que a rosca de 140px mais o respiro.
O piso de 216px no `minmax` garante o mínimo que o donut precisa quando 20% dá menos que isso
(em 1280px, 20% de 968 = 193px). Os 712px são a largura **inteira** da aba: os filtros subiram
para a barra do topo, então não há mais coluna lateral a descontar.

Dentro do card estreito a rosca sobe para cima da legenda (`flex-col` em `xl`, `flex-row` abaixo
disso) e a legenda **não imprime percentual**: com nome + valor + `%` em ~180px o nome da regra
virava reticência. A proporção continua legível na própria rosca e no total de cada grupo. O card
das colunas estica junto (`flex-1` com `min-h-[210px]`) para os dois terminarem na mesma altura.

O card das colunas se chama **"Apontamentos por categoria"**, não "Inconsistências por categoria":
esse é o `<h2>` da aba, e o card fica logo abaixo dele — o mesmo título duas vezes lia como
duplicata. Como o `RxCard` só desenha o cabeçalho quando há `titulo`, o subtítulo não pode ficar
sozinho; a saída é o título do card dizer outra coisa, não sumir.

## Abas do Raio-X

Quatro abas, na ordem de leitura — do retrato geral ao caso específico:

| # | Aba | Título no painel | Responde |
|---|-----|------------------|----------|
| 1 | Panorama | Panorama do quadro de pessoal | como a seleção se distribui (vínculos, locais, cargos, tipo) |
| 2 | Inconsistências | Inconsistências por categoria | o que está errado e de que regra vem |
| 3 | Comparativo | Comparativo entre secretarias | como cada secretaria se compara, regra a regra |
| 4 | Pendência | Análise da pendência selecionada | onde a pendência escolhida pega |

Duas regras de nomenclatura:

- **A faixa cabe o nome curto; o assunto completo é o `titulo` do painel.** Os botões são
  `grid-cols-4` com altura fixa (`h-10`) e `truncate` — acima de ~20 caracteres o texto some na
  reticência. Por isso "Inconsistências" na faixa e "Inconsistências por categoria" no `<h2>`.
- **Nenhuma aba nomeia formato.** "Quadro" e "Tabela" descreviam o desenho, não o assunto, e
  conviviam com "Qualidade", que descreve assunto — dois critérios na mesma faixa. Agora as
  quatro são substantivos do domínio.

### O que fica fora do painel

**Filtros numa barra horizontal no topo** (`components/raio-x/barra-filtros.tsx`), acima da faixa
de abas e visível nas quatro: "Secretaria", "Mostrar secretarias com" (chips "Todas" / "30 ou mais
vínculos" / "100 ou mais vínculos") e "Limpar filtros". Antes eram uma coluna de 290px à esquerda,
e todas as abas pagavam essa largura. "Limpar filtros" fica logo abaixo dos chips que ele limpa,
não no rodapé.

**Os cards de pendência só existem na aba Pendência** (`painel-pendencias.tsx`), como coluna de
280px à esquerda do conteúdo, com o título "Escolha a pendência". Nas outras três abas o conteúdo
ocupa a largura inteira. O rótulo é uma instrução porque os cards não filtram nada: são o seletor
daquela aba. Antes o bloco se chamava "Regra em foco" — o mesmo nome da aba 4 —, então o usuário
clicava para escolher e caía numa aba homônima.

Os sete cartões vão em dois grupos (`Dependentes`, `Contato do servidor`), com a ordem e o rótulo
curto em `lib/raio-x/regras.ts`:

- `ROTULO_CARD` — o texto do card ("Sem CPF", "Sem data de nascimento"). O `label` que vem da API
  continua sendo o nome longo, usado no título dos gráficos e nas legendas.
- `GRUPOS_CARDS` + `agruparCartoes` — ordem de tela, independente da ordem da resposta. Cartão que
  não estiver em nenhum grupo cai em "Outras pendências" em vez de sumir: esta coluna é o único
  seletor de pendência da tela.

### Atalhos entre abas

A pendência escolhida é **estado da página**, não da aba: ela sobrevive à troca de aba e à URL
(`?regra=`). Dois caminhos levam a ela, e a diferença é intencional:

- Na aba Inconsistências, cada linha da legenda de "De que regra vêm os apontamentos" é um botão
  (a rosca também é clicável) e abre a aba Pendência naquela regra. O Comparativo **não** tem mais
  esse atalho: ele existia no título das colunas da tabela, que saiu da tela.
- Dentro da aba Pendência, clicar num card **só troca a seleção** e não mexe na aba: o usuário já
  está onde o card leva. Por isso existem `onRegra` (troca a regra) e `abrirPendencia` (troca a
  regra **e** a aba).

O selo "Crítica" é uma etiqueta ancorada no canto superior direito, **fora do fluxo** do card: em
linha própria ele fazia o card crítico ficar mais alto que os outros seis. Todos os cards têm a
mesma altura (`min-h-[76px]`).

### A aba Comparativo

Dois gráficos **na mesma linha** (`lg:grid-cols-2`), nesta ordem
(`components/raio-x/aba-comparativo.tsx`):

1. **"Secretaria × média da Prefeitura"** — só existe com uma secretaria no filtro. Com "Toda a
   Prefeitura" o card some: comparar a Prefeitura com ela mesma daria duas colunas idênticas nas
   sete categorias. Colunas agrupadas, azul (secretaria) e cinza (Prefeitura), `maxBarSize` 19,2.
2. **"Composição das pendências por secretaria"** — coluna 100% empilhada por secretaria, ordenada
   pelo **total de casos** (não por vínculos), com o total impresso **no topo** de cada coluna. O
   filtro "Mostrar secretarias com" vale aqui porque a lista já chega filtrada. Rótulo de categoria
   a 11,4px. Quando é o único gráfico da linha ("Toda a Prefeitura"), as colunas engordam:
   `maxBarSize` 26 → 60 **e** `barCategoryGap` 22% → 8%.

**Quem limita a largura da coluna é o `barCategoryGap`, não o `maxBarSize`.** A categoria sempre
ocupa toda a largura disponível; o `maxBarSize` é um teto e o que sobra vira vão. Com 14 categorias
numa linha de 712px cada uma tem ~51px — a 22% de vão a coluna para em ~40px e um `maxBarSize` de
60 nunca é alcançado. Baixar o vão para 8% é o que de fato libera os ~47px. Vale para os dois
gráficos: no da esquerda o vão é 12% para as colunas de 19,2 caberem.

**Por que lado a lado:** são as duas leituras do mesmo filtro — "esta secretaria está acima da
Prefeitura?" e "de que é feito o estoque de cada uma?" — e vê-las juntas evita trocar de contexto
para conferir uma contra a outra. Como os dois são colunas, a leitura é a mesma nos dois (categoria
no X, altura no Y). Abaixo de 1024px eles empilham: metade de uma tela estreita não comporta sete
nomes inclinados.

**Por que os rótulos são inclinados a −45°:** na metade da largura não há espaço para deitar sete
(ou quatorze) nomes longos no eixo X. Com o eixo inclinado, a distância perpendicular entre dois
rótulos vizinhos é `espaço entre categorias × sen(45°)` — com ~46px por categoria em 1024px sobram
~32px de folga para uma linha de 10px, então nada encosta. A −30° a folga cai para 23px e os mais
longos passam a se tocar.

**Sem valor em cima de cada coluna** no gráfico da esquerda: as colunas ficam com ~16px e "14,2%"
tem ~24px, um encostaria no outro. O eixo Y dá a leitura aproximada e o tooltip, o número exato.

**Não há tabela.** A antiga tabela de doze colunas pedia 1.080px numa área útil de 712px e por isso
vivia dentro de um `overflow-auto` com scroll horizontal e vertical próprios — dois scrolls
aninhados na mesma aba. `components/raio-x/tabela-secretarias.tsx` continua no repositório,
**sem nenhum import**, caso a tabela volte: nesse caso ela precisa voltar também para o
`AbaComparativo` e receber `sec`, `onToggleSec` e `onAbrirPendencia` de novo.

Como a tabela era o único lugar de onde se pulava para a aba Pendência, **a aba Comparativo perdeu
esse atalho**. Hoje ele existe na aba Inconsistências (itens de "De que regra vêm os apontamentos")
e na coluna de cards da aba Pendência.

Duas regras que valem para os dois blocos:

- **A referência da Prefeitura é `mediaDoTotal`**: casos ÷ vínculos de **toda** a Prefeitura, a
  partir da linha `ALL`. Nunca a média aritmética dos percentuais das secretarias — ela daria o
  mesmo peso a Planejamento (12 vínculos) e a Educação (1.416) e mudaria com o filtro de
  "Mostrar secretarias com".
- **O denominador é sempre `vinc`**, inclusive nas pendências de dependentes: a API conta vínculos
  distintos por cartão, então o número já é "vínculos com pelo menos um dependente naquela
  pendência". Está escrito no subtítulo do gráfico.

**Laranja é uma condição, não uma cor de série.** Ele aparece só no **rótulo** das pendências em
que a secretaria passa da Prefeitura (e na amostra "Aa" da legenda). As colunas continuam azul
(secretaria) e cinza (Prefeitura): pintar a coluna também faria a cor competir com a altura,
que já diz a mesma coisa. Pelo mesmo motivo a paleta das sete pendências (`CORES_PENDENCIA`) não
usa laranja — é rampa azul para Dependentes e cinza para Contato do servidor.

`ORDEM_CARDS` (em `lib/raio-x/regras.ts`) achata `GRUPOS_CARDS` e é a **ordem única** de tudo que
lista pendência: fatias do gráfico e barras do comparativo.

## Documentação

- [`docs/raio-x-fluxo-de-dados.md`](docs/raio-x-fluxo-de-dados.md) — o caminho de uma requisição,
  sessão e 401/403, mapa endpoint → bloco, o que é derivado no cliente.
- [`docs/raio-x-backend.md`](docs/raio-x-backend.md) — contrato de dados esperado do backend.

## Backend

API do RH em FastAPI: `MICRO_SERVICE_BACKEND_RH_CLEAN`. Rotas consumidas: `/rh/me`,
`/rh/diagnostico`, `/rh/diagnostico/por-divisao`, `/rh/diagnostico/por-divisao/regras`,
`/rh/diagnostico/por-divisao/perfil`, `/rh/servidores`, `/rh/indicadores/faixa-dependentes`,
`/rh/afastamentos/*`, `/rh/esocial/*`.
