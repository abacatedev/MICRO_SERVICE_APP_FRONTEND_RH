"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtNum, rotuloStatus, rotuloPerfil, classePerfil } from "@/lib/afastamentos/formato";
import type { StatusEsocial, PerfilRecorrencia } from "@/lib/afastamentos/tipos";

/* ------------------------------------------------------------------ */
/* Cartão de KPI                                                       */
/* ------------------------------------------------------------------ */

export function Cartao({
  titulo,
  valor,
  subtitulo,
  cor = "azul",
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  cor?: "azul" | "vermelho" | "cinza";
}) {
  const corValor =
    cor === "vermelho"
      ? "text-destructive"
      : cor === "cinza"
        ? "text-muted-foreground"
        : "text-foreground";

  return (
    <div className="border-border bg-card flex flex-col rounded-[10px] border p-4">
      <p className="text-muted-foreground text-[11px] font-medium tracking-[0.05em] uppercase">
        {titulo}
      </p>
      <p className={`num-cond mt-2 text-[22px] leading-none tracking-tight ${corValor}`}>
        {typeof valor === "number" ? fmtNum(valor) : valor}
      </p>
      {subtitulo && <p className="text-muted-foreground mt-1 text-[11px]">{subtitulo}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Etiquetas                                                           */
/* ------------------------------------------------------------------ */

const ESOCIAL_VARIANT: Record<StatusEsocial, string> = {
  valido: "success",
  aguardando: "warning",
  nao_enviado: "destructive",
  invalido: "destructive",
  sem_status: "outline",
} as const;

export function EtiquetaEsocial({ status }: { status: StatusEsocial }) {
  const variant = ESOCIAL_VARIANT[status] as "success" | "warning" | "destructive" | "outline";
  return <Badge variant={variant}>{rotuloStatus(status)}</Badge>;
}

export function EtiquetaPerfil({ perfil }: { perfil: PerfilRecorrencia }) {
  return <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${classePerfil(perfil)}`}>{rotuloPerfil(perfil)}</span>;
}

/* ------------------------------------------------------------------ */
/* Estados de carregamento / erro / vazio                              */
/* ------------------------------------------------------------------ */

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[90px] rounded-[10px]" />
      ))}
    </div>
  );
}

export function SkeletonBarra() {
  return <Skeleton className="h-[74px] w-full rounded-[10px]" />;
}

export function SkeletonGrafico() {
  return <Skeleton className="h-[300px] w-full rounded-[10px]" />;
}

export function SkeletonTabela({ linhas = 5 }: { linhas?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-full rounded-[10px]" />
      {Array.from({ length: linhas }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-[10px]" />
      ))}
    </div>
  );
}

export function MensagemErro({
  erro,
  status,
  onRetry,
}: {
  erro: string | null;
  status: number | null;
  onRetry?: () => void;
}) {
  const texto =
    status === 403
      ? "Seu perfil não tem acesso a esta informação."
      : "Não foi possível carregar os dados.";

  return (
    <div className="border-border bg-card flex flex-col items-center gap-3 rounded-[10px] border px-4 py-10">
      <AlertCircle className="text-destructive size-6" />
      <p className="text-foreground text-[13px]">{texto}</p>
      {erro && status !== 403 && (
        <p className="bg-muted text-muted-foreground max-w-[620px] rounded-md px-3 py-2 text-center font-mono text-[11.5px] leading-relaxed break-words">
          {erro}
        </p>
      )}
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RefreshCw className="size-3.5" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

export function TabelaVazia({ mensagem }: { mensagem: string }) {
  return (
    <div className="border-border bg-card text-muted-foreground rounded-[10px] border px-4 py-10 text-center text-[13px]">
      {mensagem}
    </div>
  );
}
