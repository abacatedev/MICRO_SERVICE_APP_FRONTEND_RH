"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { useFaixaDependentes, useRaioX } from "@/lib/raio-x/api";
import { REGRAS_CONHECIDAS } from "@/lib/raio-x/regras";
import {
  alvoDaSelecao,
  listaSecretarias,
  mediaDoTotal,
  podeLimpar,
  totaisDe,
} from "@/lib/raio-x/calculos";
import type { Aba, FiltroState, MinVinc, RegraId, Secretaria } from "@/lib/raio-x/types";
import { BarraFiltros } from "@/components/raio-x/barra-filtros";
import { PainelPendencias } from "@/components/raio-x/painel-pendencias";
import { AbaRegraFoco } from "@/components/raio-x/aba-regra-foco";
import { AbaQuadro } from "@/components/raio-x/aba-quadro";
import { AbaQualidade } from "@/components/raio-x/aba-qualidade";
import { AbaComparativo } from "@/components/raio-x/aba-comparativo";
import { useRegistrarAtualizacao } from "@/components/layout/atualizacao";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

/**
 * Faixa de abas, na ordem de leitura: o retrato geral, o que está errado, a
 * comparação entre secretarias e, por último, a pendência selecionada.
 *
 * `label` é o que cabe no botão — a barra é `grid-cols-4` com altura fixa, então
 * acima de ~20 caracteres o texto trunca em tela estreita. O assunto completo
 * fica em `titulo`, que vira o cabeçalho do painel.
 */
const ABAS: { id: Aba; label: string; titulo: string }[] = [
  { id: "quadro", label: "Panorama", titulo: "Panorama do quadro de pessoal" },
  { id: "qualidade", label: "Inconsistências", titulo: "Inconsistências por categoria" },
  { id: "tabela", label: "Comparativo", titulo: "Comparativo entre secretarias" },
  { id: "regra", label: "Pendência", titulo: "Análise da pendência selecionada" },
];

// A aba padrão é a primeira da faixa: abrir em "Pendência" deixava três abas à
// esquerda do que estava na tela.
const PADRAO: FiltroState = { sec: "ALL", regra: "cert", minVinc: 1, aba: "quadro" };
const VAZIO: Secretaria[] = [];

export default function RaioXPage() {
  const [estado, setEstado] = React.useState<FiltroState>(PADRAO);
  /**
   * `true` só entre o clique em Atualizar e a próxima troca de filtro.
   *
   * O indicador de faixas manda `atualizar=true` apenas nessa janela: depois
   * disso a seleção volta a ser uma leitura de cache (10 min na API), senão
   * toda troca de secretaria releria o SIP.
   */
  const [forcarFaixas, setForcarFaixas] = React.useState(false);

  const { data, isLoading, isError, erro, status, atualizando, refetch, atualizar } = useRaioX({
    sec: estado.sec,
  });

  /**
   * Indicador da aba Inconsistências. Fica fora de `useRaioX` para não bloquear o
   * esqueleto da tela: ele tem carregamento e erro próprios, dentro do card.
   * Sem secretaria selecionada vai sem `divisao` — a API devolve a Prefeitura.
   */
  const indicadorFaixas = useFaixaDependentes({
    divisao: estado.sec === "ALL" ? null : estado.sec,
    atualizar: forcarFaixas,
  });

  const atualizarTudo = React.useCallback(() => {
    setForcarFaixas(true);
    atualizar();
  }, [atualizar]);

  // O botão "Atualizar" mora na topbar (à esquerda do sino), não no rodapé.
  // Registramos a ação aqui para que ele reflita o estado desta tela.
  useRegistrarAtualizacao({
    atualizar: atualizarTudo,
    ocupado: atualizando || isLoading,
    rotulo: "Atualizar diagnóstico",
    dica: "Recalcula o diagnóstico no backend (pode levar alguns segundos)",
  });

  // Estado inicial a partir da URL (link compartilhável).
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sec = params.get("sec") ?? PADRAO.sec;
    const regraParam = params.get("regra");
    const minParam = Number(params.get("min"));
    const abaParam = params.get("aba");

    const regra: RegraId =
      regraParam && (REGRAS_CONHECIDAS as string[]).includes(regraParam)
        ? (regraParam as RegraId)
        : PADRAO.regra;
    const minVinc: MinVinc = minParam === 30 || minParam === 100 ? (minParam as MinVinc) : 1;
    const aba: Aba =
      abaParam && ABAS.some((a) => a.id === abaParam) ? (abaParam as Aba) : PADRAO.aba;

    setEstado({ sec, regra, minVinc, aba });
  }, []);

  // Mantém a URL sincronizada sem empilhar histórico.
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (estado.sec !== PADRAO.sec) params.set("sec", estado.sec);
    if (estado.regra !== PADRAO.regra) params.set("regra", estado.regra);
    if (estado.minVinc !== PADRAO.minVinc) params.set("min", String(estado.minVinc));
    if (estado.aba !== PADRAO.aba) params.set("aba", estado.aba);
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, [estado]);

  const secretarias = data?.secretarias ?? VAZIO;
  const cartoes = data?.cartoes ?? [];

  // Se a regra da URL não existir na API, cai no primeiro cartão.
  const regra: RegraId = cartoes.some((item) => item.id === estado.regra)
    ? estado.regra
    : (cartoes[0]?.id ?? estado.regra);

  const lista = React.useMemo(
    () => listaSecretarias(secretarias, estado.sec, estado.minVinc),
    [secretarias, estado.sec, estado.minVinc],
  );
  const alvo = React.useMemo(
    () => alvoDaSelecao(secretarias, estado.sec, estado.minVinc),
    [secretarias, estado.sec, estado.minVinc],
  );

  // "Toda a Prefeitura" usa a linha ALL da API, nunca a soma das divisões.
  const totais = React.useMemo(
    () => (estado.sec === "ALL" && data ? data.total : totaisDe(alvo)),
    [estado.sec, data, alvo],
  );

  const media = React.useMemo(
    () => (data ? mediaDoTotal(data.total, regra) : 0),
    [data, regra],
  );

  const totalPrefeitura = data?.total.vinc ?? 0;

  // Título do painel: segue a aba ativa. O `?? ABAS[0]` cobre um `aba` vindo da
  // URL que não exista mais na faixa.
  const abaAtiva = ABAS.find((item) => item.id === estado.aba) ?? ABAS[0];

  // "Limpar" devolve a pendência à regra crítica — o mesmo padrão do primeiro
  // carregamento. Calculado aqui porque a barra de filtros não conhece cartões.
  const regraPadrao = cartoes.find((item) => item.critica)?.id ?? cartoes[0]?.id ?? "cert";
  const temFiltro = podeLimpar(estado, regraPadrao);

  // Trocar de secretaria encerra a janela de recálculo forçado do indicador.
  const onSec = (valor: string) => {
    setForcarFaixas(false);
    setEstado((atual) => ({ ...atual, sec: valor }));
  };
  const onMin = (valor: MinVinc) => setEstado((atual) => ({ ...atual, minVinc: valor }));
  const onAba = (valor: Aba) => setEstado((atual) => ({ ...atual, aba: valor }));
  // Trocar a pendência em foco **não** troca de aba: a aba é escolha da faixa de
  // abas. Antes este handler forçava `aba: "regra"` e quem estava em Panorama,
  // Inconsistências ou Comparativo era jogado de volta ao clicar num card.
  const onRegra = (valor: RegraId) => setEstado((atual) => ({ ...atual, regra: valor }));

  /**
   * Atalho das abas Inconsistências e Comparativo: escolhe a pendência **e**
   * leva para a aba que a analisa.
   *
   * Diferente de `onRegra`, que só troca a seleção: o card da coluna da aba
   * Pendência não deve arrancar o usuário de onde ele está (já está lá).
   */
  const abrirPendencia = (valor: RegraId) =>
    setEstado((atual) => ({ ...atual, regra: valor, aba: "regra" }));
  const onToggleSec = (cod: string) => {
    setForcarFaixas(false);
    setEstado((atual) => ({ ...atual, sec: atual.sec === cod ? "ALL" : cod }));
  };
  const onLimpar = () => {
    setForcarFaixas(false);
    // "Limpar filtros" não troca de aba: `podeLimpar` já ignora `aba`, então
    // resetar a aba aqui contrariava o próprio botão.
    setEstado((atual) => ({ ...PADRAO, aba: atual.aba }));
  };

  return (
    <div className="flex flex-1 flex-col gap-3">
      {/* O título vive na trilha do topbar; aqui só garantimos o h1 semântico. */}
      <h1 className="sr-only">Raio-X das Secretarias</h1>

      {/*
        Filtros numa barra horizontal, acima das abas: valem para as quatro.
        Antes eram uma coluna de 290px à esquerda, largura que todas as abas
        pagavam.

        No erro a barra não aparece: sem `data` não há secretaria para listar, e
        um esqueleto permanente ao lado do bloco de erro leria como "ainda
        carregando".
      */}
      {isError ? null : isLoading || !data ? (
        <Skeleton className="h-[74px] w-full rounded-[10px]" />
      ) : (
        <BarraFiltros
          secretarias={secretarias}
          sec={estado.sec}
          minVinc={estado.minVinc}
          totalPrefeitura={totalPrefeitura}
          temFiltro={temFiltro}
          onSec={onSec}
          onMin={onMin}
          onLimpar={onLimpar}
        />
      )}

      {/* Faixa de abas: ocupa a largura toda, quatro segmentos iguais */}
      <div
        role="tablist"
        aria-label="Visões do Raio-X"
        className="border-border bg-card grid w-full grid-cols-4 gap-1 rounded-[10px] border p-1"
      >
        {ABAS.map((aba) => {
          const ativa = estado.aba === aba.id;
          // `aria-controls` só na aba ativa: apenas o painel dela é montado,
          // e apontar nas inativas criaria referência para um id inexistente.
          return (
            <button
              key={aba.id}
              id={`aba-${aba.id}`}
              role="tab"
              aria-selected={ativa}
              aria-controls={ativa ? `painel-${aba.id}` : undefined}
              onClick={() => onAba(aba.id)}
              className={cn(
                // `truncate` é a rede de segurança: entre 1024 e ~1150px o
                // segmento fica com ~97px e "Inconsistências" é o rótulo mais
                // largo da faixa. De `xl` para cima sobram ~154px por aba.
                "h-10 w-full truncate rounded-[7px] px-1 text-[13px] font-semibold transition-colors xl:text-[14px]",
                "hover:bg-muted focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
                ativa ? "bg-primary text-primary-foreground" : "text-foreground",
              )}
            >
              {aba.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`painel-${estado.aba}`}
        aria-labelledby={`aba-${estado.aba}`}
        className="flex min-h-0 flex-1 flex-col gap-3"
      >
        {/*
          O título da aba: na faixa só cabe o nome curto ("Panorama"), então
          o assunto completo fica aqui e muda junto com a aba. 17px separa
          este `<h2>` dos `<h3>` de 15px dos cards logo abaixo.
        */}
        <h2 className="text-foreground px-1 text-[17px] font-semibold tracking-tight">
          {abaAtiva.titulo}
        </h2>

        {isError ? (
          <div className="border-border bg-card flex flex-col items-center gap-3 rounded-[10px] border px-4 py-10">
            <AlertCircle className="text-destructive size-6" />
            <p className="text-foreground text-[13px]">
              {status === 403
                ? "Seu perfil não tem acesso ao painel do diagnóstico."
                : "Não foi possível carregar os dados do Raio-X."}
            </p>
            {erro && status !== 403 && (
              <p className="bg-muted text-muted-foreground max-w-[620px] rounded-md px-3 py-2 text-center font-mono text-[11.5px] leading-relaxed break-words">
                {erro}
              </p>
            )}
            <Button size="sm" variant="outline" onClick={refetch}>
              <RefreshCw className="size-3.5" />
              Tentar novamente
            </Button>
          </div>
        ) : isLoading || !data ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[268px] w-full rounded-[10px]" />
            <div className="grid gap-3 lg:grid-cols-5">
              <Skeleton className="h-[240px] rounded-[10px] lg:col-span-3" />
              <Skeleton className="h-[240px] rounded-[10px] lg:col-span-2" />
            </div>
          </div>
        ) : lista.length === 0 ? (
          <div className="border-border bg-card text-muted-foreground rounded-[10px] border px-4 py-10 text-center text-[13px]">
            Nenhuma secretaria com os filtros atuais.
          </div>
        ) : (
          <>
            {/*
              A aba Pendência é a única com coluna de cards: eles escolhem qual
              pendência ela analisa. As outras três usam a largura inteira.

              A coluna de cards leva `self-start` para acompanhar o próprio
              conteúdo: o painel da direita é bem mais alto e, esticada, ela
              virava um card comprido com um vazio embaixo. O `items-start` no
              grid resolveria o mesmo, mas aí a direita pararia de preencher a
              altura da tela.
            */}
            {estado.aba === "regra" && (
              <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="self-start">
                  <PainelPendencias
                    cartoes={cartoes}
                    regra={regra}
                    valores={totais}
                    onRegra={onRegra}
                  />
                </div>
                <AbaRegraFoco
                  lista={lista}
                  regra={regra}
                  cartoes={cartoes}
                  media={media}
                  sec={estado.sec}
                  onToggleSec={onToggleSec}
                />
              </div>
            )}

            {estado.aba === "quadro" && (
              <AbaQuadro
                secretarias={secretarias}
                alvo={alvo}
                sec={estado.sec}
                totalPrefeitura={totalPrefeitura}
                locais={data.locais}
                cargos={data.cargos}
                tipoVinculo={data.tipoVinculo}
                onToggleSec={onToggleSec}
              />
            )}

            {estado.aba === "qualidade" && (
              <AbaQualidade
                alvo={alvo}
                total={data.total}
                cartoes={data.cartoes}
                pisFicticio={data.pisFicticio}
                alertas={data.alertas}
                indicador={indicadorFaixas}
                onAbrirPendencia={abrirPendencia}
              />
            )}

            {estado.aba === "tabela" && (
              <AbaComparativo
                lista={lista}
                // "Toda a Prefeitura" não tem secretaria para comparar com ela
                // mesma: o gráfico agrupado só existe com uma selecionada.
                selecionada={estado.sec === "ALL" ? null : (alvo[0] ?? null)}
                total={data.total}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
