export type TransactionType = "EXPENSE" | "INCOME";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCurrency(cents: number): string {
  return currency.format(cents / 100).replace(/[  ]/g, " ");
}

export function formatSignedAmount(type: TransactionType, cents: number): string {
  return `${type === "INCOME" ? "+" : "-"} ${formatCurrency(cents)}`;
}

export function centsFromDigits(input: string): number {
  const digits = input.replace(/\D/g, "");
  return digits === "" ? 0 : Number(digits);
}
