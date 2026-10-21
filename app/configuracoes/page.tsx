import * as React from "react";
import { CheckCircle2, Database, RefreshCw, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sources = [
  { name: "PostgreSQL · produção", type: "Banco de dados", sync: "há 4 min", status: "Saudável" },
  { name: "Google Analytics 4", type: "Web analytics", sync: "há 12 min", status: "Saudável" },
  { name: "Meta Ads", type: "Mídia paga", sync: "há 32 min", status: "Atenção" },
  { name: "ERP Omie", type: "Financeiro", sync: "há 1 h", status: "Saudável" },
  { name: "Planilha de metas", type: "Upload manual", sync: "há 2 dias", status: "Atenção" },
];

const members = [
  { name: "Ana Vasques", email: "ana@vertice.com.br", role: "Administradora" },
  { name: "Bruno Tavares", email: "bruno@vertice.com.br", role: "Analista" },
  { name: "Carla Menezes", email: "carla@vertice.com.br", role: "Visualizadora" },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12.5px] font-medium">{label}</label>
      {children}
      {hint && <p className="text-muted-foreground text-[11px]">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Workspace, conexões de dados e permissões"
        actions={<Button size="sm">Salvar alterações</Button>}
      />

      <Tabs defaultValue="workspace">
        <TabsList>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="fontes">Fontes de dados</TabsTrigger>
          <TabsTrigger value="membros">Membros</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace">
          <SectionCard
            title="Identidade do workspace"
            description="Informações usadas nos relatórios exportados"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nome do workspace">
                <Input defaultValue="Grupo Vértice" />
              </Field>
              <Field label="Domínio">
                <Input defaultValue="vertice.nexobi.app" />
              </Field>
              <Field label="Fuso horário" hint="Aplicado a todas as séries temporais.">
                <Input defaultValue="America/Sao_Paulo (GMT-3)" />
              </Field>
              <Field label="Moeda padrão">
                <Input defaultValue="BRL — Real brasileiro" />
              </Field>
            </div>

            <Separator className="my-5" />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[12.5px] font-medium">Atualização automática</p>
                <p className="text-muted-foreground text-[11px]">
                  Recalcula os painéis a cada 15 minutos.
                </p>
              </div>
              <Badge variant="success">
                <CheckCircle2 className="size-3" />
                Ativo
              </Badge>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="fontes">
          <SectionCard
            title="Conexões"
            description="5 fontes conectadas · 1 requer atenção"
            contentClassName="px-0 pt-2 pb-0"
            action={
              <Button variant="outline" size="sm">
                <Database className="size-3.5" />
                Conectar fonte
              </Button>
            }
          >
            <ul>
              {sources.map((source, index) => (
                <li
                  key={source.name}
                  className={
                    index === sources.length - 1
                      ? "flex items-center gap-3 px-5 py-3"
                      : "flex items-center gap-3 border-b px-5 py-3"
                  }
                >
                  <span className="bg-accent text-primary flex size-8 items-center justify-center rounded-lg">
                    <Database className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium">{source.name}</p>
                    <p className="text-muted-foreground text-[11px]">
                      {source.type} · sincronizado {source.sync}
                    </p>
                  </div>
                  <Badge variant={source.status === "Saudável" ? "success" : "warning"}>
                    {source.status}
                  </Badge>
                  <Button variant="ghost" size="icon-sm" aria-label="Sincronizar">
                    <RefreshCw className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="membros">
          <SectionCard
            title="Membros"
            description="3 pessoas com acesso a este workspace"
            contentClassName="px-0 pt-2 pb-0"
            action={
              <Button variant="outline" size="sm">
                <Users className="size-3.5" />
                Convidar
              </Button>
            }
          >
            <ul>
              {members.map((member, index) => (
                <li
                  key={member.email}
                  className={
                    index === members.length - 1
                      ? "flex items-center gap-3 px-5 py-3"
                      : "flex items-center gap-3 border-b px-5 py-3"
                  }
                >
                  <span className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-full text-[10.5px] font-semibold">
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium">{member.name}</p>
                    <p className="text-muted-foreground text-[11px]">{member.email}</p>
                  </div>
                  <Badge variant="neutral">{member.role}</Badge>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </>
  );
}
