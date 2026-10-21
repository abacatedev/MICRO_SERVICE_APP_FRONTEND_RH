import * as React from "react";

import { cn } from "@/lib/utils";
import { RX } from "@/lib/raio-x/cores";

/** Card base da tela Raio-X: raio 10px, borda 1px, cabeçalho compacto. */
export function RxCard({
  titulo,
  subtitulo,
  acao,
  children,
  className,
  bodyClassName,
  rodape,
}: {
  titulo?: React.ReactNode;
  subtitulo?: React.ReactNode;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  rodape?: React.ReactNode;
}) {
  return (
    <section
      className={cn("flex flex-col rounded-[10px] border bg-white", className)}
      style={{ borderColor: RX.borda }}
    >
      {(titulo || acao) && (
        <header className="flex items-start justify-between gap-3 px-4 pt-3.5">
          <div className="min-w-0">
            {titulo && (
              <h2
                className="text-[15px] leading-tight font-semibold tracking-tight"
                style={{ color: RX.texto }}
              >
                {titulo}
              </h2>
            )}
            {subtitulo && (
              <p className="mt-1.5 text-[12px] leading-snug" style={{ color: RX.textoSec }}>
                {subtitulo}
              </p>
            )}
          </div>
          {acao && <div className="flex shrink-0 items-center gap-1.5">{acao}</div>}
        </header>
      )}
      <div className={cn("flex flex-1 flex-col px-4 pt-2 pb-3.5", bodyClassName)}>{children}</div>
      {rodape && (
        <footer
          className="mt-auto border-t px-4 py-2 text-[11.5px]"
          style={{ borderColor: RX.borda, color: RX.textoSec }}
        >
          {rodape}
        </footer>
      )}
    </section>
  );
}
