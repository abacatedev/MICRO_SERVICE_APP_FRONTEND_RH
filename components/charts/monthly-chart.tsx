"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { monthlyRevenue } from "@/lib/data";

export function MonthlyChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={monthlyRevenue} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(value: number) => `${value}k`}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            content={<ChartTooltip currency />}
          />
          <Bar dataKey="receita" name="Receita" radius={[4, 4, 0, 0]} maxBarSize={34}>
            {monthlyRevenue.map((entry, index) => (
              <Cell
                key={entry.label}
                fill="var(--chart-1)"
                fillOpacity={index === monthlyRevenue.length - 1 ? 1 : 0.55}
              />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="meta"
            name="Meta"
            stroke="var(--chart-3)"
            strokeWidth={1.8}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
