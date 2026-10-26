"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { GX, RX, corNoTema } from "@/lib/raio-x/cores";
import {
  composicaoPorSecretaria,
  comparacaoComPrefeitura,
  eixoDePercentual,
  fmtNum,
  fmtPct,
} from "@/lib/raio-x/calculos";
import { COR_CARD, ORDEM_CARDS, ROTULO_CARD } from "@/lib/raio-x/regras";
import { useTemaEscuro } from "@/lib/raio-x/tema";
import type { ComparacaoRegra, LinhaComposicao } from "@/lib/raio-x/calculos";
import type { Secretaria } from "@/lib/raio-x/types";
import { RxCard } from "@/components/raio-x/rx-card";

interface RotuloProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: number | string;
  index?: number;
}

interface TickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value?: string | number };
}

/*
 * Os dois gráficos dividem a linha, então cada um tem ~metade da largura. Nessa
 * largura, sete (ou quatorze) nomes longos não cabem deitados no eixo X sem se
 * encostarem — a saída é inclinar.
 *
 * −45° e não −30°: com o eixo inclinado, a distância perpendicular entre dois
 * rótulos vizinhos é `espaço entre categorias × sen(45°)`. Com ~46px por
 * categoria em 1024px de tela sobram ~32px de folga perpendicular para uma
 * linha de 10px — nenhum rótulo encosta no outro. A −30° a folga cai para 23px
 * e os mais longos passam a se tocar, que era o defeito a corrigir.
 */
const INCLINACAO = -45;

/**
 * Altura reservada para o eixo de categorias inclinado.
 *
 * "Salário-família fora da idade" tem 29 caracteres; a 10px são ~150px de
 * texto, que a −45° descem ~106px. Com 96px o rótulo mais longo era **cortado**
 * — o `height` do `XAxis` é uma caixa, não uma sugestão. 112px cobre os 29
 * caracteres com folga de uns 6px.
 */
const ALTURA_DO_EIXO = 112;

/**
 * Título do card 20% maior (15 → 18px).
 *
 * Vale só para o card da comparação, onde o nome da secretaria é o cabeçalho da
 * leitura e estava no mesmo corpo do texto de apoio. O card da composição
 * continua em 15px porque "Composição das pendências por secretaria" tem 39
 * caracteres: a 18px são ~340px, mais que os ~292px úteis de um card na metade
 * da linha, e o título quebraria em duas linhas empurrando o gráfico para
 * baixo.
 */
const TITULO_AMPLIADO = "text-[18px]";

/** Rótulo de categoria inclinado, ancorado no eixo. */
function rotuloInclinado({
  x,
  y,
  texto,
  cor,
  negrito = false,
  fonte = 10,
}: {
  x: number;
  y: number;
  texto: string;
  cor: string;
  negrito?: boolean;
  fonte?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={fonte}
      fontWeight={negrito ? 700 : 500}
      fill={cor}
      // Gira em torno do próprio ponto de ancoragem: o texto termina no eixo e
      // desce para a esquerda, sem invadir o gráfico.
      transform={`rotate(${INCLINACAO} ${x} ${y})`}
    >
      {texto}
    </text>
  );
}

/* ------------------------------------------------------------------ */
/* Secretaria × média da Prefeitura                                    */
/* ------------------------------------------------------------------ */

function TooltipComparacao({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ComparacaoRegra }[];
}) {
  if (!active || !payload?.length) return null;
  const linha = payload[0].payload;
  const diferenca = linha.secretaria - linha.prefeitura;

  return (
    <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 shadow-md">
      <p className="text-[13px] font-semibold">{linha.rotulo}</p>
      <p className="text-muted-foreground mt-0.5 text-[11.5px]">
        Secretaria: <span className="text-foreground font-semibold">{fmtPct(linha.secretaria)}</span>{" "}
        dos vínculos
      </p>
      <p className="text-muted-foreground text-[11.5px]">
        Prefeitura: {fmtPct(linha.prefeitura)} dos vínculos
      </p>
      <p className="text-muted-foreground mt-0.5 text-[11.5px]">
        {Math.abs(diferenca) < 0.05
          ? "Na média da Prefeitura"
          : `${linha.acima ? "Acima" : "Abaixo"} da Prefeitura em ${fmtPct(Math.abs(diferenca))}`}
      </p>
    </div>
  );
}

/**
 * A) "Secretaria × média da Prefeitura", só com uma secretaria selecionada.
 *
 * **Colunas**, para ficar na mesma orientação da composição ao lado: os dois
 * gráficos passam a ser lidos do mesmo jeito (categoria no eixo X, altura no Y)
 * e a comparação entre eles não exige girar a cabeça.
 *
 * A referência é `mediaDoTotal` (linha `ALL` da API): casos ÷ vínculos de toda
 * a Prefeitura. Não é a média dos percentuais das secretarias.
 *
 * Laranja **só no rótulo** de quem está acima da Prefeitura. As colunas seguem
 * azul (secretaria) e cinza (Prefeitura) — pintar a coluna de laranja faria a
 * cor competir com a altura, que já diz a mesma coisa.
 *
 * **Sem valor em cima de cada coluna.** Com o gráfico na metade da largura, as
 * colunas ficam com ~16px e o rótulo "14,2%" tem ~24px: um encostaria no
 * outro. O eixo Y dá a leitura aproximada e o tooltip, o número exato.
 */
export function GraficoSecretariaVsPrefeitura({
  sec,
  total,
}: {
  sec: Secretaria;
  total: Secretaria;
}) {
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  const serie = comparacaoComPrefeitura(sec, total);
  const corSecretaria = t(GX.principal);
  const corPrefeitura = t(GX.cinza);
  const corAcima = t(RX.laranja);

  // Topo e passo vêm prontos: o eixo não imprime fração e o último valor não
  // encosta na borda.
  const { topo, ticks } = eixoDePercentual(
    serie.flatMap((linha) => [linha.secretaria, linha.prefeitura]),
  );

  const rotuloDaPendencia = (props: TickProps) => {
    const { x = 0, y = 0, payload } = props;
    const texto = String(payload?.value ?? "");
    const acima = Boolean(serie.find((item) => item.rotulo === texto)?.acima);
    return rotuloInclinado({
      x: Number(x),
      y: Number(y),
      texto,
      cor: acima ? corAcima : t(RX.textoSec),
      negrito: acima,
    });
  };

  return (
    <RxCard
      titulo={`${sec.curto} × média da Prefeitura`}
      tituloClassName={TITULO_AMPLIADO}
      subtitulo="Percentual dos vínculos. Nas pendências de dependentes, conta o vínculo com pelo menos um dependente na pendência. Referência: casos ÷ vínculos de toda a Prefeitura."
    >
      {/* h-[340px] nos dois gráficos: a mesma altura alinha as bases das
          colunas dos dois cards, que ficam lado a lado. */}
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={serie}
            margin={{ top: 10, right: 6, left: 6, bottom: 0 }}
            barGap={2}
            // 12% e não 24%: as colunas pedidas 20% mais largas (16 → 19,2)
            // precisam de 40,4px por categoria, e a 24% de gap só sobram 35px —
            // o teto do `maxBarSize` nunca seria alcançado.
            barCategoryGap="12%"
          >
            {/* Colunas: a grade útil é a horizontal. */}
            <CartesianGrid vertical={false} stroke={t(GX.cinzaClaro)} strokeDasharray="3 4" />
            <XAxis
              dataKey="rotulo"
              interval={0}
              tick={rotuloDaPendencia}
              tickLine={false}
              axisLine={false}
              height={ALTURA_DO_EIXO}
            />
            <YAxis
              type="number"
              domain={[0, topo]}
              ticks={ticks}
              tickFormatter={(valor: number) => `${valor}%`}
              tick={{ fontSize: 10, fill: t(RX.textoSec) }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip cursor={{ fill: t(RX.trilho) }} content={<TooltipComparacao />} />
            <Bar dataKey="secretaria" fill={corSecretaria} radius={[3, 3, 0, 0]} maxBarSize={35.2} />
            <Bar dataKey="prefeitura" fill={corPrefeitura} radius={[3, 3, 0, 0]} maxBarSize={35.2} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sem legenda a cor não significa nada: azul/cinza são as duas séries e
          laranja é a condição "acima da Prefeitura", que só aparece no rótulo.
          "Prefeitura" basta aqui — o cálculo está no subtítulo do card.
          Legenda 20% maior (11 → 13,2px): os três itens somam ~330px e quebram
          em duas linhas nos ~292px úteis do card. Não custa altura da aba — o
          card da comparação é o mais baixo dos dois, e a sobra absorve a linha
          extra. */}
      <ul className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <li className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-3 shrink-0 rounded-[2px]"
            style={{ backgroundColor: corSecretaria }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground text-[13.2px] leading-snug">Secretaria</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-3 shrink-0 rounded-[2px]"
            style={{ backgroundColor: corPrefeitura }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground text-[13.2px] leading-snug">Prefeitura</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="text-[13.2px] leading-snug font-bold"
            style={{ color: corAcima }}
            aria-hidden="true"
          >
            Aa
          </span>
          <span className="text-muted-foreground text-[13.2px] leading-snug">
            acima da Prefeitura
          </span>
        </li>
      </ul>
    </RxCard>
  );
}

/* ------------------------------------------------------------------ */
/* Composição das pendências por secretaria                            */
/* ------------------------------------------------------------------ */

function TooltipComposicao({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: LinhaComposicao }[];
}) {
  // O tooltip é componente como qualquer outro: precisa do tema para as
  // amostras de cor não saírem escuras sobre o popover escuro.
  const escuro = useTemaEscuro();

  if (!active || !payload?.length) return null;
  const linha = payload[0].payload;

  return (
    <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 shadow-md">
      <p className="text-[13px] font-semibold">{linha.curto}</p>
      <p className="text-muted-foreground mt-0.5 text-[11.5px]">
        {fmtNum(linha.total)} casos nas sete pendências
      </p>
      <ul className="mt-1 space-y-0.5">
        {ORDEM_CARDS.map((regra) => {
          const valor = Number(linha[regra] ?? 0);
          if (!valor) return null;
          return (
            <li key={regra} className="flex items-baseline gap-1.5 text-[11.5px]">
              <span
                className="inline-block size-2 shrink-0 self-center rounded-[2px]"
                style={{ backgroundColor: corNoTema(COR_CARD[regra], escuro) }}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">{ROTULO_CARD[regra]}</span>
              <span className="text-foreground ml-auto font-semibold tabular-nums">
                {fmtPct(valor)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * B) "Composição das pendências por secretaria": uma coluna 100% empilhada por
 * secretaria, com o total de casos no topo.
 *
 * Ordenada pelo total de casos — a leitura é "quem concentra o estoque" e "de
 * que ele é feito". O filtro "Mostrar secretarias com" já foi aplicado na
 * `lista` recebida.
 *
 * As cores vêm de `COR_CARD` e a ordem de `ORDEM_CARDS`, as mesmas do gráfico
 * ao lado: uma fatia e um rótulo com a mesma cor são a mesma pendência.
 */
export function ComposicaoPendencias({
  lista,
  larguraCheia = false,
}: {
  lista: Secretaria[];
  /** `true` quando é o único gráfico da linha ("Toda a Prefeitura"). */
  larguraCheia?: boolean;
}) {
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  const linhas = composicaoPorSecretaria(lista);
  // Tupla nomeada: num ternário o literal `[3, 3, 0, 0]` vira `number[]` e o
  // Recharts espera quatro posições.
  const raioDoTopo: [number, number, number, number] = [3, 3, 0, 0];
  // Com o gráfico sozinho na linha há o dobro de espaço para as mesmas 14
  // colunas, então elas engordam 15% (26 → 30). O ganho é modesto de propósito:
  // a referência continua sendo a largura de quando os dois dividem a linha, e
  // a comparação entre os dois cards não muda de escala.
  // `maxBarSize` sozinho não alarga nada aqui: quem manda é o espaço que sobra
  // na categoria depois do `barCategoryGap`. Com 14 categorias numa linha de
  // 712px cada uma tem ~51px; a 22% de gap a coluna para em ~40px, muito antes
  // do teto de 60. Por isso o gap também cai quando o gráfico está sozinho — é
  // ele que libera a largura de verdade (40 → ~47px).
  const larguraDaBarra = larguraCheia ? 60 : 26;
  const vaoDaCategoria = larguraCheia ? "8%" : "22%";

  const rotuloTotal = (props: RotuloProps) => {
    const { x = 0, y = 0, width = 0, index = 0 } = props;
    // Lido da linha, não do `value` do rótulo: a última fatia pode ser 0 e o
    // rótulo continua sendo o total da secretaria.
    const total = linhas[Number(index)]?.total ?? 0;
    return (
      <text
        x={Number(x) + Number(width) / 2}
        y={Number(y) - 5}
        textAnchor="middle"
        fontSize={9}
        fontWeight={600}
        fill={t(RX.texto)}
      >
        {fmtNum(total)}
      </text>
    );
  };

  const rotuloDaSecretaria = (props: TickProps) => {
    const { x = 0, y = 0, payload } = props;
    return rotuloInclinado({
      x: Number(x),
      y: Number(y),
      texto: String(payload?.value ?? ""),
      cor: t(RX.textoSec),
      // 9,5 × 1,2 = 11,4. Rótulo maior desce mais a −45°: "Assuntos
      // Estratégicos" (21 caracteres) sai de ~71px para ~85px, dentro dos 112
      // do eixo.
      fonte: 11.4,
    });
  };

  return (
    <RxCard
      titulo="Composição das pendências por secretaria"
      subtitulo="Cada coluna soma 100% dos casos da secretaria. Ordenadas pelo total de casos, que aparece no topo."
    >
      {linhas.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-[13px]">
          Nenhuma secretaria com os filtros atuais.
        </p>
      ) : (
        <>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={linhas}
                margin={{ top: 18, right: 6, left: 6, bottom: 0 }}
                barCategoryGap={vaoDaCategoria}
              >
                <XAxis
                  dataKey="curto"
                  interval={0}
                  tick={rotuloDaSecretaria}
                  tickLine={false}
                  axisLine={false}
                  height={ALTURA_DO_EIXO}
                />
                <YAxis
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 50, 100]}
                  tickFormatter={(valor: number) => `${valor}%`}
                  tick={{ fontSize: 10, fill: t(RX.textoSec) }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip cursor={{ fill: t(RX.trilho) }} content={<TooltipComposicao />} />
                {ORDEM_CARDS.map((regra, indice) => {
                  const ultima = indice === ORDEM_CARDS.length - 1;
                  return (
                    <Bar
                      key={regra}
                      dataKey={regra}
                      stackId="composicao"
                      fill={t(COR_CARD[regra])}
                      maxBarSize={larguraDaBarra}
                      // Arredonda só o topo da pilha: cantos internos
                      // arredondados abririam vãos entre as fatias.
                      radius={ultima ? raioDoTopo : undefined}
                    >
                      {ultima && <LabelList dataKey="total" content={rotuloTotal} />}
                    </Bar>
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {ORDEM_CARDS.map((regra) => (
              <li key={regra} className="flex items-center gap-1.5">
                <span
                  className="inline-block size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: t(COR_CARD[regra]) }}
                  aria-hidden="true"
                />
                <span className="text-muted-foreground text-[11px] leading-snug">
                  {ROTULO_CARD[regra]}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </RxCard>
  );
}

/* ------------------------------------------------------------------ */
/* A aba                                                               */
/* ------------------------------------------------------------------ */

/**
 * Aba Comparativo: o retrato da secretaria contra a Prefeitura (só quando há
 * uma selecionada) e a composição de todas as secretarias.
 *
 * **Os dois gráficos dividem a linha** (`lg:grid-cols-2`): são as duas leituras
 * do mesmo filtro — "esta secretaria está acima da Prefeitura?" e "de que é
 * feito o estoque de cada uma?" — e vê-las juntas evita trocar de contexto para
 * conferir uma contra a outra. Abaixo de 1024px elas empilham, porque metade de
 * uma tela estreita não comporta sete nomes inclinados.
 *
 * O gráfico agrupado some com "Toda a Prefeitura" porque comparar a Prefeitura
 * com ela mesma daria duas colunas idênticas em todas as sete categorias; nesse
 * caso a composição ocupa a linha inteira.
 *
 * **Sem tabela.** A tabela de doze colunas pedia 1.080px numa área de 712px e
 * por isso vivia dentro de um `overflow-auto` com scroll horizontal e vertical
 * próprios — dois scrolls aninhados na mesma tela. O componente
 * `tabela-secretarias.tsx` continua no repositório, sem uso, caso volte.
 */
export function AbaComparativo({
  lista,
  selecionada,
  total,
}: {
  lista: Secretaria[];
  /** A secretaria do filtro, ou `null` em "Toda a Prefeitura". */
  selecionada: Secretaria | null;
  /** Linha `ALL` da API — a referência da Prefeitura. */
  total: Secretaria;
}) {
  return (
    <div
      className={
        selecionada
          ? "grid grid-cols-1 items-stretch gap-3 lg:grid-cols-2"
          : "grid grid-cols-1 items-stretch gap-3"
      }
    >
      {selecionada && <GraficoSecretariaVsPrefeitura sec={selecionada} total={total} />}
      <ComposicaoPendencias lista={lista} larguraCheia={!selecionada} />
    </div>
  );
}
