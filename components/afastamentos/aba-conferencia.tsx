"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
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
import { fmtNum, rotuloTipo } from "@/lib/afastamentos/formato";
import {
  useEsocialResumo,
  useMaternidadeSemDependente,
  usePendenciasEsocial,
} from "@/lib/afastamentos/api";
import { SkeletonGrafico, SkeletonTabela, MensagemErro, TabelaVazia, EtiquetaEsocial } from "./ui";
import { dataBR } from "@/lib/afastamentos/formato";
import Link from "next/link";
import { FileBarChart } from "lucide-react";

/* ------------------------------------------------------------------ */
/* eSocial por tipo                                                    */
/* ------------------------------------------------------------------ */

function TabelaEsocial() {
  const esocial = useEsocialResumo();
  const [reduzidoSelecionado, setReduzidoSelecionado] = React.useState<string | null>(null);
  const pendencias = usePendenciasEsocial({ reduzido: reduzidoSelecionado ?? undefined, status: ["sem_status"] });

  if (esocial.isLoading) return <SkeletonTabela />;
  if (esocial.isError) return <MensagemErro erro={esocial.erro} status={esocial.status} onRetry={esocial.refetch} />;

  const itens = esocial.data?.itens ?? [];
  const totais = esocial.data?.totais;

  const erroCount = (s: Partial<Record<string, number>>) =>
    (s.aguardando ?? 0) + (s.nao_enviado ?? 0) + (s.invalido ?? 0);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Lançamentos</TableHead>
              <TableHead className="text-right">Válido</TableHead>
              <TableHead className="text-right">Sem envio</TableHead>
              <TableHead className="text-right">Com erro</TableHead>
              <TableHead>Motivo eSocial</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((item) => {
              const semEnvio = item.por_status.sem_status ?? 0;
              const metade = item.total / 2;
              return (
                <TableRow key={item.reduzido}>
                  <TableCell className="font-medium">{rotuloTipo(item.reduzido, item.tipo)}</TableCell>
                  <TableCell className="text-right tabular">{fmtNum(item.total)}</TableCell>
                  <TableCell className="text-right tabular">{fmtNum(item.por_status.valido ?? 0)}</TableCell>
                  <TableCell className={cn("text-right tabular", semEnvio > metade && "text-destructive font-semibold")}>
                    {fmtNum(semEnvio)}
                  </TableCell>
                  <TableCell className="text-right tabular">{fmtNum(erroCount(item.por_status))}</TableCell>
                  <TableCell>
                    {item.motivo_esocial ? (
                      <span className="text-success text-[11px] font-medium">Configurado</span>
                    ) : (
                      <span className="text-destructive text-[11px] font-medium">Sem motivo</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setReduzidoSelecionado(item.reduzido)}>
                      Lista
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {totais && (
              <TableRow className="bg-muted/40 font-semibold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right tabular">{fmtNum(totais.total)}</TableCell>
                <TableCell className="text-right tabular">{fmtNum(totais.valido)}</TableCell>
                <TableCell className="text-right tabular">{fmtNum(totais.sem_status)}</TableCell>
                <TableCell className="text-right tabular">{fmtNum(erroCount(totais))}</TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {esocial.data?.observacao && (
        <p className="text-muted-foreground mt-2 text-[11px]">{esocial.data.observacao}</p>
      )}

      {reduzidoSelecionado && (
        <div className="mt-4">
          <RxCard titulo={`Pendências sem envio: ${reduzidoSelecionado}`}>
            {pendencias.isLoading ? <SkeletonTabela /> : pendencias.isError ? (
              <MensagemErro erro={pendencias.erro} status={pendencias.status} onRetry={pendencias.refetch} />
            ) : pendencias.data?.itens.length === 0 ? (
              <TabelaVazia mensagem="Nenhuma pendência sem envio para este tipo." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>REGISTRO</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>eSocial</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendencias.data?.itens.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-[11.5px]">{item.registro ?? "—"}</TableCell>
                        <TableCell>{item.nome ?? "—"}</TableCell>
                        <TableCell>{dataBR(item.dtini)}</TableCell>
                        <TableCell><EtiquetaEsocial status={item.status_esocial ?? "sem_status"} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </RxCard>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Maternidade sem dependente                                          */
/* ------------------------------------------------------------------ */

function BlocoMaternidade() {
  const m = useMaternidadeSemDependente();
  if (m.isLoading) return <SkeletonGrafico />;
  if (m.isError) return <MensagemErro erro={m.erro} status={m.status} onRetry={m.refetch} />;

  const total = m.data?.itens.length ?? 0;
  return (
    <RxCard titulo="Maternidade / paternidade sem filho cadastrado" subtitulo={`${fmtNum(total)} registro${total !== 1 ? "s" : ""}`}>
      {total === 0 ? (
        <TabelaVazia mensagem="Nenhum registro encontrado." />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>REGISTRO</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Secretaria</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {m.data?.itens.map((item) => (
                <TableRow key={item.registro}>
                  <TableCell className="font-mono text-[11.5px]">{item.registro}</TableCell>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell>{item.divisao ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </RxCard>
  );
}

/* ------------------------------------------------------------------ */
/* Aba                                                                 */
/* ------------------------------------------------------------------ */

export function AbaConferencia() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Link href="/relatorios?r=afastamentos-esocial">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            <FileBarChart className="size-3.5" />
            Ver eSocial no Relatórios
          </Button>
        </Link>
        <Link href="/relatorios?r=afastamentos-inconsistencias">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            <FileBarChart className="size-3.5" />
            Ver inconsistências no Relatórios
          </Button>
        </Link>
      </div>

      <RxCard titulo="Situação no eSocial por tipo">
        <TabelaEsocial />
      </RxCard>

      <BlocoMaternidade />
    </div>
  );
}
