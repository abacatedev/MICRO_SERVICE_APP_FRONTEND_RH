"use client";

import { cn } from "@/lib/utils";

export function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover min-w-[148px] rounded-lg border px-3 py-2 shadow-lg">
      <p className="text-muted-foreground mb-1.5 text-[11px] font-medium">{label}</p>
      <div className="space-y-1">
        {payload.map((item: any) => (
          <div key={item.dataKey ?? item.name} className="flex items-center gap-2">
            <span
              className={cn("size-2 shrink-0 rounded-full")}
              style={{ backgroundColor: item.color ?? item.payload?.fill ?? "var(--chart-1)" }}
            />
            <span className="text-muted-foreground text-[12px]">{item.name}</span>
            <span className="ml-auto text-[12px] font-semibold tabular">
              {currency
                ? `R$ ${Number(item.value).toLocaleString("pt-BR", { minimumFractionDigits: 0 })} mil`
                : Number(item.value).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
