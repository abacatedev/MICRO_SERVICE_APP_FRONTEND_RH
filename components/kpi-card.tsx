import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { Kpi } from "@/lib/data";

function Sparkline({
  data,
  positive,
  className,
}: {
  data: number[];
  positive: boolean;
  className?: string;
}) {
  const w = 116;
  const h = 34;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * w;
    const y = h - ((value - min) / span) * (h - 6) - 3;
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `M0,${h} L${line.split(" ").join(" L")} L${w},${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-8 w-[104px] overflow-visible", className)}
      role="img"
      aria-label="Tendência do indicador"
    >
      <path
        d={area}
        className={positive ? "fill-emerald-500/10" : "fill-rose-500/10"}
        stroke="none"
      />
      <polyline
        points={line}
        fill="none"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? "stroke-emerald-500" : "stroke-rose-500"}
      />
    </svg>
  );
}

function formatValue(kpi: Kpi) {
  if (kpi.format === "currency") return formatCurrency(kpi.value, kpi.value < 1000);
  if (kpi.format === "percent") return formatPercent(kpi.value);
  return formatNumber(kpi.value);
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const positive = kpi.trend === "up";
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-muted-foreground text-[11.5px] font-medium tracking-[0.05em] uppercase">
          {kpi.label}
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular",
            positive
              ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
              : "bg-rose-500/12 text-rose-700 dark:text-rose-400",
          )}
        >
          <Icon className="size-3" strokeWidth={2.4} />
          {Math.abs(kpi.delta).toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
          {kpi.deltaSuffix ?? "%"}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[26px] leading-none font-semibold tracking-tight tabular">
            {formatValue(kpi)}
          </p>
          <p className="text-muted-foreground mt-2 text-[11.5px] leading-snug">{kpi.hint}</p>
        </div>
        <Sparkline data={kpi.spark} positive={positive} className="mb-1 shrink-0" />
      </div>
    </Card>
  );
}
