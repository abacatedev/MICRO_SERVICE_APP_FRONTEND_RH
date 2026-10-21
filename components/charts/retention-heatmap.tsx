import { cn } from "@/lib/utils";
import { cohortPeriods, cohorts } from "@/lib/data";

/** Escala do azul gov.br (#1351B4), do mais escuro ao mais claro. */
function tone(value: number) {
  if (value >= 60) return "bg-[#1351B4] text-white";
  if (value >= 50) return "bg-[#2F6FD0]/85 text-white";
  if (value >= 40) return "bg-[#5B93DF]/70 text-[#0C2350]";
  if (value >= 30) return "bg-[#8FB6EA]/60 text-[#0C2350]";
  if (value >= 20) return "bg-[#BCD3F2]/60 text-[#0C2350] dark:text-[#DCE6F5]";
  return "bg-[#DBE8FB]/70 text-[#0C2350] dark:bg-[#1351B4]/20 dark:text-[#CFE0FB]";
}

export function RetentionHeatmap() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-[11.5px]">
        <thead>
          <tr>
            <th className="text-muted-foreground pb-1 text-left text-[10.5px] font-medium tracking-[0.05em] uppercase">
              Safra
            </th>
            <th className="text-muted-foreground pb-1 text-right text-[10.5px] font-medium tracking-[0.05em] uppercase">
              Clientes
            </th>
            {cohortPeriods.map((period) => (
              <th
                key={period}
                className="text-muted-foreground pb-1 text-center text-[10.5px] font-medium tracking-[0.05em] uppercase"
              >
                {period}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((row) => (
            <tr key={row.label}>
              <td className="pr-2 font-medium whitespace-nowrap">{row.label}</td>
              <td className="text-muted-foreground pr-2 text-right tabular">{row.size}</td>
              {row.values.map((value, index) => (
                <td key={index} className="p-0">
                  {value === null ? (
                    <div className="bg-muted/40 h-7 w-full rounded-[4px]" />
                  ) : (
                    <div
                      className={cn(
                        "flex h-7 w-full items-center justify-center rounded-[4px] font-medium tabular",
                        tone(value),
                      )}
                      title={`${row.label} · ${cohortPeriods[index]}: ${value}%`}
                    >
                      {value}%
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
