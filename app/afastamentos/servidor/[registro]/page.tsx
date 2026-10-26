"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Printer, ArrowLeft, AlertCircle } from "lucide-react";
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
import { SkeletonTabela, MensagemErro, EtiquetaEsocial, EtiquetaPerfil } from "@/components/afastamentos/ui";
import { useHistoricoServidor, useRecorrentes } from "@/lib/afastamentos/api";
import { dataBR, fmtNum, rotuloPerfil, fmtFator } from "@/lib/afastamentos/formato";
import { bradfordDoServidor } from "@/lib/afastamentos/calculos";

export default function FichaServidorPage() {
  const params = useParams<{ registro: string }>();
  const registro = params.registro;

  const historico = useHistoricoServidor(registro);
  const recorrentes = useRecorrentes(); // ano padrão para perfil/Bradford

  const perfil = bradfordDoServidor(registro, recorrentes.data);

  const imprimir = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const s = historico.data?.servidor;
    const r = historico.data?.resumo;
    const l = historico.data?.lancamentos ?? [];
    const linhas = l.map((item) => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #dce3ec">${item.tipo}</td>
        <td style="padding:6px 8px;border:1px solid #dce3ec">${dataBR(item.dtini)}</td>
        <td style="padding:6px 8px;border:1px solid #dce3ec">${dataBR(item.retorno_previsto)}</td>
        <td style="padding:6px 8px;border:1px solid #dce3ec">${fmtNum(item.duracao_dias)}</td>
        <td style="padding:6px 8px;border:1px solid #dce3ec">${item.documento_tipo ?? "—"}</td>
        <td style="padding:6px 8px;border:1px solid #dce3ec">${rotuloStatus(item.status_esocial)}</td>
      </tr>
    `).join("");
    w.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Espelho de Afastamentos — ${s?.nome ?? registro}</title>
          <style>
            body { font-family: IBM Plex Sans, sans-serif; padding: 24px; color: #14213d; font-size: 12px; }
            h1 { font-size: 16px; margin-bottom: 8px; }
            p { margin: 2px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th { background: #f3f6fa; text-align: left; padding: 6px 8px; border: 1px solid #dce3ec; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Espelho de Afastamentos</h1>
          <p><strong>Nome:</strong> ${s?.nome ?? "—"}</p>
          <p><strong>REGISTRO:</strong> ${s?.registro ?? "—"}</p>
          <p><strong>Secretaria:</strong> ${s?.divisao ?? "—"}</p>
          <p><strong>Cargo:</strong> ${s?.cargo ?? "—"}</p>
          <p><strong>Situação:</strong> ${s?.situacao_vinculo_nome ?? "—"}</p>
          <hr style="margin:12px 0;border:0;border-top:1px solid #dce3ec" />
          <table>
            <thead>
              <tr>
                <th>Tipo</th><th>Início</th><th>Retorno previsto</th><th>Dias</th><th>Documento</th><th>eSocial</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
          <p style="margin-top:16px;color:#56637a;font-size:10px">Dados do SIP de ${dataBR(historico.data?.data_referencia)}</p>
        </body>
      </html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 200);
  };

  if (historico.status === 404) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <AlertCircle className="text-destructive size-6" />
        <p className="text-foreground text-[13px]">REGISTRO {registro} não encontrado.</p>
        <Button asChild size="sm" variant="outline">
          <Link href="/afastamentos">
            <ArrowLeft className="size-3.5" />
            Voltar para Afastamentos
          </Link>
        </Button>
      </div>
    );
  }

  const s = historico.data?.servidor;
  const r = historico.data?.resumo;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button asChild size="sm" variant="ghost">
          <Link href="/afastamentos">
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-foreground text-[22px] leading-tight font-semibold tracking-tight">
          {s?.nome ?? "Ficha do servidor"}
        </h1>
      </div>

      {historico.isLoading || recorrentes.isLoading ? (
        <SkeletonTabela />
      ) : historico.isError ? (
        <MensagemErro erro={historico.erro} status={historico.status} onRetry={historico.refetch} />
      ) : (
        <>
          {/* Cabeçalho */}
          <div className="border-border bg-card grid gap-4 rounded-[10px] border p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">REGISTRO</p>
              <p className="font-mono text-[13px] font-semibold">{s?.registro}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Secretaria</p>
              <p className="text-[13px] font-semibold">{s?.divisao ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Cargo</p>
              <p className="text-[13px] font-semibold">{s?.cargo ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Situação</p>
              <p className="text-[13px] font-semibold">{s?.situacao_vinculo_nome ?? "—"}</p>
            </div>
          </div>

          {/* Quatro números */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="border-border bg-card rounded-[10px] border p-4">
              <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Dias afastados no ano</p>
              <p className="num-cond mt-2 text-[22px] leading-none">{fmtNum(r?.dias_afastado_no_ano ?? 0)}</p>
            </div>
            <div className="border-border bg-card rounded-[10px] border p-4">
              <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Episódios</p>
              <p className="num-cond mt-2 text-[22px] leading-none">{fmtNum(perfil?.episodios ?? 0)}</p>
            </div>
            <div className="border-border bg-card rounded-[10px] border p-4">
              <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Perfil</p>
              <div className="mt-2">{perfil ? <EtiquetaPerfil perfil={perfil.perfil} /> : <span className="text-muted-foreground text-[13px]">—</span>}</div>
            </div>
            <div className="border-border bg-card rounded-[10px] border p-4">
              <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Bradford</p>
              <p className="num-cond mt-2 text-[22px] leading-none">{perfil ? fmtFator(perfil.fator_bradford) : "—"}</p>
            </div>
          </div>

          {/* Afastado continuamente desde */}
          {r?.afastado_continuamente_desde && (
            <div className="border-border bg-card rounded-[10px] border p-4">
              <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Afastado continuamente desde</p>
              <p className="text-[15px] font-semibold">{dataBR(r.afastado_continuamente_desde)}</p>
            </div>
          )}

          {/* Linha do tempo (lista de episódios) */}
          <RxCard titulo="Episódios do ano" subtitulo="Laranja = até 2 dias · Azul = 3 dias ou mais">
            {perfil?.lista_episodios.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-[13px]">Nenhum episódio no período.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {perfil?.lista_episodios.map((ep, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-md border px-3 py-2 ${ep.dias <= 2 ? "border-amber-200 bg-amber-50" : "border-primary/20 bg-primary/5"}`}
                  >
                    <span className={`inline-block size-2 rounded-full ${ep.dias <= 2 ? "bg-amber-500" : "bg-primary"}`} />
                    <span className="text-[12px] font-medium">
                      {dataBR(ep.inicio)} → {dataBR(ep.retorno) ?? "em aberto"}
                    </span>
                    <span className="text-muted-foreground ml-auto text-[11px] tabular">{ep.dias} dias · {ep.lancamentos} lançamento{ep.lancamentos !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </RxCard>

          {/* Tabela de lançamentos */}
          <RxCard
            titulo="Todos os lançamentos"
            acao={
              <Button size="sm" variant="outline" onClick={imprimir}>
                <Printer className="size-3.5" />
                Espelho de afastamentos
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Retorno previsto</TableHead>
                    <TableHead className="text-right">Dias</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>eSocial</TableHead>
                    <TableHead className="text-center">Abate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historico.data?.lancamentos.map((item) => (
                    <TableRow key={item.item}>
                      <TableCell className="font-medium">{item.tipo}</TableCell>
                      <TableCell>{dataBR(item.dtini)}</TableCell>
                      <TableCell>{dataBR(item.retorno_previsto)}</TableCell>
                      <TableCell className="text-right tabular">{fmtNum(item.duracao_dias)}</TableCell>
                      <TableCell>{item.documento_tipo ?? "—"}</TableCell>
                      <TableCell><EtiquetaEsocial status={item.status_esocial} /></TableCell>
                      <TableCell className="text-center text-[11px]">
                        {item.abate_temposervico === "S" ? "TS " : ""}
                        {item.abate_tempocontrib === "S" ? "TC " : ""}
                        {item.abate_ferias === "S" ? "Férias " : ""}
                        {item.abate_licencapremio === "S" ? "Prêmio" : ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </RxCard>
        </>
      )}
    </div>
  );
}

function rotuloStatus(status: string): string {
  const map: Record<string, string> = {
    valido: "Válido",
    aguardando: "Aguardando",
    nao_enviado: "Não enviado",
    invalido: "Inválido",
    sem_status: "Sem envio",
  };
  return map[status] ?? status;
}
