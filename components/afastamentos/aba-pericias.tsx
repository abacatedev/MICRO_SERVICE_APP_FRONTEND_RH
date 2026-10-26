"use client";

import { RxCard } from "@/components/raio-x/rx-card";
import { PERICIAS_FIXTURE } from "@/lib/afastamentos/futuro";
import { fmtNum } from "@/lib/afastamentos/formato";
import { Cartao, TabelaVazia } from "./ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AbaPericias() {
  const f = PERICIAS_FIXTURE;
  return (
    <div className="flex flex-col gap-4">
      <div className="border-border bg-card rounded-[10px] border border-dashed px-4 py-3">
        <p className="text-warning text-[12px] font-semibold">Visão futura: valores ilustrativos</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Cartao titulo="Aguardando agendamento" valor={f.aguardando_agendamento} />
        <Cartao titulo="Agendadas em 7 dias" valor={f.agendadas_7_dias} />
        <Cartao titulo="Não compareceram" valor={f.nao_compareceram} />
        <Cartao titulo="A vencer" valor={f.a_vencer} />
      </div>

      <RxCard titulo="Agenda" subtitulo="Próximos agendamentos">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Servidor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {f.agenda.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.data}</TableCell>
                  <TableCell>{item.servidor}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </RxCard>

      <RxCard titulo="Por status" subtitulo="Distribuição dos agendamentos">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {f.por_status.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.status}</TableCell>
                  <TableCell className="text-right tabular">{fmtNum(item.quantidade)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </RxCard>

      <RxCard titulo="A vencer" subtitulo="Afastamentos de saúde com mais de 15 dias sem perícia">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>REGISTRO</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Dias</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {f.a_vencer_lista.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-[11.5px]">{item.registro}</TableCell>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell className="text-right tabular">{fmtNum(item.dias)}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </RxCard>
    </div>
  );
}
