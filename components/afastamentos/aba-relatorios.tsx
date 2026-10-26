"use client";

import { Printer, Download } from "lucide-react";
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
import { useGerencial } from "@/lib/afastamentos/api";
import { RELATORIOS, baixarCSV } from "@/lib/afastamentos/exportar";
import { fmtNum } from "@/lib/afastamentos/formato";
import type { FiltrosAfastamentos } from "@/lib/afastamentos/tipos";
import { SkeletonTabela, MensagemErro, TabelaVazia } from "./ui";

function renderGerencial(dados: Record<string, unknown>): string {
  if (!dados || typeof dados !== "object") return "Nenhum dado disponível.";

  const linhas: string[] = [];
  Object.entries(dados).forEach(([chave, valor]) => {
    if (Array.isArray(valor)) {
      linhas.push(`<h2 style="font-size:16px;margin:16px 0 8px">${chave}</h2>`);
      if (valor.length === 0) {
        linhas.push(`<p style="color:#666">Nenhum item.</p>`);
      } else {
        linhas.push(`<table style="width:100%;border-collapse:collapse;font-size:12px">`);
        const colunas = Object.keys(valor[0] as object);
        linhas.push(`<thead><tr style="background:#f3f6fa">${colunas.map((c) => `<th style="padding:6px 8px;text-align:left;border:1px solid #dce3ec">${c}</th>`).join("")}</tr></thead>`);
        linhas.push(`<tbody>`);
        valor.forEach((item) => {
          linhas.push(`<tr>${colunas.map((c) => `<td style="padding:6px 8px;border:1px solid #dce3ec">${String((item as Record<string, unknown>)[c] ?? "—")}</td>`).join("")}</tr>`);
        });
        linhas.push(`</tbody></table>`);
      }
    } else if (typeof valor === "number") {
      linhas.push(`<p style="font-size:14px;margin:4px 0"><strong>${chave}:</strong> ${fmtNum(valor)}</p>`);
    } else if (typeof valor === "string") {
      linhas.push(`<p style="font-size:14px;margin:4px 0"><strong>${chave}:</strong> ${valor}</p>`);
    } else {
      linhas.push(`<p style="font-size:14px;margin:4px 0"><strong>${chave}:</strong> ${JSON.stringify(valor)}</p>`);
    }
  });
  return linhas.join("");
}

export function AbaRelatorios({ filtros }: { filtros: FiltrosAfastamentos }) {
  const gerencial = useGerencial();

  const imprimir = () => {
    if (!gerencial.data) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const conteudo = renderGerencial(gerencial.data as Record<string, unknown>);
    w.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Relatório Gerencial — Afastamentos</title>
          <style>
            body { font-family: IBM Plex Sans, sans-serif; padding: 24px; color: #14213d; }
            h1 { font-size: 18px; margin-bottom: 16px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Relatório Gerencial — Afastamentos</h1>
          <p style="color:#56637a;font-size:12px;margin-bottom:16px">Sem nomes, CPF ou REGISTRO.</p>
          ${conteudo}
        </body>
      </html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 200);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Gerencial */}
      <RxCard
        titulo="Relatório gerencial para o gabinete"
        subtitulo="Apenas números agregados, sem nomes, CPF ou REGISTRO"
        acao={
          <Button size="sm" variant="outline" onClick={imprimir} disabled={!gerencial.data}>
            <Printer className="size-3.5" />
            Imprimir
          </Button>
        }
      >
        {gerencial.isLoading ? <SkeletonTabela /> : gerencial.isError ? (
          <MensagemErro erro={gerencial.erro} status={gerencial.status} onRetry={gerencial.refetch} />
        ) : !gerencial.data ? (
          <TabelaVazia mensagem="Nenhum dado disponível." />
        ) : (
          <div className="text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: renderGerencial(gerencial.data as Record<string, unknown>) }} />
        )}
      </RxCard>

      {/* CSVs */}
      <RxCard titulo="Listas nominais em CSV" subtitulo="Clique para baixar o arquivo">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Relatório</TableHead>
                <TableHead className="w-[140px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RELATORIOS.map((r) => (
                <TableRow key={r.relatorio}>
                  <TableCell className="font-medium">{r.nome}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => baixarCSV(r.relatorio, filtros)}>
                      <Download className="size-3.5" />
                      Baixar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </RxCard>

      <p className="text-muted-foreground text-[12px]">
        O espelho individual de afastamentos fica na ficha do servidor (aba Servidores → botão Ficha).
      </p>
    </div>
  );
}
