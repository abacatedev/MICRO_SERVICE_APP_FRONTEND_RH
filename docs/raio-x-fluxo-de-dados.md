# Como o frontend busca as informações no backend

Documento de rastreio: **de onde vem cada número da tela Raio-X das Secretarias**.
Para o mapa geral da integração (variáveis de ambiente, roteiro de teste, lacunas da API),
veja [`raio-x-backend.md`](./raio-x-backend.md). Aqui o foco é o caminho da requisição.

---

## 0. Resumo em um parágrafo

O navegador **nunca fala com o backend**. Ele chama `/api/rh/...`, na própria origem do
front (`localhost:3000`), e o servidor do Next reescreve a URL para `BACKEND_URL/rh/...`
antes de sair para a rede. São **quatro GETs**, nenhum POST, nenhum token no cliente: a
sessão é um cookie `httpOnly` que o proxy repassa sem que o JavaScript o veja. O JSON cru
cai em `lib/raio-x/adaptadores.ts`, que é a **única** função do projeto autorizada a ler
o formato do backend; o que sai de lá é o `RaioXData` que os componentes consomem.

```
page.tsx
  ├─ useRaioX({ sec })                              lib/raio-x/api.ts
  │    ├─ useSessao()            → GET /api/rh/me
  │    ├─ useRaioXRegras()       → GET /api/rh/diagnostico/por-divisao/regras?atualizar=false
  │    ├─ useRaioXPerfil()       → GET /api/rh/diagnostico/por-divisao/perfil
  │    └─ useDiagnosticoPainel() → GET /api/rh/diagnostico
  └─ useFaixaDependentes({ divisao, atualizar })
       └─ GET /api/rh/indicadores/faixa-dependentes?divisao=…&atualizar=true
                    │
                    │  fetch(caminho, { credentials: "include", cache: "no-store" })
                    ▼
     next.config.ts — rewrites: /api/rh/:caminho*  →  ${BACKEND_URL}/rh/:caminho*
                    ▼
     http://localhost:8000/rh/...      (cookie de sessão httpOnly repassado)
                    ▼
     JSON cru                          (types.ts: RaioXRegras, RaioXPerfil, DiagnosticoPainel)
                    ▼
     adaptadores.ts — funções puras    →  RaioXData (formato da tela)
                    ▼
     useMemo dentro de useRaioX        →  { data, isLoading, isError, status, … }
                    ▼
     componentes — recebem só RaioXData, nunca o JSON da API
```

Três consequências que valem mais que o diagrama:

1. **Trocar de secretaria não faz requisição.** O filtro é 100% no cliente (`useMemo`).
2. **A URL do backend não existe no bundle.** Só o proxy e a rota de login a conhecem, no servidor.
3. **Se o contrato da API mudar, muda um arquivo só:** `adaptadores.ts`. Os componentes não
   sabem que existe um backend.

---

## 1. O caminho de uma requisição, passo a passo

### 1.1 A tela pede os dados

`app/raio-x/page.tsx` é um client component. No topo ele chama um único hook:

```tsx
const { data, isLoading, isError, erro, status, atualizando, refetch, atualizar } =
  useRaioX({ sec: estado.sec });
```

`useRaioX` é a **composição** — não faz `fetch` sozinho. Ela chama os quatro hooks de
recurso, cada um com o seu endpoint, e junta os resultados.

### 1.2 O hook genérico dispara o `fetch`

Todo acesso à rede passa por `useRecurso<T>` em `lib/http/recurso.ts` — o mesmo
cliente usado pela Visão geral. Um `useEffect` dispara a busca sempre que `caminho`,
`ativo` ou `tentativa` mudam:

```ts
const resposta = await fetch(caminho, {
  signal: controle.signal,
  credentials: "include",        // sem isto o proxy não recebe o cookie httpOnly
  headers: { Accept: "application/json" },
  cache: "no-store",             // quem faz cache é o backend
});
```

O `caminho` é sempre relativo e sempre começa com `/api/rh`:

```ts
const BASE = "/api/rh";
const TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_RAIO_X_TIMEOUT ?? 20000);
```

Há um `AbortController` com `setTimeout(TIMEOUT_MS)`: passou de 20 s, a requisição é
abortada e a tela mostra "Tempo esgotado". Um `flag` local (`vivo`) impede `setState`
depois que o componente saiu da tela.

### 1.3 O Next reescreve a URL

`next.config.ts`:

```ts
const backend = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/+$/, "");

async rewrites() {
  return [{ source: "/api/rh/:caminho*", destination: `${backend}/rh/:caminho*` }];
}
```

| O browser pede | O backend recebe |
|---|---|
| `/api/rh/me` | `http://localhost:8000/rh/me` |
| `/api/rh/diagnostico/por-divisao/regras?atualizar=false` | `http://localhost:8000/rh/diagnostico/por-divisao/regras?atualizar=false` |
| `/api/rh/diagnostico/por-divisao/perfil` | `http://localhost:8000/rh/diagnostico/por-divisao/perfil` |
| `/api/rh/diagnostico` | `http://localhost:8000/rh/diagnostico` |
| `/api/rh/indicadores/faixa-dependentes?divisao=000003` | `http://localhost:8000/rh/indicadores/faixa-dependentes?divisao=000003` |

`/api/rh` **não** é prefixo do backend: o rewrite troca esse trecho por `{BACKEND_URL}/rh`.
O `rh` aparece duas vezes por coincidência de nomenclatura — um é do proxy, o outro é o
prefixo real da API.

Como o `fetch` sai da mesma origem, **CORS não entra na conversa** e o cookie `SameSite`
do backend continua válido. Se algum dia o front chamar a porta 8000 direto, aí sim será
preciso liberar `http://localhost:3000` em `CORS_ORIGINS`.

### 1.4 O backend responde

As quatro rotas são `GET` e devolvem JSON. O formato está declarado em
`lib/raio-x/types.ts` (seção "Contrato da API"), que espelha o Swagger. Exemplo de
`/rh/diagnostico/por-divisao/regras`, reduzido:

```json
{
  "gerado_em": "2026-10-20T02:26:36+00:00",
  "cartoes": [
    { "id": "cert", "titulo": "Certidão incompleta", "regras": ["D01", "D02"], "critica": true }
  ],
  "total": {
    "codigo": "ALL", "nome": "Toda a Prefeitura",
    "vinculos": 2463, "dependentes": 3146, "conformidade": 37.1,
    "cartoes": { "cert": 610, "irrf": 394 },
    "regras":  { "D01": 402 }
  },
  "divisoes": [
    {
      "codigo": "000006", "nome": "SECRETARIA MUNICIPAL DE EDUCACAO",
      "vinculos": 1416, "dependentes": 1941, "conformidade": 62.9,
      "cartoes": { "cert": 374, "irrf": 164 },
      "regras":  { "D01": 171 }
    }
  ]
}
```

### 1.5 O adaptador traduz

Ainda dentro de `useRaioX`, um `useMemo` transforma os três payloads em `RaioXData`:

```ts
const cartoes      = adaptarCartoes(regras.data.cartoes);
const total        = adaptarTotal(regras.data, cartoes);
const secretarias  = adaptarSecretarias(regras.data, cartoes);
const adaptado     = adaptarPerfil(perfil.data);
const divisao      = (regras.data.divisoes ?? []).find((d) => d.codigo === sec);
```

Nada de rede aqui: são funções puras, cobertas por `adaptadores.test.ts` com fixtures
reais. Se o backend renomear um campo, é neste arquivo que se conserta — e o teste quebra
antes da tela.

### 1.6 Os componentes desenham

`page.tsx` aplica os filtros e as derivações (`lib/raio-x/calculos.ts`) e passa props já
prontas. Exemplo: a sidebar recebe `valores={totais}` e mostra `valores[item.id]` dentro do
cartão. Nenhum componente conhece `cartoes.cert` nem `LinhaDivisao`.

---

## 2. Sessão: cookie, 401 e 403

O backend grava o cookie de sessão como `httpOnly`. O front **não** lê, **não** guarda e
**não** envia `Authorization`. O `credentials: "include"` faz o browser anexar o cookie em
`/api/rh/...` e o rewrite o repassa ao backend.

O tratamento de status fica em `useRecurso`, antes de qualquer `setState`:

```ts
if (resposta.status === 401) {
  irParaLogin();
  return;                                  // não marca erro: a página vai sair
}

if (resposta.status === 403) {
  setErro("Seu perfil não tem acesso ao painel do diagnóstico.");
  setIsError(true);
  return;
}

if (!resposta.ok) {
  throw new Error(`HTTP ${resposta.status} ${resposta.statusText} em ${caminho}`);
}
```

`irParaLogin()` passa por `/api/rh/login`, que é uma rota do próprio Next
(`app/api/rh/login/route.ts`). Ela redireciona para `{BACKEND_URL}/rh/login?retorno=<url atual>`
— assim a URL do backend continua só no servidor:

```ts
export function GET(request: Request) {
  const backend = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/+$/, "");
  const destino = new URL(`${backend}/rh/login`);
  const retorno = new URL(request.url).searchParams.get("retorno");
  if (retorno) destino.searchParams.set("retorno", retorno);
  return NextResponse.redirect(destino);
}
```

Um detalhe que evita uma tela piscando: como as quatro consultas saem juntas, um 401
dispararia quatro redirecionamentos. Uma variável de módulo segura isso:

```ts
let redirecionando = false;
function irParaLogin() {
  if (typeof window === "undefined" || redirecionando) return;
  redirecionando = true;
  window.location.assign(`${BASE}/login?retorno=${encodeURIComponent(window.location.href)}`);
}
```

| Status | O que a tela faz |
|---|---|
| 200 | segue o fluxo normal |
| 401 | redireciona para o login do backend, voltando para a mesma URL |
| 403 | mostra "Seu perfil não tem acesso ao painel do diagnóstico." e o botão **Tentar novamente**; não redireciona |
| 500 / outro | mostra `HTTP 500 Internal Server Error em /api/rh/...` no bloco de erro |
| rede caiu (`TypeError`) | "Não foi possível conectar ao backend (…). Ele está no ar?" |
| estourou o timeout | "Tempo esgotado (20000 ms) em …" |

---

## 3. As quatro requisições

Todas em `lib/raio-x/api.ts`.

| # | Rota (pelo proxy) | Hook | Parâmetros | Quem consome |
|---|---|---|---|---|
| 1 | `/api/rh/me` | `useSessao` | — | nada diretamente: serve para um 401 chegar cedo e levar ao login |
| 2 | `/api/rh/diagnostico/por-divisao/regras` | `useRaioXRegras` | `?atualizar=false` (ou `true`) | cards da sidebar, seletor de secretaria, aba Pendência, Comparativo, totais |
| 3 | `/api/rh/diagnostico/por-divisao/perfil` | `useRaioXPerfil` | — | aba Panorama: locais, cargos, tipos de vínculo |
| 4 | `/api/rh/diagnostico` | `useDiagnosticoPainel` | — | aba Inconsistências: "Outras regras do diagnóstico" |
| 5 | `/api/rh/indicadores/faixa-dependentes` | `useFaixaDependentes` | `divisao`, `subdivisao`, `vinculo`, `atualizar=true` — só os preenchidos | aba Inconsistências: gráfico "Faixa etária dos dependentes em desconformidade" |

O indicador de faixas fica **fora** de `useRaioX` de propósito: ele tem carregamento e erro
próprios, dentro do card, e não pode segurar o esqueleto da tela inteira. O front hoje só tem o
filtro de secretaria, então só `divisao` é enviado; `subdivisao` e `vinculo` já estão no caminho
para quando a seleção ganhar esses níveis.

Observações:

- **`atualizar=false` explícito.** O backend distingue leitura de recálculo pela query
  string. O front sempre diz o que quer; não depende do default do servidor.
- **A rota 1 não bloqueia nada.** O resultado de `useSessao` é descartado
  (`useSessao();`). Ela existe pelo efeito colateral: se a sessão caiu, o 401 dispara o
  redirecionamento em paralelo, sem esperar as outras três.
- **As rotas 3 e 4 são opcionais na prática.** `adaptarPerfil(null)` devolve mapas vazios e
  `adaptarOutrasRegras(null)` devolve `[]`. Se só elas falharem, a tela abre com Quadro e
  Qualidade vazios em vez de quebrar.
- **A rota 2 é a única que bloqueia.** `isError` e `isLoading` da tela vêm só dela.

### Quando cada uma roda de novo

O `useEffect` depende de `[caminho, ativo, tentativa]`. Traduzindo:

| Ação do usuário | Requisições |
|---|---|
| Abrir a tela | 1, 2, 3, 4 |
| Trocar de secretaria | **nenhuma** (filtro no cliente) |
| Trocar a regra em foco | **nenhuma** |
| Mudar "comparar com 30+/100+" | **nenhuma** |
| Trocar de aba | **nenhuma** |
| Clicar em **Atualizar** | 2 com `atualizar=true`, mais 3 e 4 (ver §7) |
| Clicar em **Tentar novamente** | 1, 2, 3, 4 |

Esse é o motivo de a tela parecer instantânea: 2.463 vínculos e ~20 divisões cabem
tranquilamente no payload, e todo o recorte é feito em memória.

---

## 4. Do JSON da API para o formato da tela

`lib/raio-x/adaptadores.ts`. Mapa campo a campo.

### `LinhaDivisao` → `Secretaria`

| Campo da UI | Origem na API | Tratamento |
|---|---|---|
| `cod` | `codigo` | `String(...)` |
| `curto` | `nome` | `nomeCurto(codigo, nome)`; `"ALL"` vira `"Toda a Prefeitura"` |
| `vinc` | `vinculos` | `num()` |
| `deps` | `dependentes` | `num()` |
| `confP5` | `conformidade` | `num()` — era a coluna "% conforme" da tabela do Comparativo, que saiu da tela em 25/10/2026; o campo continua no contrato |
| `irrf`, `salfam`, `depCpf`, `depNasc`, `cert`, `semEmail`, `semFone` | `cartoes[id]` | laço sobre os cartões que a API mandou |
| `lotSetor` | — | **`0` fixo**: a API não expõe "subdivisão errada" por divisão |

A linha importante é a dos sete cartões:

```ts
for (const cartao of cartoes) {
  secretaria[cartao.id] = num(linha?.cartoes?.[cartao.id]);
}
```

Ou seja: **o id do cartão vindo da API é usado como nome do campo na UI**. É por isso que
`RegraId` é uma união fechada (`"irrf" | "salfam" | …`) e que `adaptarCartoes` descarta
ids desconhecidos — um id novo da API não pode criar um campo que os componentes não sabem
desenhar.

> Não confunda os dois mapas da API:
> `cartoes` é indexado por **id de cartão** (`cert`, `irrf`…) e é o que a tela usa;
> `regras` é indexado por **código de regra** (`D01`, `S02`…) e só serve para descobrir
> quais regras já estão dentro de um cartão (aba Inconsistências) e para o recorte por divisão.
> Um cartão agrupa várias regras — daí a diferença de granularidade.

### `Cartao` → `RegraDef`

```ts
{ id, label: cartao.titulo?.trim() || id, critica: Boolean(cartao.critica) }
```

Ordem, título e selo de crítica vêm do backend. A tela não tem lista fixa. Se a API
devolver `cartoes` vazio, `adaptarCartoes` cai em `REGRAS_RESERVA` para a tela ainda abrir.

### `RaioXPerfil` → `locais` / `cargos` / `tipos`

`divisoes` é um objeto `{ "000006": { locais: [{nome, vinculos}], … } }`. O adaptador
converte cada item em tupla `[nome, quantidade]` e descarta listas vazias. Com uma
secretaria selecionada, a tela lê `locais[cod]`; com "Toda a Prefeitura", `agregarPorNome`
soma tudo pelo nome (dois locais homônimos em secretarias diferentes viram uma linha só).

### `DiagnosticoPainel` → `alertas`

Filtro em três passos:

1. descarta as regras cujo código já aparece em algum `cartoes[].regras` (senão a aba
   Qualidade repetiria os sete cartões);
2. escolhe o número: `divisao.regras[codigo]` se houver divisão selecionada, senão
   `regra.servidores` (total da Prefeitura);
3. descarta quantidade `0`.

O passo 2 é uma correção de bug documentada: filtrar pelo total da Prefeitura enquanto se
exibe o número da divisão fazia a lista mostrar linhas zeradas.

---

## 5. O que **não** vem do backend

Confundir estas duas listas é a origem da maioria dos erros de leitura da tela.

### Vem pronto da API (não recalcular)

| Dado | Campo | Por quê |
|---|---|---|
| Total da Prefeitura | `total` (linha `ALL`) | um vínculo pode aparecer em mais de uma regra; somar as divisões infla o total |
| Média da Prefeitura | `total.cartoes[id] / total.vinculos` | mesma razão; é o tracejado dos gráficos |
| Conformidade | `conformidade` | % sem pendência, calculado no SIP |
| Títulos, ordem e crítica dos cartões | `cartoes[]` | configuração do backend, não do front |
| Data do diagnóstico | `gerado_em` | formatada para `20/10/2026 02:26` por `formatarGeradoEm` |

### É derivado no cliente (`calculos.ts`)

| Dado | Função | Regra |
|---|---|---|
| Lista de secretarias do gráfico | `listaSecretarias` | aplica `minVinc`, mas **nunca esconde a secretaria selecionada** |
| Conjunto da seleção | `alvoDaSelecao` | `ALL` → todas as filtradas; senão, só a escolhida |
| Somas da seleção | `totaisDe` | soma das divisões visíveis (só para o recorte, não para a Prefeitura) |
| % por secretaria | `seriePorSecretaria` | `s[regra] / s.vinc` |
| Peso da regra no volume | `volumePorSecretaria` | foco vs. soma das sete regras |
| Ranking | `rankingCasos` | top 7 por valor absoluto |
| Fatias dos donuts | `fatiasSecretarias`, `fatiasLocais`, `cargosDaSelecao` | top N + "Demais" |
| Categorias da Qualidade | `categoriasQualidade` | agrupa as sete regras em 5 categorias |
| Fatias por regra | `fatiasPorRegra` | uma fatia por regra, agrupada em 3 categorias, a partir da linha `ALL` |
| Outras regras | `adaptarOutrasRegras` | as que não estão em cartão, com `valor` e o `tipo` que o backend classificou |

Detalhe que costuma surpreender: **a média é sempre a da Prefeitura**, mesmo com uma secretaria
selecionada. Com Educação selecionada, `mediaDoTotal` devolve `610 / 2463 = 24,8%`, e não
`374 / 1416 = 26,4%`.

Desde 22/10/2026 ela volta a pintar, mas **sem sair da paleta**: o gráfico A usa duas cores —
`GRAFICO.escuro` para quem está acima da referência e `GRAFICO.principal` para o resto, com
legenda logo abaixo do gráfico dizendo o valor da referência. A terceira cor
(`GRAFICO.claro`) marca a secretaria selecionada. O campo `acima` de `seriePorSecretaria` é
exatamente esse `valor > media`. Continua valendo: nada de laranja/vermelho nas séries.

O donut **"De que regra vêm os apontamentos"** é a exceção de escopo da aba Inconsistências: ele lê
`data.total` (a linha `ALL`), não `alvo`. Por isso não se move quando se escolhe uma secretaria, e
o total dele (2.499 apontamentos) é o do backend, que conta cada vínculo uma vez — a soma das
divisões pode dar outro número. As outras três leituras da aba seguem a seleção.

---

## 6. Rastreio completo: de onde vem o "610"

O cartão crítico (Certidão incompleta) com "Toda a Prefeitura" mostra `610`. O caminho:

```
GET /rh/diagnostico/por-divisao/regras?atualizar=false
  → JSON.total.cartoes.cert ....................... 610
  → adaptarTotal(regras, cartoes)
      adaptarSecretaria(total, cartoes)
        para o cartão { id: "cert" }:
          secretaria["cert"] = num(610) ........... Secretaria.cert = 610
  → useRaioX.data.total
  → page.tsx:  estado.sec === "ALL" ? data.total : totaisDe(alvo)
  → <PainelPendencias valores={totais} />      (só na aba Pendência)
  → <RegraCard valor={valores["cert"]} />
  → fmtNum(610) ................................... "610"
```

E o mesmo par de números produz a referência da Prefeitura (a linha da legenda do gráfico A):

```
mediaDoTotal(data.total, "cert") = pct(610, 2463) = 24,76 → fmtPct → "24,8%"
```

Com Educação selecionada (`sec = "000006"`), o mesmo cartão vira `374` porque o adaptador
leu `divisoes[].cartoes.cert` daquela linha — e a média segue em `24,8%`.

Nenhum passo desse caminho usa `mock.ts`. O mock só entra com
`NEXT_PUBLIC_RAIO_X_MOCK=true`, e nesse caso **não há requisição nenhuma**: todos os hooks
recebem `ativo = false` e `useRaioX` devolve `RAIO_X_MOCK` direto.

---

## 7. O botão Atualizar

Ele não recarrega a página: pede ao backend que **recalcule** o diagnóstico, que é uma
operação cara e por isso fica em cache no servidor.

O botão é só ícone e mora na **topbar, à esquerda do sino** — não no rodapé da tela. Como a
topbar é renderizada pelo `AppShell`, fora da árvore da página, a ligação passa por um contexto
(`components/layout/atualizacao.tsx`): a página registra a ação com `useRegistrarAtualizacao` e a
topbar desenha o botão apenas quando há registro. Tela sem recálculo não ganha botão morto.

```
clique
  → atualizar()
      setVersao(n => n + 1)      // muda o caminho: ?atualizar=true
      perfil.refetch()           // perfil e diagnóstico são invalidados junto
      painel.refetch()
  → useRaioXRegras roda de novo com ?atualizar=true
  → durante a espera: atualizando = regras.isLoading && versao > 0
  → o ícone gira e o botão fica desabilitado
  → ao voltar, o novo gerado_em já vem nos dados da tela
```

Detalhes:

- A versão fica em `useState`, não em `ref`, porque precisa disparar render e mudar o
  `caminho` — que é dependência do `useEffect`.
- Perfil e diagnóstico não têm parâmetro de recálculo; o `refetch` deles só garante que a
  tela não fique com dados de antes do recálculo.
- Se o recálculo estourar os 20 s, a tela mostra o erro de timeout e o backend continua
  trabalhando (o `abort` no cliente não cancela o job no servidor). Um novo clique relê o
  resultado.

---

## 8. Cache e renderização

| Assunto | Comportamento |
|---|---|
| Cache HTTP | `cache: "no-store"` — o front nunca serve resposta velha do browser |
| Cache do backend | o diagnóstico fica pronto no servidor por alguns minutos; por isso a tela abre rápido |
| React Query | **não existe** no projeto. Os hooks imitam a assinatura (`data/isLoading/isError/refetch`) |
| StrictMode | em `next dev` cada consulta aparece **duas vezes** no Network; é o React montando/desmontando o efeito. Em produção é uma |
| Duplicação de dados | `useRaioX` memoiza por `[regras.data, perfil.data, painel.data, sec]`; trocar de secretaria recalcula o `RaioXData` sem nova requisição |
| Estados de carregamento | `isLoading` fica `true` enquanto **qualquer uma** das três estiver buscando; `isError` vem só de `regras` |

---

## 9. Como conferir que está funcionando

1. **Network, filtro `rh`.** Devem aparecer quatro chamadas (oito em dev, por causa do
   StrictMode), todas em `http://localhost:3000/api/rh/...`. Se alguma for para
   `localhost:8000`, o proxy não pegou — o `next.config.ts` só é lido no start do servidor.
2. **Status 200 e `content-type: application/json`.** 401 significa cookie ausente.
3. **Sem erro de CORS no console.** Com proxy não deveria haver nenhum.
4. **Sem `fetch` fora de `recurso.ts`.** Vale como regra de projeto: `grep -r "fetch(" lib app`
   deve encontrar só `lib/http/recurso.ts` e a rota de login.
5. **Números conferindo com o backend.** `npm run testar:backend` mostra os totais de cada
   rota sem abrir o browser.

---

## 10. Checklist para adicionar um endpoint novo

1. Declarar o tipo da resposta em `lib/raio-x/types.ts`, na seção "Contrato da API".
2. Criar o hook em `lib/raio-x/api.ts`, sempre com `useRecurso<T>(\`${BASE}/...\`, !USAR_MOCK)`.
   Não escrever `fetch` novo.
3. Criar a função `adaptar*` em `adaptadores.ts` e um caso em `adaptadores.test.ts` com uma
   fixture em `__fixtures__/`.
4. Se o dado novo alimenta um bloco que hoje é `0` fixo (`lotSetor`, `pisFicticio`), preencher
   no `useMemo` de `useRaioX` e remover o comentário de "a API não expõe".
5. Adicionar a linha na tabela do §3 deste documento e no `raio-x-backend.md`.

O que **não** fazer: chamar o backend de dentro de um componente, guardar o JSON da API em
estado local de componente, ou calcular média somando divisões.

---

## 11. A Visão geral usa exatamente o mesmo caminho

`app/page.tsx` foi migrada para o backend sem criar um segundo cliente HTTP. O que
muda é só a pasta dos hooks e das derivações:

| Raio-X | Visão geral |
| --- | --- |
| `lib/raio-x/api.ts` | `lib/rh/api.ts` |
| `lib/raio-x/adaptadores.ts` | `lib/rh/adaptadores.ts` |
| `lib/raio-x/types.ts` | `lib/rh/types.ts` |
| `lib/raio-x/cores.ts` (alias `RX`) | `lib/paleta.ts` (fonte única) |

O cliente (`lib/http/recurso.ts`), o proxy (`/api/rh`) e o tratamento de 401/403 são
os mesmos — a documentação dos §1 e §2 vale para as duas telas.

### 11.1 Quatro endpoints, sete blocos

| Bloco da tela | Origem | Derivação |
| --- | --- | --- |
| 4 KPIs | `GET /rh/diagnostico` → `resumo` + `universo` | `kpisDoPainel()` |
| Pendências por secretaria (barras) | `GET /rh/diagnostico/por-divisao` | `situacaoPorDivisao()` |
| Apontamentos por tipo (rosca) | `GET /rh/diagnostico` → `regras[]` | `pendenciasPorTipo()` |
| Regras que mais atingem vínculos | `GET /rh/diagnostico` → `regras[]` | `regrasPorServidores()` |
| Funil do diagnóstico | `GET /rh/diagnostico` → `resumo` + `regras[0]` | `funilConformidade()` |
| Vínculos (tabela paginada) | `GET /rh/servidores?pagina=&limite=` | `colunasDeServidores()` |
| Regras com mais ocorrências | `GET /rh/diagnostico` → `regras[]` | `regrasPorOcorrencias()` |

### 11.2 O que a tela deliberadamente não mostra

Estes blocos existiam no template e **não** têm origem no backend. Ficaram de fora
para não inventar dado:

- série temporal (o diagnóstico é uma foto: só `gerado_em`);
- qualquer valor monetário (receita, ticket, margem);
- comparação com período anterior (não há histórico para comparar);
- meta ou projeção.

Quando o backend passar a expor série histórica, o caminho é o do §10: tipo novo em
`lib/rh/types.ts`, hook em `lib/rh/api.ts`, derivação em `lib/rh/adaptadores.ts`,
fixture e teste.

### 11.3 Colunas da tabela de vínculos

`/rh/servidores` devolve as colunas cruas do SIP, sem contrato fixo. `colunasDeServidores()`
procura uma lista de chaves conhecidas (`REGISTRO`, `NOME`, `SITUACAO_NOME`, …) e
descarta coluna sem nenhum valor. Se o backend mudar os nomes, a tabela avisa em vez
de renderizar linhas vazias — ajuste `COLUNAS_PREFERIDAS` em `lib/rh/adaptadores.ts`.
