import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Card base da tela Raio-X: raio 10px, borda 1px, cabeçalho compacto.
 *
 * Superfície, borda e texto vêm de tokens (`bg-card`, `border-border`,
 * `text-foreground`), então o card acompanha o tema. Nada de `bg-white`.
 *
 * O título é `<h3>`: o `<h2>` de cada aba é o cabeçalho do painel
 * ("Panorama do quadro de pessoal" etc.), e o card vive dentro dele.
 */
export function RxCard({
  titulo,
  tituloClassName,
  subtitulo,
  acao,
  children,
  className,
  bodyClassName,
  rodape,
}: {
  titulo?: React.ReactNode;
  /**
   * Tamanho do título, quando o card pede um cabeçalho maior que os 15px
   * padrão. Existe para o ajuste ficar no card que pediu, sem mexer no título
   * de todas as telas.
   */
  tituloClassName?: string;
  subtitulo?: React.ReactNode;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  rodape?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "border-border bg-card text-card-foreground flex flex-col rounded-[10px] border",
        className,
      )}
    >
      {(titulo || acao) && (
        <header className="flex items-start justify-between gap-3 px-4 pt-3.5">
          <div className="min-w-0">
            {titulo && (
              <h3
                className={cn(
                  "text-[15px] leading-tight font-semibold tracking-tight",
                  tituloClassName,
                )}
              >
                {titulo}
              </h3>
            )}
            {subtitulo && (
              <p className="text-muted-foreground mt-1.5 text-[12px] leading-snug">{subtitulo}</p>
            )}
          </div>
          {acao && <div className="flex shrink-0 items-center gap-1.5">{acao}</div>}
        </header>
      )}
      <div className={cn("flex flex-1 flex-col px-4 pt-2 pb-3.5", bodyClassName)}>{children}</div>
      {rodape && (
        <footer className="border-border text-muted-foreground mt-auto border-t px-4 py-2 text-[11.5px]">
          {rodape}
        </footer>
      )}
    </section>
  );
}
