import { Download, PackageSearch } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/section-card";
import { CategoryChart } from "@/components/charts/category-chart";
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
import { categoryRevenue, topProducts } from "@/lib/data";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

const stats = [
  { label: "SKUs ativos", value: "1.284", delta: "+38", positive: true },
  { label: "Margem bruta", value: "35,6%", delta: "+1,2 p.p.", positive: true },
  { label: "Giro médio", value: "4,8x", delta: "-0,2x", positive: false },
  { label: "Ruptura de estoque", value: "3,2%", delta: "+0,4 p.p.", positive: false },
];

const totalCategory = categoryRevenue.reduce((acc, item) => acc + item.receita, 0);

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Produtos"
        description="Curva ABC, margem e giro do catálogo"
        actions={
          <>
            <Button variant="outline" size="sm">
              <PackageSearch className="size-3.5" />
              Buscar SKU
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
          title="Receita por categoria"
          description="Milhares de reais no mês corrente"
          className="xl:col-span-2"
          action={<Badge variant="secondary">{formatCurrency(totalCategory * 1000)}</Badge>}
        >
          <CategoryChart />
        </SectionCard>

        <SectionCard title="Curva ABC" description="Concentração de receita por faixa de SKU">
          <div className="space-y-4">
            {[
              { label: "Classe A · 12% dos SKUs", value: 68, hint: "R$ 873 mil" },
              { label: "Classe B · 28% dos SKUs", value: 22, hint: "R$ 282 mil" },
              { label: "Classe C · 60% dos SKUs", value: 10, hint: "R$ 128 mil" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-medium">{item.label}</span>
                  <span className="text-[12px] font-semibold tabular">{item.value}%</span>
                </div>
                <Progress value={item.value} className="mt-1.5 h-1.5" />
                <p className="text-muted-foreground mt-1 text-[10.5px]">{item.hint} de receita</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        className="mt-4"
        title="Top produtos"
        description="Receita, unidades e margem nos últimos 30 dias"
        contentClassName="px-0 pt-2 pb-0"
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Produto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Receita</TableHead>
              <TableHead className="text-right">Unid.</TableHead>
              <TableHead className="text-right">Margem</TableHead>
              <TableHead className="w-[140px] pr-5">Participação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((product) => (
              <TableRow key={product.sku}>
                <TableCell className="pl-5 font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-[11.5px]">
                  {product.sku}
                </TableCell>
                <TableCell>
                  <Badge variant="neutral">{product.category}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium tabular">
                  {formatCurrency(product.receita)}
                </TableCell>
                <TableCell className="text-muted-foreground text-right tabular">
                  {formatNumber(product.unidades)}
                </TableCell>
                <TableCell className="text-right tabular">
                  {formatPercent(product.margem)}
                </TableCell>
                <TableCell className="pr-5">
                  <div className="flex items-center gap-2">
                    <Progress value={product.share * 6} className="h-1.5" />
                    <span className="text-muted-foreground w-10 text-right text-[10.5px] tabular">
                      {formatPercent(product.share)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </>
  );
}
