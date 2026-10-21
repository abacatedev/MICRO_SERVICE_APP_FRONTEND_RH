"use client";

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { transactions, type TxStatus } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

const statusVariant: Record<TxStatus, "success" | "warning" | "neutral" | "destructive"> = {
  Pago: "success",
  Pendente: "warning",
  Processando: "neutral",
  Reembolsado: "destructive",
};

export function TransactionsTable({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("todos");

  const rows = transactions.filter((tx) => {
    const matchesQuery =
      query.trim().length === 0 ||
      [tx.id, tx.customer, tx.email, tx.channel]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesStatus = status === "todos" || tx.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      {!compact && (
        <div className="flex flex-col gap-2 px-5 pb-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por pedido, cliente ou canal…"
              className="h-8 pl-8 text-[13px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger size="sm" className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Processando">Processando</SelectItem>
                <SelectItem value="Reembolsado">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="size-3.5" />
              Filtros
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Canal</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-5 text-right">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="pl-5 font-medium">{tx.id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full text-[10px] font-semibold">
                    {tx.customer
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="leading-tight">
                    <p>{tx.customer}</p>
                    <p className="text-muted-foreground text-[11px]">{tx.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{tx.channel}</TableCell>
              <TableCell className="text-right font-medium tabular">
                {formatCurrency(tx.value, true)}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[tx.status]}>{tx.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground pr-5 text-right tabular">
                {tx.date}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                Nenhuma transação encontrada para os filtros aplicados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
