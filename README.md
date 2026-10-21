# Pré-Censo dos Servidores

Painel de diagnóstico do Pré-Censo dos servidores municipais, construído com **Next.js 15
(App Router)**, **Tailwind CSS v4** e **shadcn/ui**, com gráficos em **Recharts**.

As telas **Visão geral** e **Raio-X das Secretarias** leem dados reais da API do RH (`/rh/*`)
através do proxy `/api/rh` — ver `docs/raio-x-fluxo-de-dados.md`. As telas **Vendas**,
**Clientes** e **Produtos** ainda usam os dados de demonstração do template original.

## Como rodar

```bash
cd nexo-bi
npm install
npm run dev
```

Abra http://localhost:3000.

Build de produção:

```bash
npm run build && npm start
```

## Preview estático

`preview/index.html` é um mockup autocontido da tela "Visão geral" (CSS inline, SVG, alternância
claro/escuro no botão de lua). Serve para validar o desenho da interface sem subir o servidor —
não é a aplicação, é uma referência visual fiel ao layout implementado.

## Estrutura

```
app/
  layout.tsx              → ThemeProvider + AppShell (sidebar/topbar)
  page.tsx                → Visão geral
  vendas/page.tsx         → performance comercial, canais, regionais, transações
  clientes/page.tsx       → coortes de retenção, segmentos, principais contas
  produtos/page.tsx       → curva ABC, margem, ranking de SKUs
  relatorios/page.tsx     → visões salvas e execuções agendadas
  configuracoes/page.tsx  → workspace, fontes de dados, membros
  raio-x/page.tsx         → Raio-X das Secretarias (sidebar fixa + 4 abas)
  globals.css             → tokens shadcn (light/dark) em Tailwind v4
components/
  ui/                     → componentes shadcn/ui (button, card, table, select, tabs…)
  charts/                 → gráficos Recharts + heatmap + funil
  layout/                 → sidebar, topbar, page-header, app-shell
  kpi-card.tsx            → card de KPI com sparkline em SVG puro
  section-card.tsx        → card de seção com título/ação/rodapé
  transactions-table.tsx  → tabela com busca e filtro por status (client component)
lib/
  data.ts                 → dados de demonstração tipados
  raio-x/                 → tipos, mock, cálculos puros, hook de dados, tokens gov.br
  utils.ts                → cn() + formatadores pt-BR (moeda, número, percentual)
  nav.ts                  → configuração da navegação
docs/
  raio-x-backend.md       → contrato de campos que o backend precisa expor
```

## Design system

- Tokens shadcn/ui em CSS variables (`--background`, `--card`, `--primary`, `--chart-1..5`).
- Tema claro/escuro via `next-themes` (classe `.dark` no `<html>`).
- Raio base de 12px, tipografia de sistema, números com `font-variant-numeric: tabular-nums`.
- Paleta de gráficos: índigo, teal, âmbar, rosa e cinza-azulado.

## Tela Raio-X das Secretarias

Rota `/raio-x`, item "Raio-X Secretarias" no menu. Painel de diagnóstico do Pré-Censo dos
servidores (SIP/Fiorilli, empresa 001): sidebar fixa com secretaria, mínimo de vínculos e os 7 cards
de regra; à direita, as abas **Regra em foco**, **Quadro**, **Qualidade** e **Tabela**.

- Estado na URL: `?sec=000005&regra=cert&min=30&aba=quadro` (link compartilhável).
- Paleta gov.br isolada em `lib/raio-x/cores.ts` — único lugar com hex. A **tipografia segue a
  escala do app** (22 / 15 / 13 / 11,5 / 11 px, mesma pilha de fontes, mesmas cores de texto
  `--foreground` e `--muted-foreground`); as cores gov.br ficam só onde há significado:
  vermelho da regra crítica, laranja acima da média e azul escuro nos números de destaque.
- Cálculos puros em `lib/raio-x/calculos.ts`, cobertos por `calculos.test.ts` (`npm test`).
- `lib/raio-x/api.ts` expõe `useRaioX()` com assinatura equivalente a `useQuery`
  (`data / isLoading / isError / refetch`). Mock desligável com `NEXT_PUBLIC_RAIO_X_MOCK=false`.
- Contrato de dados para o backend em `docs/raio-x-backend.md`.

### Desvios conscientes da especificação

1. Entregue dentro do **nexo-bi** (Next 15 + Tailwind v4 + shadcn), não no
   `MICRO_SERVICE_FRONTEND_RH` — o design system gov.br foi aplicado como camada de tokens
   escopada na tela.
2. **Sem React Query**: o hook próprio imita a API do `useQuery` porque a fonte ainda é mock;
   migrar é substituir o corpo de `useRaioX()`.
3. **Sem `ChartContainer` do shadcn** (não existe neste projeto): Recharts direto, com tooltips
   próprios no padrão gov.br.
4. Pílulas de "Comparar com" usam `<button aria-pressed>` em vez de `ToggleGroup` Radix, para não
   adicionar dependência.
5. "Ver lista nominal" fica desabilitado — a tela de destino não foi implementada, conforme pedido.
6. Faixa etária dos dependentes em **empty state**: a consulta `03_faixa_dependentes.sql` ainda
   não existe.

## Adicionar mais componentes shadcn/ui

O projeto já está configurado (`components.json`), então:

```bash
npx shadcn@latest add dialog sheet tooltip command
```

## Trocar os dados por dados reais

Todo o conteúdo de demonstração está em `lib/data.ts`, exportado com tipos. Substitua os arrays
por chamadas à sua API, camada semântica (dbt/Cube/Metabase) ou server actions — as páginas
consomem apenas esses exports.

## Próximos passos sugeridos

- Autenticação e multi-tenant (workspace switcher já previsto no layout).
- Filtros globais de período ligados ao `Select` da topbar (hoje é estado local).
- Exportação real (CSV/PDF) e agendamento de relatórios.
- Estados de carregamento com `Skeleton` e erro por card.
- Testes de acessibilidade (foco visível e navegação por teclado já implementados nos componentes base).
