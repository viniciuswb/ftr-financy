import { badInput } from "../errors.js";

export function requireText(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw badInput(`${field} é obrigatório`);
  return trimmed;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  // The round trip rejects impossible days like 2025-02-30, which Date would roll over.
  if (!DATE_PATTERN.test(value) || Number.isNaN(date.getTime()) || formatDate(date) !== value) {
    throw badInput("Data inválida");
  }
  return date;
}

export function requirePositiveAmount(amount: number): number {
  if (amount <= 0) throw badInput("Valor deve ser maior que zero");
  return amount;
}
