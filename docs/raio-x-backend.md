# Raio-X das Secretarias — integração com o backend do RH

> Este documento cobre o mapa da integração. Para o caminho detalhado de cada requisição
> (proxy → fetch → adaptador → componente, com rastreio de números), veja
> [`raio-x-fluxo-de-dados.md`](./raio-x-fluxo-de-dados.md).

## 1. Onde está cada peça

| Peça | Arquivo | Como funciona |
|---|---|---|
| Tela | `app/raio-x/page.tsx` | Client component. Só fala com `/api/rh/...`. |
| Proxy | `next.config.ts` | `rewrites`: `/api/rh/:caminho*` → `${BACKEND_URL}/rh/:caminho*`. |
| Login | `app/api/rh/login/route.ts` | Redireciona para `${BACKEND_URL}/rh/login?retorno=...`. |
| Cliente HTTP | `lib/raio-x/api.ts` | `fetch` com `credentials: "include"`, timeout e tratamento de 401/403. |
| Adaptadores | `lib/raio-x/adaptadores.ts` | Única ponte entre o payload da API e os componentes. |
| Nomes curtos | `lib/raio-x/nomes.ts` | `código → nome curto`, com reserva para código desconhecido. |

**Não existe segundo proxy nem segundo cliente HTTP.** O único ponto de saída é `/api/rh`.

### Sessão

- O backend grava um cookie de sessão **httpOnly**; o front nunca lê nem guarda token.
- O browser chama `/api/rh/...` na mesma origem e o proxy repassa o cookie para o backend.
- **401** em qualquer chamada → `window.location.assign("/api/rh/login?retorno=<url atual>")`.
  Há uma trava (`redirecionando`) para não disparar quatro redirecionamentos quando as três
  consultas falham juntas.
- **403** → a tela mostra "Seu perfil não tem acesso ao painel do diagnóstico." e não redireciona.
- Como o proxy é same-origin, **CORS não entra na conversa**. Se algum dia o front chamar o
  backend direto, aí sim é preciso liberar `http://localhost:3000` em `CORS_ORIGINS`.

### React Query

O projeto **não usa React Query** (não está nas dependências e não há `QueryClientProvider`).
Os hooks de `lib/raio-x/api.ts` imitam a assinatura (`data/isLoading/isError/refetch`) e usam
`cache: "no-store"` com `staleTime` efetivo de 0 — quem faz cache é o backend, que já guarda o
diagnóstico por alguns minutos. Migrar para React Query depois é mecânico: cada `useRecurso`
vira um `useQuery`.

## 2. Endpoints consumidos

| Rota | Hook | Uso |
|---|---|---|
| `/rh/me` | `useSessao` | valida a sessão cedo; 401 redireciona |
| `/rh/diagnostico/por-divisao/regras?atualizar=false` | `useRaioXRegras` | cards, filtro, aba Regra em foco, tabela, totais |
| `/rh/diagnostico/por-divisao/perfil` | `useRaioXPerfil` | aba Quadro: locais, cargos, tipos de vínculo |
| `/rh/diagnostico` | `useDiagnosticoPainel` | aba Qualidade: regras fora dos sete cartões |

`atualizar=true` é usado pelo botão **Atualizar**, no rodapé da tela (à direita da nota de
fonte). Ele refaz as três consultas e mostra "Atualizando…" enquanto o backend recalcula.

## 3. Regras de dados respeitadas

- Os cartões vêm de `cartoes` (ordem, título e `critica`) — nada fixo no código. O `id` é a chave
  usada nos campos da UI; ids fora dos sete conhecidos são descartados.
- Número do card: `total.cartoes[id]` com "Toda a Prefeitura"; `divisao.cartoes[id]` com uma
  secretaria.
- Média: `total.cartoes[id] / total.vinculos`. **Nunca** soma de divisões.
- Volume da secretaria: soma dos sete `cartoes` daquela divisão.
- Aba Quadro: com "Toda a Prefeitura", locais/cargos/tipos são somados pelo nome entre divisões;
  com uma secretaria, só a dela.
- Aba Qualidade: regras de `/rh/diagnostico` cujo código não aparece em nenhum `cartoes[].regras`.
  Com uma divisão selecionada, **o número e o filtro** vêm de `divisao.regras[codigo]` — se o
  filtro olhasse o total da Prefeitura, a lista mostraria linhas zeradas.

## 4. Variáveis de ambiente

```env
NEXT_PUBLIC_RAIO_X_MOCK=false          # true = mock embutido, sem rede
BACKEND_URL=http://localhost:8000      # casa; CT-THOTH: http://localhost:8010
NEXT_PUBLIC_RAIO_X_TIMEOUT=20000       # ms; o recálculo pode demorar
```

`BACKEND_URL` é lida **no servidor** (proxy e rota de login). Nada de URL de backend no bundle do
cliente.

## 5. Testes

```bash
npm test              # vitest: adaptadores + cálculos
npm run testar:backend  # diagnóstico de conexão, sem navegador
```

As fixtures estão em `lib/raio-x/__fixtures__/` (`raio-x-regras.json`, `raio-x-perfil.json`,
`raio-x-diagnostico.json`). A de regras foi montada com os números de 19/10/2026 do Swagger —
**substitua pelo download real** da resposta para manter os testes fiéis ao SIP.

## 6. Roteiro de verificação (executado em 19/10/2026)

| Passo | Resultado |
|---|---|
| 1. Sessão | ✅ sem cookie as quatro rotas dão 401; após o login do Google a tela carrega |
| 2. Rede | ✅ chamadas em `/api/rh/...` (mesma origem), sem erro de CORS e sem chamada direta à porta 8000 |
| 3. Números com "Toda a Prefeitura" | ✅ cards `394 / 439 / 318 / 6 / 610 / 265 / 466` e `2.463` vínculos no seletor |
| 4. Educação selecionada | ✅ cards `164 / 175 / 142 / 3 / 374 / 101 / 158`, `1.416` vínculos, tabela com `1.941` dependentes e `62,9%` |
| 5. Interação nas abas | ✅ Regra em foco, Quadro, Qualidade e Tabela com dados da API, sem resíduo de mock |
| 6. Botão Atualizar | ⏳ pendente |
| 7. Erro com o backend parado | ⏳ pendente |
| 8. Sessão expirada | ⏳ pendente |

Em `next dev` cada consulta aparece duas vezes no Network por causa do React StrictMode; em
produção é uma chamada só.

## 7. O que a interface mostra e a API ainda não fornece

| Item na tela | Situação |
|---|---|
| **Faixa etária dos dependentes** (aba Qualidade) | Sem endpoint. A tela mostra a estrutura com um aviso de "aguardando `03_faixa_dependentes.sql`". Precisa de contagem por faixa e por divisão. |
| **Subdivisão errada** (coluna da tabela e categoria "Lotação") | `LinhaDivisao` não tem esse campo. Hoje fica `0` e o selo "subdivisão errada" nunca aparece. Precisa de `lot_setor` por divisão. |
| **PIS ausente ou fictício** (categoria "Servidor") | Não há campo no payload. A categoria fica `0`. Precisa de contagem por divisão. |
| **Conformidade P5** (coluna "Conformidade P5") | A API entrega `conformidade` (% sem pendência), que é o que a coluna mostra. Se P5 for outro indicador, falta o campo. |
| **`com_erro` / `com_alerta` / `sem_pendencia`** | Vêm na API e ainda não são exibidos (não há espaço no layout atual). Candidatos naturais a uma futura faixa de resumo. |
| **Lista nominal por secretaria** | O endpoint `/rh/diagnostico/{codigo}?formato=json&limite=100&pagina=1` existe, mas a tela de destino está fora do escopo. O botão "Ver lista nominal" segue desabilitado. |
| **Cabeçalho com vínculos/dependentes** | O card de cabeçalho foi removido a pedido do usuário em 18/10. Vínculos aparecem no seletor de secretaria e na tabela; dependentes na tabela e no rodapé de totais. |
