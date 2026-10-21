import { Download, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/section-card";
import { RetentionHeatmap } from "@/components/charts/retention-heatmap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { segments, topCustomers } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";

const stats = [
  { label: "Clientes ativos", value: "3.064", delta: "+6,2%", positive: true },
  { label: "Novos no mês", value: "412", delta: "+18,4%", positive: true },
  { label: "Churn", value: "2,1%", delta: "-0,4 p.p.", positive: true },
  { label: "LTV médio", value: "R$ 8.420", delta: "+3,1%", positive: true },
];

const riskVariant = {
  Baixo: "success",
  Médio: "warning",
  Alto: "destructive",
} as const;

const totalClients = segments.reduce((acc, segment) => acc + segment.clientes, 0);

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Clientes"
        description="Base ativa, retenção por safra e concentração de receita"
        actions={
          <>
            <Button variant="outline" size="sm">
              <UserPlus className="size-3.5" />
              Segmento
            </Button>
            <Button size="sm">
              <Download className="size-3.5" />
              Exportar
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
          title="Retenção por safra"
          description="% de clientes ativos após a primeira compra"
          className="xl:col-span-2"
          action={<Badge variant="secondary">Cohort mensal</Badge>}
        >
          <RetentionHeatmap />
        </SectionCard>

        <SectionCard title="Receita por segmento" description="Participação na base ativa">
          <ul className="space-y-4">
            {segments.map((segment) => (
              <li key={segment.label}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex items-center gap-2 text-[12.5px]">
                    <span
                      className="size-2 rounded-[3px]"
                      style={{ backgroundColor: segment.cor }}
                    />
                    {segment.label}
                  </span>
                  <span className="text-[12.5px] font-semibold tabular">
                    {formatCurrency(segment.receita)}
                  </span>
                </div>
                <div className="text-muted-foreground mt-1 flex items-center justify-between text-[10.5px]">
                  <span>{formatNumber(segment.clientes)} clientes</span>
                  <span className="tabular">
                    {((segment.clientes / totalClients) * 100).toFixed(1)}% da base
                  </span>
                </div>
                <Progress
                  value={(segment.receita / 486000) * 100}
                  className="mt-1.5 h-1"
                  indicatorClassName="bg-primary"
                />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        className="mt-4"
        title="Principais contas"
        description="Ordenadas por receita acumulada (LTV)"
        contentClassName="px-0 pt-2 pb-0"
        action={<Badge variant="outline">6 de 3.064</Badge>}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Cliente</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead className="text-right">LTV</TableHead>
              <TableHead className="text-right">Pedidos</TableHead>
              <TableHead>Última compra</TableHead>
              <TableHead className="pr-5 text-right">Risco de churn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topCustomers.map((customer) => (
              <TableRow key={customer.email}>
                <TableCell className="pl-5">
                  <div className="leading-tight">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-muted-foreground text-[11px]">{customer.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral">{customer.segment}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium tabular">
                  {formatCurrency(customer.ltv)}
                </TableCell>
                <TableCell className="text-muted-foreground text-right tabular">
                  {customer.pedidos}
                </TableCell>
                <TableCell className="text-muted-foreground">{customer.ultima}</TableCell>
                <TableCell className="pr-5 text-right">
                  <Badge variant={riskVariant[customer.risco]}>{customer.risco}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </>
  );
}
