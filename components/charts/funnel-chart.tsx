import { funnel } from "@/lib/data";
import { formatNumber, formatPercent } from "@/lib/utils";

export function FunnelChart() {
  const top = funnel[0].value;

  return (
    <div className="space-y-3">
      {funnel.map((step, index) => {
        const width = (step.value / top) * 100;

        return (
          <div key={step.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-[12.5px] font-medium">{step.label}</span>
              <span className="flex items-baseline gap-2">
                <span className="text-[12.5px] font-semibold tabular">
                  {formatNumber(step.value)}
                </span>
                {step.rate !== undefined && (
                  <span className="text-muted-foreground w-12 text-right text-[11px] tabular">
                    {formatPercent(step.rate)}
                  </span>
                )}
              </span>
            </div>
            <div className="bg-muted h-7 w-full overflow-hidden rounded-md">
              <div
                className="from-primary to-secondary flex h-full items-center rounded-md bg-gradient-to-r"
                style={{ width: `${Math.max(width, 3)}%`, opacity: 1 - index * 0.13 }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-muted-foreground pt-1 text-[11px]">
        Conversão ponta a ponta: <span className="text-foreground font-medium">0,86%</span> ·
        visitas → fechados
      </p>
    </div>
  );
}
