import { cn, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { KpiRH, TomBadge } from "@/lib/rh/types";

/**
 * Card de KPI da Visão geral.
 *
 * Diferente do `KpiCard` do template: não desenha sparkline nem variação
 * percentual, porque o backend não entrega série histórica. No lugar do delta
 * vai um selo calculado a partir das próprias contagens do diagnóstico.
 */
const TOM: Record<TomBadge, string> = {
  neutro: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  bom: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  ruim: "bg-rose-500/12 text-rose-700 dark:text-rose-400",
};

export function KpiRHCard({ kpi }: { kpi: KpiRH }) {
  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-muted-foreground text-[11.5px] font-medium tracking-[0.05em] uppercase">
          {kpi.label}
        </p>
        {kpi.badge && (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular",
              TOM[kpi.tom ?? "neutro"],
            )}
          >
            {kpi.badge}
          </span>
        )}
      </div>

      <p className="num-cond mt-3 text-[27px] leading-none">{formatNumber(kpi.valor)}</p>
      <p className="text-muted-foreground mt-2 text-[11.5px] leading-snug">{kpi.hint}</p>
    </Card>
  );
}
