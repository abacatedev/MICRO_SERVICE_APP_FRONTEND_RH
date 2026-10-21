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
| `/produtos` | Produtos | mock (`lib/data.ts`) |
| `/relatorios` | Relatórios | mock |
| `/configuracoes` | Configurações | mock |

As telas de mock são herança do template comercial que originou o projeto. Não têm endpoint no
backend do RH e não devem receber dado inventado — quando houver API, seguem o mesmo caminho das
duas primeiras.

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
  raio-x/page.tsx             → Raio-X das Secretarias: painel lateral + 4 abas
  api/rh/login/route.ts       → rota de login do proxy
  icon.svg                    → favicon (marca)
  globals.css                 → tokens shadcn em Tailwind v4, claro e escuro
components/
  layout/                     → sidebar colapsável, topbar, app-shell, marca (SVG)
  visao-geral/                → blocos da Visão geral (KPIs, barras, rosca, funil, tabela)
  raio-x/                     → abas, cards de regra, painel de filtros, tabela
  ui/                         → shadcn/ui: button, card, table, select, progress, skeleton…
  charts/                     → gráficos Recharts das telas de mock
lib/
  http/recurso.ts             → cliente HTTP único
  rh/                         → tipos, adaptadores, hooks e fixtures da Visão geral
  raio-x/                     → tipos, cálculos puros, adaptadores, hooks e mock
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

## Documentação

- [`docs/raio-x-fluxo-de-dados.md`](docs/raio-x-fluxo-de-dados.md) — o caminho de uma requisição,
  sessão e 401/403, mapa endpoint → bloco, o que é derivado no cliente.
- [`docs/raio-x-backend.md`](docs/raio-x-backend.md) — contrato de dados esperado do backend.

## Backend

API do RH em FastAPI: `MICRO_SERVICE_BACKEND_RH_CLEAN`. Rotas consumidas: `/rh/me`,
`/rh/diagnostico`, `/rh/diagnostico/por-divisao`, `/rh/diagnostico/por-divisao/regras`,
`/rh/diagnostico/por-divisao/perfil`, `/rh/servidores`.
