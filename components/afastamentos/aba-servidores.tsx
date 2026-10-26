"use client";

import * as React from "react";
import Link from "next/link";
import { FileSpreadsheet, Search, UserRound, FileBarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RxCard } from "@/components/raio-x/rx-card";
import { fmtNum, fmtFator } from "@/lib/afastamentos/formato";
import { useRecorrentes } from "@/lib/afastamentos/api";
import type { FiltrosAfastamentos, PerfilRecorrencia } from "@/lib/afastamentos/tipos";
import { LEGENDA_PERFIS, rotuloPerfil } from "@/lib/afastamentos/formato";
import { Cartao, SkeletonTabela, MensagemErro, TabelaVazia, EtiquetaPerfil } from "./ui";
import { baixarCSV } from "@/lib/afastamentos/exportar";

const PERFIS: PerfilRecorrencia[] = ["frequente", "prolongado", "misto", "moderado"];

export function AbaServidores({ filtros }: { filtros: FiltrosAfastamentos }) {
  const [perfil, setPerfil] = React.useState<PerfilRecorrencia | null>(null);
  const [busca, setBusca] = React.useState("");

  const rec = useRecorrentes(filtros.ano, perfil ?? undefined);

  const filtrados = React.useMemo(() => {
    const lista = rec.data?.itens ?? [];
    if (!busca.trim()) return lista;
    const q = busca.toLowerCase();
    return lista.filter(
      (r) =>
        String(r.nome ?? "").toLowerCase().includes(q) ||
        String(r.registro ?? "").toLowerCase().includes(q) ||
        String(r.matricula ?? "").toLowerCase().includes(q) ||
        String(r.cpf ?? "").toLowerCase().includes(q),
    );
  }, [rec.data, busca]);

  const totais = rec.data?.total_por_perfil;

  return (
    <div className="flex flex-col gap-4">
      {/* Busca */}
      <div className="border-border bg-card flex items-center gap-3 rounded-[10px] border px-3.5 py-3">
        <Search className="text-muted-foreground size-4" />
        <Input
          placeholder="Buscar por nome, matrícula, REGISTRO ou CPF"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="h-10 border-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {/* Chips de perfil */}
      {rec.isLoading ? (
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-8 w-24 rounded-full" />
          ))}
        </div>
      ) : rec.isError ? null : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPerfil(null)}
            className={cn(
              "h-8 rounded-full border px-3 text-[12px] font-medium transition-colors",
              perfil === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-card text-foreground hover:bg-muted",
            )}
          >
            Todos ({fmtNum(rec.data?.total ?? 0)})
          </button>
          {PERFIS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPerfil(p)}
              className={cn(
                "h-8 rounded-full border px-3 text-[12px] font-medium transition-colors",
                perfil === p
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card text-foreground hover:bg-muted",
              )}
            >
              {rotuloPerfil(p)} ({fmtNum(totais?.[p] ?? 0)})
            </button>
          ))}
        </div>
      )}

      {/* Legenda dos perfis */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-[11px]">
          {LEGENDA_PERFIS.map((l) => `${rotuloPerfil(l.perfil)} = ${l.texto}`).join(" · ")}
        </p>
        <Link href="/relatorios?r=afastamentos-vigentes">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            <FileBarChart className="size-3.5" />
            Ver no Relatórios
          </Button>
        </Link>
      </div>

      {/* Tabela */}
      <RxCard
        titulo="Servidores recorrentes"
        subtitulo="Ordenados pelo fator de Bradford"
        acao={
          <Button size="sm" variant="outline" onClick={() => baixarCSV("recorrentes", filtros)}>
            <FileSpreadsheet className="size-3.5" />
            Exportar recorrentes (CSV)
          </Button>
        }
      >
        {rec.isLoading ? <SkeletonTabela /> : rec.isError ? (
          <MensagemErro erro={rec.erro} status={rec.status} onRetry={rec.refetch} />
        ) : filtrados.length === 0 ? (
          <TabelaVazia mensagem={busca.trim() ? "Nenhum servidor encontrado com este critério." : "Nenhum servidor recorrente no período."} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>REGISTRO</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Secretaria</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-right">Episódios</TableHead>
                  <TableHead className="text-right">Até 2 dias</TableHead>
                  <TableHead className="text-right">Maior episódio</TableHead>
                  <TableHead className="text-right">Dias no ano</TableHead>
                  <TableHead className="text-right">Bradford</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((item) => (
                  <TableRow key={item.registro}>
                    <TableCell className="font-mono text-[11.5px]">{item.registro}</TableCell>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell>{item.divisao ?? "—"}</TableCell>
                    <TableCell><EtiquetaPerfil perfil={item.perfil} /></TableCell>
                    <TableCell className="text-right tabular">{fmtNum(item.episodios)}</TableCell>
                    <TableCell className="text-right tabular">{fmtNum(item.episodios_curtos)}</TableCell>
                    <TableCell className="text-right tabular">{fmtNum(item.maior_episodio_dias)}</TableCell>
                    <TableCell className="text-right tabular">{fmtNum(item.dias_afastado)}</TableCell>
                    <TableCell className="text-right tabular">{fmtFator(item.fator_bradford)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/afastamentos/servidor/${item.registro}`}>
                          <UserRound className="size-3.5" />
                          Ficha
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </RxCard>
    </div>
  );
}
