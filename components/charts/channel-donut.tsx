"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { channelSplit } from "@/lib/data";
import { formatCompactCurrency, formatPercent } from "@/lib/utils";

const total = channelSplit.reduce((acc, item) => acc + item.value, 0);

export function ChannelDonut() {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[176px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip currency />} />
            <Pie
              data={channelSplit}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={2}
              cornerRadius={4}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {channelSplit.map((slice) => (
                <Cell key={slice.label} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-[10.5px] font-medium tracking-[0.05em] uppercase">
            Total
          </span>
          <span className="mt-0.5 text-[17px] font-semibold tracking-tight tabular">
            {formatCompactCurrency(total)}
          </span>
        </div>
      </div>

      <ul className="space-y-2">
        {channelSplit.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2 text-[12.5px]">
            <span
              className="size-2 shrink-0 rounded-[3px]"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-muted-foreground truncate">{slice.label}</span>
            <span className="ml-auto font-medium tabular">
              {formatPercent((slice.value / total) * 100)}
            </span>
            <span className="text-muted-foreground w-16 text-right text-[11.5px] tabular">
              {formatCompactCurrency(slice.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
