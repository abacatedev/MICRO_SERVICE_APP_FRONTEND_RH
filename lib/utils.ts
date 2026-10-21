import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const brlPrecise = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number, precise = false) {
  return precise ? brlPrecise.format(value) : brl.format(value);
}

export function formatCompactCurrency(value: number) {
  if (Math.abs(value) >= 1_000_000) return `R$ ${decimal.format(value / 1_000_000)} mi`;
  if (Math.abs(value) >= 1_000) return `R$ ${decimal.format(value / 1_000)} mil`;
  return brl.format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatPercent(value: number, withSign = false) {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${decimal.format(value)}%`;
}
