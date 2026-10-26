"use client";

import { agruparCartoes, ROTULO_CARD } from "@/lib/raio-x/regras";
import type { RegraDef, RegraId, Totais } from "@/lib/raio-x/types";
import { RegraCard } from "@/components/raio-x/regra-card";

/**
 * Os sete cards de pendência, em dois grupos (Dependentes / Contato do
 * servidor).
 *
 * Vivem **dentro** da aba Pendência, como coluna à esquerda do conteúdo: eles
 * não filtram nada, são o seletor daquela aba. Antes ocupavam a lateral da
 * página inteira e custavam 290px de largura nas outras três abas.
 *
 * A ordem, os rótulos curtos e o agrupamento vêm de `lib/raio-x/regras.ts`.
 */
export function PainelPendencias({
  cartoes,
  regra,
  valores,
  onRegra,
}: {
  cartoes: RegraDef[];
  regra: RegraId;
  valores: Totais;
  onRegra: (valor: RegraId) => void;
}) {
  const grupos = agruparCartoes(cartoes);

  return (
    <div className="border-border bg-card flex flex-col rounded-[10px] border p-3.5">
      <p className="text-muted-foreground text-[12px] font-semibold">Escolha a pendência</p>

      <div className="mt-2.5 flex flex-col gap-3">
        {grupos.map((grupo, indice) => (
          <div key={grupo.titulo} role="group" aria-labelledby={`rx-grupo-${indice}`}>
            <p
              id={`rx-grupo-${indice}`}
              className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-[0.05em] uppercase"
            >
              {grupo.titulo}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {grupo.itens.map((item) => (
                <RegraCard
                  key={item.id}
                  regra={item}
                  rotulo={ROTULO_CARD[item.id]}
                  valor={valores[item.id]}
                  selecionada={regra === item.id}
                  onSelect={() => onRegra(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
