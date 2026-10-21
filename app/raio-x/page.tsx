"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { RX } from "@/lib/raio-x/cores";
import { cn } from "@/lib/utils";
import { useRaioX } from "@/lib/raio-x/api";
import { REGRAS_CONHECIDAS } from "@/lib/raio-x/regras";
import {
  alvoDaSelecao,
  listaSecretarias,
  mediaDoTotal,
  totaisDe,
} from "@/lib/raio-x/calculos";
import type { Aba, FiltroState, MinVinc, RegraId, Secretaria } from "@/lib/raio-x/types";
import { SidebarFiltros } from "@/components/raio-x/sidebar-filtros";
import { AbaRegraFoco } from "@/components/raio-x/aba-regra-foco";
import { AbaQuadro } from "@/components/raio-x/aba-quadro";
import { AbaQualidade } from "@/components/raio-x/aba-qualidade";
import { TabelaSecretarias } from "@/components/raio-x/tabela-secretarias";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const ABAS: { id: Aba; label: string }[] = [
  { id: "regra", label: "Regra em foco" },
  { id: "quadro", label: "Quadro" },
  { id: "qualidade", label: "Qualidade" },
  { id: "tabela", label: "Tabela" },
];

const PADRAO: FiltroState = { sec: "ALL", regra: "cert", minVinc: 1, aba: "regra" };
const VAZIO: Secretaria[] = [];

export default function RaioXPage() {
  const [estado, setEstado] = React.useState<FiltroState>(PADRAO);
  const { data, isLoading, isError, erro, status, atualizando, refetch, atualizar } = useRaioX({
    sec: estado.sec,
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

  const onSec = (valor: string) => setEstado((atual) => ({ ...atual, sec: valor }));
  const onMin = (valor: MinVinc) => setEstado((atual) => ({ ...atual, minVinc: valor }));
  const onAba = (valor: Aba) => setEstado((atual) => ({ ...atual, aba: valor }));
  const onRegra = (valor: RegraId) =>
    setEstado((atual) => ({ ...atual, regra: valor, aba: "regra" }));
  const onToggleSec = (cod: string) =>
    setEstado((atual) => ({ ...atual, sec: atual.sec === cod ? "ALL" : cod }));
  const onLimpar = () => setEstado(PADRAO);

  return (
    <div className="flex flex-1 flex-col gap-3">
      {/* O título vive na trilha do topbar; aqui só garantimos o h1 semântico. */}
      <h1 className="sr-only">Raio-X das Secretarias</h1>

      <div className="grid flex-1 gap-3 lg:grid-cols-[290px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        {isLoading || !data ? (
          <aside className="flex flex-col gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-[236px] w-full rounded-[10px]" />
          </aside>
        ) : (
          <SidebarFiltros
            secretarias={secretarias}
            cartoes={cartoes}
            sec={estado.sec}
            regra={regra}
            minVinc={estado.minVinc}
            valores={totais}
            totalPrefeitura={totalPrefeitura}
            onSec={onSec}
            onRegra={onRegra}
            onMin={onMin}
            onLimpar={onLimpar}
          />
        )}

        <div className="flex min-h-0 min-w-0 flex-col gap-3">
          {/* Faixa de abas: ocupa a largura toda, quatro segmentos iguais */}
          <div
            role="tablist"
            aria-label="Visões do Raio-X"
            className="grid w-full grid-cols-4 gap-1 rounded-[10px] border bg-white p-1"
            style={{ borderColor: RX.borda }}
          >
            {ABAS.map((aba) => {
              const ativa = estado.aba === aba.id;
              return (
                <button
                  key={aba.id}
                  role="tab"
                  aria-selected={ativa}
                  onClick={() => onAba(aba.id)}
                  className={cn(
                    "h-10 w-full rounded-[7px] text-[14px] font-semibold transition-colors",
                    "hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2",
                  )}
                  style={{
                    backgroundColor: ativa ? RX.azulEscuro : undefined,
                    color: ativa ? "#FFFFFF" : RX.texto,
                    outlineColor: RX.azul,
                  }}
                >
                  {aba.label}
                </button>
              );
            })}
          </div>

          {isError ? (
            <div
              className="flex flex-col items-center gap-3 rounded-[10px] border bg-white px-4 py-10"
              style={{ borderColor: RX.borda }}
            >
              <AlertCircle className="size-6" style={{ color: RX.critico }} />
              <p className="text-[13px]" style={{ color: RX.texto }}>
                {status === 403
                  ? "Seu perfil não tem acesso ao painel do diagnóstico."
                  : "Não foi possível carregar os dados do Raio-X."}
              </p>
              {erro && status !== 403 && (
                <p
                  className="max-w-[620px] rounded-md px-3 py-2 text-center font-mono text-[11.5px] leading-relaxed break-words"
                  style={{ color: RX.textoSec, backgroundColor: RX.fundo }}
                >
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
            <div
              className="rounded-[10px] border bg-white px-4 py-10 text-center text-[13px]"
              style={{ borderColor: RX.borda, color: RX.textoSec }}
            >
              Nenhuma secretaria com os filtros atuais.
            </div>
          ) : (
            <>
              {estado.aba === "regra" && (
                <AbaRegraFoco
                  lista={lista}
                  regra={regra}
                  cartoes={cartoes}
                  media={media}
                  sec={estado.sec}
                  onToggleSec={onToggleSec}
                />
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
                  pisFicticio={data.pisFicticio}
                  alertas={data.alertas}
                />
              )}

              {estado.aba === "tabela" && (
                <TabelaSecretarias lista={lista} sec={estado.sec} onToggleSec={onToggleSec} />
              )}

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <p className="text-[11px] leading-relaxed" style={{ color: RX.textoSec }}>
                  Fonte: painel de diagnóstico do RH (empresa 001, situação 1 e 3). Cada regra conta
                  o vínculo uma vez; um vínculo pode aparecer em mais de uma regra. Nenhum dado
                  pessoal nesta página.
                  {data.atualizadoEm ? ` Atualizado em ${data.atualizadoEm}.` : ""}
                </p>

                <button
                  type="button"
                  onClick={atualizar}
                  disabled={atualizando || isLoading}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[7px] border bg-white px-2.5 text-[12.5px] font-medium transition-colors disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ borderColor: RX.borda, color: RX.texto, outlineColor: RX.azul }}
                  title="Recalcula o diagnóstico no backend (pode levar alguns segundos)"
                >
                  <RefreshCw className={`size-3.5 ${atualizando ? "animate-spin" : ""}`} />
                  {atualizando ? "Atualizando…" : "Atualizar"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
