import { Download, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/section-card";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { TransactionsTable } from "@/components/transactions-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { channelSplit, regions } from "@/lib/data";
import { formatCompactCurrency, formatPercent } from "@/lib/utils";

const stats = [
  { label: "Receita no mês", value: "R$ 1,28 mi", delta: "+12,4%", positive: true },
  { label: "Pedidos", value: "8.942", delta: "+4,1%", positive: true },
  { label: "Ticket médio", value: "R$ 143,63", delta: "-1,8%", positive: false },
  { label: "Devoluções", value: "1,9%", delta: "-0,3 p.p.", positive: true },
];

const totalChannels = channelSplit.reduce((acc, item) => acc + item.value, 0);

export default function SalesPage() {
  return (
    <>
      <PageHeader
        title="Vendas"
        description="Performance comercial por período, canal e regional"
        actions={
          <>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="size-3.5" />
              Filtros
            </Button>
            <Button size="sm">
              <Download className="size-3.5" />
              Exportar CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-0 p-4">
            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.05em] uppercase">
              {stat.label}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-[22px] leading-none font-semibold tracking-tight tabular">
                {stat.value}
              </p>
              <span
                className={
                  stat.positive
                    ? "text-[11.5px] font-semibold text-emerald-600 tabular"
                    : "text-[11.5px] font-semibold text-rose-600 tabular"
                }
              >
                {stat.delta}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="Receita e meta por mês"
          description="Janeiro a outubro de 2026 · milhares de reais"
          className="xl:col-span-2"
          action={<Badge variant="secondary">92% da meta anual</Badge>}
        >
          <MonthlyChart />
        </SectionCard>

        <SectionCard title="Funil de vendas" description="Outubro de 2026">
          <FunnelChart />
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard title="Desempenho por canal" description="Receita e participação">
          <ul className="space-y-3.5">
            {channelSplit.map((channel) => (
              <li key={channel.label}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex items-center gap-2 text-[12.5px]">
                    <span
                      className="size-2 rounded-[3px]"
                      style={{ backgroundColor: channel.color }}
                    />
                    {channel.label}
                  </span>
                  <span className="text-[12.5px] font-semibold tabular">
                    {formatCompactCurrency(channel.value)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress
                    value={(channel.value / totalChannels) * 100}
                    className="h-1.5"
                  />
                  <span className="text-muted-foreground w-11 text-right text-[10.5px] tabular">
                    {formatPercent((channel.value / totalChannels) * 100)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Receita por regional" description="Participação no período" className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {regions.map((region) => (
              <div key={region.label}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px]">{region.label}</span>
                  <span className="text-[12px] font-medium tabular">
                    {formatCompactCurrency(region.receita)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={region.share * 2.6} className="h-1" />
                  <span className="text-muted-foreground w-10 text-right text-[10.5px] tabular">
                    {formatPercent(region.share)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        className="mt-4"
        title="Transações"
        description="8.942 pedidos no período · busca e filtros operacionais"
        contentClassName="px-0 pt-3 pb-0"
        footer={
          <div className="text-muted-foreground flex items-center justify-between px-5 py-3 text-[11.5px]">
            <span>8 registros nesta visão</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="ghost" size="sm">
                Próxima
              </Button>
            </div>
          </div>
        }
      >
        <TransactionsTable />
      </SectionCard>
    </>
  );
}
