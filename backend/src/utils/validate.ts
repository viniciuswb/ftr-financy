import { badInput } from "../errors.js";

export function requireText(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw badInput(`${field} é obrigatório`);
  return trimmed;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
