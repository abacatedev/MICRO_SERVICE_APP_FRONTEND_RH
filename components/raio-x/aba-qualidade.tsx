"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { GX, RX, corNoTema } from "@/lib/raio-x/cores";
import {
  categoriasQualidade,
  fatiasPorRegra,
  fmtNum,
  fmtPct,
  pct,
} from "@/lib/raio-x/calculos";
import { useTemaEscuro } from "@/lib/raio-x/tema";
import type {
  Alerta,
  CategoriaQualidade,
  FaixaDependentes,
  FatiaRegraComCod,
  IndicadorFaixas,
  RegraDef,
  RegraId,
  Secretaria,
  TipoRegra,
} from "@/lib/raio-x/types";
import { Donut } from "@/components/raio-x/donut";
import { RxCard } from "@/components/raio-x/rx-card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Estado do indicador de faixas vindo da página.
 *
 * Estrutural de propósito: o componente não conhece o cliente HTTP, só o que
 * precisa para desenhar. Quem chama `useFaixaDependentes` é `app/raio-x/page.tsx`.
 */
export interface EstadoIndicador {
  data: IndicadorFaixas | null;
  isLoading: boolean;
  isError: boolean;
  erro: string | null;
  status: number | null;
  refetch: () => void;
}

interface TickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value?: string; payload?: FaixaDependentes };
  corExige?: string;
  corTexto?: string;
}

interface RotuloProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  index?: number;
}

/**
 * Rótulo do eixo X em duas linhas: a faixa e, quando `exige_comprovacao`, a
 * palavra "comprovação". A cor nunca carrega esse sentido sozinha.
 */
function TickFaixa({ x = 0, y = 0, payload, corExige, corTexto }: TickProps) {
  const faixa = payload?.payload;
  return (
    <g transform={`translate(${Number(x)},${Number(y)})`}>
      <text textAnchor="middle" dy={13} fontSize={11} fill={corTexto}>
        {payload?.value}
      </text>
      {faixa?.exige_comprovacao && (
        <text textAnchor="middle" dy={25} fontSize={9} fontWeight={700} fill={corExige}>
          comprovação
        </text>
      )}
    </g>
  );
}

function LinhaTooltip({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="text-right font-semibold tabular-nums">{valor}</dd>
    </>
  );
}

function TooltipFaixas({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: FaixaDependentes }[];
}) {
  if (!active || !payload?.length) return null;
  const faixa = payload[0].payload;
  const titulo = faixa.idade_minima === null ? "Sem data de nascimento" : `${faixa.faixa} anos`;

  return (
    <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 shadow-md">
      <p className="text-[13px] font-semibold">{titulo}</p>
      <dl className="mt-1.5 grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 text-[11.5px]">
        <LinhaTooltip rotulo="Dependentes" valor={fmtNum(faixa.dependentes)} />
        <LinhaTooltip rotulo="Em desconformidade" valor={fmtNum(faixa.em_desconformidade)} />
        <LinhaTooltip
          rotulo="IRRF marcado"
          valor={`${fmtNum(faixa.irrf)} (fora do limite: ${fmtNum(faixa.irrf_fora_do_limite)})`}
        />
        <LinhaTooltip
          rotulo="Salário-família marcado"
          valor={`${fmtNum(faixa.salario_familia)} (fora do limite: ${fmtNum(
            faixa.salario_familia_fora_do_limite,
          )})`}
        />
        <LinhaTooltip rotulo="Universitário" valor={fmtNum(faixa.universitario)} />
        <LinhaTooltip rotulo="Deficiente" valor={fmtNum(faixa.deficiente)} />
      </dl>
      {faixa.exige_comprovacao && (
        <p className="text-muted-foreground border-border mt-1.5 border-t border-dashed pt-1.5 text-[11px]">
          Exige comprovação (21 anos em diante)
        </p>
      )}
    </div>
  );
}

/**
 * Faixas etárias dos dependentes em desconformidade.
 *
 * Duas barras por faixa: o total de dependentes (azul principal) e quantos
 * estão em desconformidade, que muda de cor conforme a faixa exija ou não
 * comprovação. Aqui a cor marca uma condição de negócio, não volume — é a
 * exceção combinada com o desenho em 22/10/2026, e só vale para este gráfico.
 */
function GraficoFaixas({ dados }: { dados: IndicadorFaixas }) {
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  const corTotal = t(GX.principal);
  const corExige = t(RX.desconformidade);
  const corLeve = t(RX.desconformidadeLeve);

  // Rótulo em cima da barra; zero não ganha rótulo para não poluir a base.
  const rotulos =
    (chave: "dependentes" | "em_desconformidade", cor: string) => (props: RotuloProps) => {
      const { x = 0, y = 0, width = 0, index = 0 } = props;
      const faixa = dados.faixas[Number(index)];
      if (!faixa) return <g />;
      const valor = faixa[chave];
      if (!valor) return <g />;

      return (
        <text
          x={Number(x) + Number(width) / 2}
          y={Number(y) - 5}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill={cor}
        >
          {fmtNum(valor)}
        </text>
      );
    };

  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dados.faixas}
          margin={{ top: 22, right: 8, left: -18, bottom: 0 }}
          barCategoryGap="20%"
          barGap={2}
        >
          <CartesianGrid vertical={false} stroke={t(GX.cinzaClaro)} strokeDasharray="3 4" />
          <XAxis
            dataKey="faixa"
            interval={0}
            height={44}
            tickLine={false}
            axisLine={{ stroke: t(GX.cinzaClaro) }}
            tick={<TickFaixa corExige={corExige} corTexto={t(RX.textoSec)} />}
          />
          <YAxis
            tick={{ fontSize: 12, fill: t(RX.textoSec) }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip cursor={{ fill: t(RX.trilho) }} content={<TooltipFaixas />} />

          <Bar dataKey="dependentes" name="Dependentes" fill={corTotal} radius={[3, 3, 0, 0]}>
            <LabelList dataKey="dependentes" content={rotulos("dependentes", t(RX.textoSec))} />
          </Bar>

          {/* `fill` é só fallback: quem manda na cor é o `<Cell>` de cada faixa. */}
          <Bar
            dataKey="em_desconformidade"
            name="Em desconformidade"
            fill={corLeve}
            radius={[3, 3, 0, 0]}
          >
            {dados.faixas.map((faixa) => (
              <Cell
                key={faixa.faixa}
                fill={faixa.exige_comprovacao ? corExige : corLeve}
              />
            ))}
            <LabelList
              dataKey="em_desconformidade"
              content={rotulos("em_desconformidade", t(RX.texto))}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LegendaFaixas() {
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  const itens = [
    { cor: t(GX.principal), texto: "Dependentes" },
    { cor: t(RX.desconformidadeLeve), texto: "Em desconformidade" },
    { cor: t(RX.desconformidade), texto: "Exige comprovação (21 anos em diante)" },
  ];

  return (
    <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
      {itens.map((item) => (
        <li key={item.texto} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-3 shrink-0 rounded-[2px]"
            style={{ backgroundColor: item.cor }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground text-[11px] leading-snug">{item.texto}</span>
        </li>
      ))}
    </ul>
  );
}

function TooltipCategoria({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: CategoriaQualidade }[];
}) {
  if (!active || !payload?.length) return null;
  const categoria = payload[0].payload;

  return (
    <div className="border-border bg-popover text-popover-foreground rounded-md border px-2.5 py-2 shadow-md">
      <p className="text-[13px] font-semibold">{categoria.label}</p>
      <p className="text-muted-foreground mt-0.5 text-[11.5px]">{categoria.detalhe}</p>
      <p className="text-foreground mt-1 text-[12px] font-semibold tabular-nums">
        {categoria.semContagem ? "Sem contagem na API" : `${fmtNum(categoria.value)} apontamentos`}
      </p>
    </div>
  );
}

/**
 * Colunas das cinco categorias de inconsistência.
 *
 * A unidade é **apontamento**, não vínculo distinto: um vínculo com IRRF e sem
 * CPF aparece nas duas regras, e é por isso que o subtítulo do card avisa que
 * "um vínculo pode aparecer em mais de uma categoria".
 *
 * A cor é a mesma para todas de propósito — quem identifica a categoria é o
 * rótulo do eixo, não o matiz.
 */
function GraficoCategorias({ categorias }: { categorias: CategoriaQualidade[] }) {
  const escuro = useTemaEscuro();
  const t = (cor: string) => corNoTema(cor, escuro);

  const rotulos = (props: RotuloProps) => {
    const { x = 0, y = 0, width = 0, index = 0 } = props;
    const categoria = categorias[Number(index)];
    if (!categoria) return <g />;

    return (
      <text
        x={Number(x) + Number(width) / 2}
        y={Number(y) - 6}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={t(RX.texto)}
      >
        {categoria.semContagem ? "—" : fmtNum(categoria.value)}
      </text>
    );
  };

  // `flex-1` + `min-h`: sozinho o gráfico tem 210px; ao lado do card do donut
  // (que é mais alto) ele estica até a altura da linha, em vez de deixar um
  // vazio no pé do card. O `min-h` garante o piso se não houver altura extra.
  return (
    <div className="min-h-[210px] w-full flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={categorias}
          margin={{ top: 24, right: 8, left: -8, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid vertical={false} stroke={t(GX.cinzaClaro)} strokeDasharray="3 4" />
          <XAxis
            dataKey="label"
            interval={0}
            height={32}
            tick={{ fontSize: 12, fill: t(RX.textoSec) }}
            tickLine={false}
            axisLine={{ stroke: t(GX.cinzaClaro) }}
          />
          <YAxis
            tickFormatter={(valor: number) => fmtNum(valor)}
            tick={{ fontSize: 12, fill: t(RX.textoSec) }}
            tickLine={false}
            axisLine={false}
            width={46}
          />
          <Tooltip cursor={{ fill: t(RX.trilho) }} content={<TooltipCategoria />} />
          <Bar
            dataKey="value"
            name="Apontamentos"
            fill={t(RX.azul)}
            maxBarSize={96}
            radius={[4, 4, 0, 0]}
          >
            {categorias.map((categoria) => (
              <Cell key={categoria.label} fill={t(categoria.color)} />
            ))}
            <LabelList dataKey="value" content={rotulos} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Legenda do donut, agrupada por categoria.
 *
 * A cor identifica a categoria, então o cabeçalho de cada grupo repete o nome
 * dela ao lado do quadradinho — a cor nunca carrega o significado sozinha. A
 * ordem dos grupos e das regras é exatamente a ordem das fatias.
 *
 * Sem coluna de percentual: desde 22/10/2026 este card divide a linha com
 * "Apontamentos por categoria" (20% da largura), e com nome + valor + `%`
 * o nome da regra virava reticência. A proporção continua legível na rosca e
 * no total de cada grupo.
 */
function LegendaRegras({
  fatias,
  onAbrirPendencia,
}: {
  fatias: FatiaRegraComCod[];
  /** Leva a aba Pendência já com esta regra em foco. */
  onAbrirPendencia: (regra: RegraId) => void;
}) {
  const escuro = useTemaEscuro();

  // Agrupa preservando a ordem: fatias da mesma categoria são vizinhas.
  const grupos: { categoria: string; cor: string; itens: FatiaRegraComCod[] }[] = [];
  for (const fatia of fatias) {
    const atual = grupos[grupos.length - 1];
    if (atual && atual.categoria === fatia.categoria) {
      atual.itens.push(fatia);
    } else {
      grupos.push({ categoria: fatia.categoria, cor: fatia.color, itens: [fatia] });
    }
  }

  // `w-full` vale no empilhado (a coluna encolheria até o conteúdo) e é
  // ignorado no lado a lado, onde quem manda é o `flex-1`.
  return (
    <ul className="w-full min-w-0 flex-1 space-y-2">
      {grupos.map((grupo) => {
        const soma = grupo.itens.reduce((acc, fatia) => acc + fatia.value, 0);
        return (
          <li key={grupo.categoria}>
            <p className="flex items-baseline gap-1.5">
              <span
                className="inline-block size-2 shrink-0 self-center rounded-[2px]"
                style={{ backgroundColor: corNoTema(grupo.cor, escuro) }}
                aria-hidden="true"
              />
              <span className="text-foreground text-[11.5px] font-semibold">{grupo.categoria}</span>
              <span className="text-muted-foreground text-[11px] tabular-nums">{fmtNum(soma)}</span>
            </p>
            <ul className="mt-0.5 space-y-0.5 pl-[14px]">
              {/*
                Cada regra é um atalho para a aba Pendência. O botão envolve nome
                e número para o alvo de clique ser a linha inteira, não só o texto.
              */}
              {grupo.itens.map((fatia) => (
                <li key={fatia.cod}>
                  <button
                    type="button"
                    onClick={() => onAbrirPendencia(fatia.cod)}
                    title={`Ver a pendência "${fatia.label}"`}
                    className="focus-visible:outline-ring flex w-full items-baseline gap-2 rounded-[4px] text-left underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span
                      className="text-muted-foreground min-w-0 flex-1 truncate text-[11.5px]"
                      title={fatia.label}
                    >
                      {fatia.label}
                    </span>
                    <span className="text-foreground shrink-0 text-[11.5px] font-semibold tabular-nums">
                      {fmtNum(fatia.value)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Donut "De que regra vêm os apontamentos".
 *
 * Recebe a linha `ALL` da API (`data.total`), não a seleção: é o único lugar da
 * tela que mostra a Prefeitura inteira por regra, e serve de referência estável
 * para as outras duas leituras da aba. A soma das divisões pode divergir desse
 * total, porque no `ALL` o backend conta cada vínculo uma vez.
 *
 * O empilhamento acompanha a largura do card, não a da tela: abaixo de `xl` o
 * card ocupa a linha inteira e a rosca fica ao lado da legenda; de `xl` para
 * cima ele é a coluna de 20% e a rosca passa para cima, senão a legenda
 * espremeria o nome das regras.
 */
function GraficoRegras({
  total,
  cartoes,
  onAbrirPendencia,
}: {
  total: Secretaria;
  cartoes: RegraDef[];
  onAbrirPendencia: (regra: RegraId) => void;
}) {
  const fatias = fatiasPorRegra(total, cartoes);
  const soma = fatias.reduce((acc, fatia) => acc + fatia.value, 0);

  if (!soma) {
    return (
      <p className="text-muted-foreground py-8 text-center text-[13px]">
        Nenhum apontamento na base.
      </p>
    );
  }

  // O `Donut` é genérico e devolve `Fatia` (com `cod` opcional); aqui toda fatia
  // veio de `fatiasPorRegra`, então o id existe — o `find` só devolve o tipo
  // estreito sem precisar de asserção.
  const abrirPelaFatia = (cod?: string) => {
    const alvo = fatias.find((fatia) => fatia.cod === cod);
    if (alvo) onAbrirPendencia(alvo.cod);
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row xl:flex-col">
      <Donut
        fatias={fatias}
        tamanho={140}
        furo={0.52}
        centroRotulo="Apontamentos"
        centroValor={fmtNum(soma)}
        unidade="apontamentos"
        onSelect={(fatia) => abrirPelaFatia(fatia.cod)}
      />
      <LegendaRegras fatias={fatias} onAbrirPendencia={onAbrirPendencia} />
    </div>
  );
}

/**
 * Cor de cada `tipo` de regra. Três tons da mesma rampa azul + cinza neutro:
 * erro no mais escuro, alerta e conferência no principal, recadastro e
 * indicador no claro (não é falha: é manutenção ou retrato), e cinza quando o
 * backend não classificou. Vermelho e laranja continuam fora das séries.
 */
function corDoTipo(tipo?: TipoRegra): string {
  switch (tipo) {
    case "erro":
      return GX.escuro;
    case "alerta":
    case "conferencia":
      return GX.principal;
    case "recadastro":
    case "indicador":
      return GX.claro;
    default:
      return GX.cinza;
  }
}

/** Rótulo da legenda: agrupa os cinco `tipo` em três leituras de negócio. */
const LEGENDA_TIPOS: { rotulo: string; cor: string; tipos: TipoRegra[] }[] = [
  { rotulo: "Erro", cor: GX.escuro, tipos: ["erro"] },
  { rotulo: "Alerta e conferência", cor: GX.principal, tipos: ["alerta", "conferencia"] },
  { rotulo: "Recadastro e indicador", cor: GX.claro, tipos: ["recadastro", "indicador"] },
];

/**
 * Barras horizontais das regras que ficam fora dos sete cartões.
 *
 * Não é rosca por dois motivos: são 16 fatias com nome longo, e a distribuição é
 * lei de potência (as quatro maiores somam ~93% do total), então parte-do-todo
 * não se sustenta — ainda mais porque um vínculo pode aparecer em várias regras.
 *
 * A cor é o `tipo` que o backend manda, e é o que separa erro de recadastro e de
 * constatação: sem isso, "sem dependentes em nenhum registro" (844) viraria a
 * segunda maior barra parecendo 844 problemas, quando pode não haver nenhum.
 *
 * Lista em HTML e não Recharts: o rótulo precisa de ~300px e de reticências com
 * o texto completo no `title`, o que no eixo de um gráfico não cabe.
 */
function GraficoOutrasRegras({ alertas }: { alertas: Alerta[] }) {
  const escuro = useTemaEscuro();

  const ordenadas = [...alertas].sort((a, b) => b.valor - a.valor);
  const maior = ordenadas[0]?.valor ?? 0;

  if (!ordenadas.length || !maior) {
    return (
      <p className="text-muted-foreground py-8 text-center text-[13px]">
        Nenhuma regra fora dos sete cartões na seleção atual.
      </p>
    );
  }

  const grupos = LEGENDA_TIPOS.filter((grupo) =>
    ordenadas.some((alerta) => alerta.tipo && grupo.tipos.includes(alerta.tipo)),
  );
  const temSemTipo = ordenadas.some((alerta) => !alerta.tipo);

  return (
    <div className="flex flex-col">
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {grupos.map((grupo) => (
          <li key={grupo.rotulo} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-3 shrink-0 rounded-[2px]"
              style={{ backgroundColor: corNoTema(grupo.cor, escuro) }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground text-[11px]">{grupo.rotulo}</span>
          </li>
        ))}
        {temSemTipo && (
          <li className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-3 shrink-0 rounded-[2px]"
              style={{ backgroundColor: corNoTema(GX.cinza, escuro) }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground text-[11px]">Sem classificação</span>
          </li>
        )}
      </ul>

      <ul className="mt-2 space-y-1">
        {ordenadas.map((alerta) => (
          <li key={alerta.t} className="flex items-center gap-2">
            <span
              className="text-muted-foreground w-[42%] shrink-0 truncate text-[11.5px]"
              title={alerta.d ? `${alerta.t} — ${alerta.d}` : alerta.t}
            >
              {alerta.t}
            </span>
            <span className="bg-muted h-2.5 flex-1 overflow-hidden rounded-full">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.max((alerta.valor / maior) * 100, 1.5)}%`,
                  backgroundColor: corNoTema(corDoTipo(alerta.tipo), escuro),
                }}
              />
            </span>
            <span className="text-foreground w-11 shrink-0 text-right text-[11.5px] font-semibold tabular-nums">
              {fmtNum(alerta.valor)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CorpoFaixas({ indicador }: { indicador: EstadoIndicador }) {
  const dados = indicador.data;

  if (indicador.isLoading && !dados) {
    return <Skeleton className="h-[230px] w-full rounded-[8px]" />;
  }

  if (indicador.isError && !dados) {
    return (
      <div className="border-border bg-muted/40 flex flex-col items-start gap-2 rounded-[8px] border border-dashed px-3 py-4">
        <p className="text-foreground text-[13px] font-semibold">
          {indicador.status === 403
            ? "Seu perfil não tem acesso a esta informação."
            : "Não foi possível carregar a faixa etária dos dependentes."}
        </p>
        {indicador.erro && indicador.status !== 403 && (
          <p className="text-muted-foreground font-mono text-[11px] leading-relaxed break-words">
            {indicador.erro}
          </p>
        )}
        <button
          type="button"
          onClick={indicador.refetch}
          className="text-primary focus-visible:outline-ring text-[12px] font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!dados || dados.dependentes === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-[13px]">
        Nenhum dependente na seleção atual.
      </p>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <GraficoFaixas dados={dados} />
      <LegendaFaixas />

      {dados.sem_data > 0 && (
        <p className="text-warning mt-2 text-[11.5px] font-semibold">
          {fmtNum(dados.sem_data)} {dados.sem_data === 1 ? "dependente" : "dependentes"} sem data
          de nascimento.
        </p>
      )}

      <p className="text-muted-foreground mt-2 text-[11px] leading-relaxed">
        IRRF: a condição termina no ano seguinte ao que o dependente completa 21 anos (24 se
        universitário). Salário-família: até 14 anos. Deficientes e cônjuges não entram na
        contagem. Os números medem o cadastro, não o que a folha paga.
      </p>
    </div>
  );
}

export function AbaQualidade({
  alvo,
  total,
  cartoes,
  pisFicticio,
  alertas,
  indicador,
  onAbrirPendencia,
}: {
  alvo: Secretaria[];
  /** Linha `ALL` da API: a Prefeitura inteira, para o donut por regra. */
  total: Secretaria;
  cartoes: RegraDef[];
  pisFicticio: Record<string, number>;
  alertas: Alerta[];
  indicador: EstadoIndicador;
  /** Clique numa regra da legenda do donut: abre a aba Pendência nela. */
  onAbrirPendencia: (regra: RegraId) => void;
}) {
  const categorias = categoriasQualidade(alvo, pisFicticio);
  // Categorias cujo 0 é falta de dado no backend, não falta de ocorrência.
  const semContagem = categorias.filter((c) => c.semContagem).map((c) => c.label);
  const dados = indicador.data;

  const subtitulo =
    dados && dados.dependentes > 0
      ? `${fmtNum(dados.em_desconformidade)} de ${fmtNum(dados.dependentes)} dependentes (${fmtPct(
          pct(dados.em_desconformidade, dados.dependentes),
        )}) com IRRF ou salário-família marcado fora do limite de idade · ${fmtNum(
          dados.vinculos_com_dependentes,
        )} vínculos com dependentes`
      : undefined;

  return (
    <div className="flex flex-1 flex-col gap-3">
      {/*
        80/20 numa linha só: a leitura por categoria é a principal e fica com a
        maior parte; o donut por regra é referência e cabe na coluna estreita.

        Abaixo de `xl` os dois cards empilham — em 1024px o painel tem 712px e
        20% daria ~142px, menos que a rosca de 140px mais o respiro. De `xl` para
        cima o piso de 216px no `minmax` garante o que o donut precisa mesmo
        quando 20% dá menos que isso (em 1280px, 20% de 968 = 193).

        Os 712px agora são a largura inteira da aba: a coluna de 290px dos
        filtros subiu para a barra do topo, então este card só ficou mais largo.
      */}
      <div className="grid gap-3 xl:grid-cols-[minmax(0,4fr)_minmax(216px,1fr)]">
        <RxCard
          className="h-full"
          // Não repete o `<h2>` da aba ("Inconsistências por categoria"): o
          // card fica logo abaixo dele e o título igual lia como duplicata.
          titulo="Apontamentos por categoria"
          subtitulo="Cada vínculo é contado uma vez por regra; um vínculo pode aparecer em mais de uma categoria."
        >
          <GraficoCategorias categorias={categorias} />
          {semContagem.length > 0 && (
            <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
              {semContagem.join(" e ")} ainda {semContagem.length === 1 ? "não tem" : "não têm"}{" "}
              contagem na API; a barra fica vazia.
            </p>
          )}
        </RxCard>

        <RxCard
          className="h-full"
          bodyClassName="justify-center"
          titulo="De que regra vêm os apontamentos"
          subtitulo="Toda a Prefeitura. Cada fatia é uma regra; a legenda mostra a categoria."
        >
          <GraficoRegras
            total={total}
            cartoes={cartoes}
            onAbrirPendencia={onAbrirPendencia}
          />
        </RxCard>
      </div>

      <RxCard titulo="Faixa etária dos dependentes em desconformidade" subtitulo={subtitulo}>
        <CorpoFaixas indicador={indicador} />
      </RxCard>

      <RxCard
        titulo="Outras regras do diagnóstico"
        subtitulo="Regras que não entram nos sete cartões, contadas na seleção atual."
      >
        <GraficoOutrasRegras alertas={alertas} />
      </RxCard>
    </div>
  );
}
