import { CalendarClock, Clock, FileBarChart, MoreHorizontal, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { reports } from "@/lib/data";

const tagVariant = {
  Vendas: "default",
  Clientes: "success",
  Produto: "warning",
  Financeiro: "neutral",
} as const;

const runs = [
  { name: "Fechamento comercial mensal", when: "01/11 às 06:00", status: "Agendado" },
  { name: "Funil de aquisição pago", when: "amanhã às 07:00", status: "Agendado" },
  { name: "Cohort de retenção", when: "seg, 20/10 às 08:00", status: "Agendado" },
  { name: "Margem por categoria", when: "ontem às 06:00", status: "Concluído" },
];

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Visões salvas, compartilhamento e execuções agendadas"
        actions={
          <Button size="sm">
            <Plus className="size-3.5" />
            Novo relatório
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title} className="group gap-0 p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div className="bg-accent text-primary flex size-9 items-center justify-center rounded-lg">
                <FileBarChart className="size-4.5" />
              </div>
              <div className="flex items-center gap-1">
                <Badge variant={tagVariant[report.tag]}>{report.tag}</Badge>
                <Button variant="ghost" size="icon-sm" aria-label="Mais opções">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            </div>

            <h3 className="mt-3 text-[14px] leading-snug font-semibold">{report.title}</h3>
            <p className="text-muted-foreground mt-1 text-[12.5px] leading-relaxed">
              {report.description}
            </p>

            <Separator className="my-3.5" />

            <div className="text-muted-foreground flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3" />
                {report.updated}
              </span>
              {report.schedule ? (
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="size-3" />
                  {report.schedule}
                </span>
              ) : (
                <span>Manual</span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="bg-muted text-muted-foreground flex size-5 items-center justify-center rounded-full text-[9px] font-semibold">
                {report.owner
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="text-muted-foreground truncate text-[11.5px]">{report.owner}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="Execuções agendadas"
          description="Próximas entregas automáticas"
          className="xl:col-span-2"
          contentClassName="px-0 pt-2 pb-0"
        >
          <ul>
            {runs.map((run, index) => (
              <li
                key={run.name}
                className={
                  index === runs.length - 1
                    ? "flex items-center gap-3 px-5 py-3"
                    : "flex items-center gap-3 border-b px-5 py-3"
                }
              >
                <span className="bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-md">
                  <CalendarClock className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium">{run.name}</p>
                  <p className="text-muted-foreground text-[11px]">{run.when}</p>
                </div>
                <Badge variant={run.status === "Concluído" ? "success" : "outline"}>
                  {run.status}
                </Badge>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Uso no mês" description="Consultas e exportações">
          <div className="space-y-4">
            {[
              { label: "Consultas executadas", value: "18.420", hint: "limite 50.000" },
              { label: "Exportações", value: "264", hint: "limite 500" },
              { label: "Assinaturas ativas", value: "38", hint: "9 usuários" },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-[12.5px]">{item.label}</p>
                  <p className="text-muted-foreground text-[10.5px]">{item.hint}</p>
                </div>
                <p className="text-[15px] font-semibold tabular">{item.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
