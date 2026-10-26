"use client";

/**
 * Tema atual para quem precisa pintar atributo SVG.
 *
 * Gráfico não aceita classe do Tailwind no `fill`/`stroke` do Recharts — ele
 * escreve atributos no SVG —, então a tela precisa saber em JS se está no
 * escuro para traduzir a paleta com `corNoTema`.
 *
 * O `montado` evita divergência de hidratação: no servidor (e no primeiro
 * render do cliente) o tema é sempre o claro. Na prática não há flash, porque
 * o `ResponsiveContainer` só desenha depois de medir a largura, quando o
 * `resolvedTheme` já está definido.
 *
 * Vive em `lib/` porque as duas telas com gráfico usam: Visão geral e Raio-X.
 */

import * as React from "react";
import { useTheme } from "next-themes";

export function useTemaEscuro(): boolean {
  const { resolvedTheme } = useTheme();
  const [montado, setMontado] = React.useState(false);

  React.useEffect(() => setMontado(true), []);

  return montado && resolvedTheme === "dark";
}
