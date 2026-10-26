"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fmtNum } from "@/lib/afastamentos/formato";
import type { Gerencial } from "@/lib/afastamentos/tipos";

const ROTULO_REGRA: Record<string, string> = {
  sobrepostos: "Afastamentos sobrepostos",
  "sem-tipo": "Lançamento sem tipo",
  "tipo-descontinuado": "Tipo antigo em aberto",
  "desligado-com-afastamento": "Desligado com afastamento aberto",
};

interface LinhaPendencia {
  rotulo: string;
  valor: number;
  href: string;
  vermelho?: boolean;
  extra?: string;
}

export function ListaPendenciasAfastamentos({ dados }: { dados: Gerencial | null }) {
  if (!dados) {
    return (
      <div className="border-border bg-card flex flex-col gap-4 rounded-[10px] border p-5">
        <p className="text-muted-foreground text-[13px]">Carregando…</p>
      </div>
    );
  }

  const linhas: LinhaPendencia[] = [];

  /* Sem envio ao eSocial */
  const semEnvio = dados.esocial_no_ano?.totais?.sem_status ?? 0;
  const tiposSemMotivo = dados.esocial_no_ano?.tipos_sem_motivo ?? [];
  if (semEnvio > 0 || tiposSemMotivo.length > 0) {
    linhas.push({
      rotulo: "Sem envio ao eSocial",
      valor: semEnvio,
      href: "/afastamentos?aba=conferencia",
      vermelho: true,
      extra:
        tiposSemMotivo.length > 0
          ? `${tiposSemMotivo.length} tipo${tiposSemMotivo.length > 1 ? "s" : ""} sem motivo eSocial: ${tiposSemMotivo.map((t) => t.reduzido).join(", ")}`
          : undefined,
    });
  }

  /* Licenças longas sem remuneração */
  const longos = dados.afastados_longos_sem_remuneracao ?? 0;
  if (longos > 0) {
    linhas.push({
      rotulo: "Licenças longas sem remuneração",
      valor: longos,
      href: "/afastamentos?aba=servidores",
    });
  }

  /* Inconsistências */
  (dados.inconsistencias ?? []).forEach((item) => {
    if (item.total > 0) {
      linhas.push({
        rotulo: ROTULO_REGRA[item.regra] ?? item.regra,
        valor: item.total,
        href: "/afastamentos?aba=conferencia",
      });
    }
  });

  if (linhas.length === 0) {
    return (
      <div className="border-border bg-card flex flex-col gap-4 rounded-[10px] border p-5">
        <h3 className="text-[15px] leading-tight font-semibold tracking-tight">Pendências de afastamentos</h3>
        <p className="text-muted-foreground text-[13px]">Nenhuma pendência registrada.</p>
      </div>
    );
  }

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-[10px] border p-5">
      <h3 className="text-[15px] leading-tight font-semibold tracking-tight">Pendências de afastamentos</h3>

      <ul className="flex flex-col gap-3">
        {linhas.map((linha) => (
          <li key={linha.rotulo}>
            <Link
              href={linha.href}
              className="group flex items-start justify-between gap-2 rounded-[6px] p-2 transition-colors hover:bg-muted"
            >
              <div className="min-w-0">
                <p className={`truncate text-[12.5px] font-medium ${linha.vermelho ? "text-destructive" : "text-foreground"}`}>
                  {linha.rotulo}
                </p>
                {linha.extra && (
                  <p className="text-muted-foreground mt-0.5 text-[11px] leading-snug">{linha.extra}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`text-[13px] font-semibold tabular ${linha.vermelho ? "text-destructive" : "text-foreground"}`}>
                  {fmtNum(linha.valor)}
                </span>
                <ArrowRight className="text-muted-foreground size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
