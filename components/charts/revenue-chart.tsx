"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { revenueSeries } from "@/lib/data";

export function RevenueChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={revenueSeries} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="fill-receita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            interval={1}
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
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            content={<ChartTooltip currency />}
          />

          <Area
            type="monotone"
            dataKey="receita"
            name="Receita"
            stroke="var(--chart-1)"
            strokeWidth={2.2}
            fill="url(#fill-receita)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          />
          <Line
            type="monotone"
            dataKey="meta"
            name="Meta"
            stroke="var(--chart-5)"
            strokeWidth={1.6}
            strokeDasharray="5 4"
            dot={false}
            activeDot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
