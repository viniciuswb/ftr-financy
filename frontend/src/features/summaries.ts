import type { Category, Transaction } from "@/graphql/types";
import { currentMonthKey, monthKey } from "@/lib/dates";

export interface CategoriesSummary {
  totalCategories: number;
  totalTransactions: number;
  mostUsed: Category | null;
}

export function categoriesSummary(categories: Category[]): CategoriesSummary {
  const totalTransactions = categories.reduce((sum, c) => sum + c.transactionCount, 0);
  const sorted = [...categories].sort(
    (a, b) => b.transactionCount - a.transactionCount || a.title.localeCompare(b.title, "pt-BR"),
  );
  const top = sorted[0];
  return {
    totalCategories: categories.length,
    totalTransactions,
    mostUsed: top && top.transactionCount > 0 ? top : null,
  };
}

export interface DashboardSummary {
  balance: number;
  monthIncome: number;
  monthExpense: number;
}

export function dashboardSummary(transactions: Transaction[], now: Date): DashboardSummary {
  const month = currentMonthKey(now);
  const result = { balance: 0, monthIncome: 0, monthExpense: 0 };
  for (const t of transactions) {
    const signed = t.type === "INCOME" ? t.amount : -t.amount;
    result.balance += signed;
    if (monthKey(t.date) === month) {
      if (t.type === "INCOME") result.monthIncome += t.amount;
      else result.monthExpense += t.amount;
    }
  }
  return result;
}

export function topCategories(categories: Category[], limit = 5): Category[] {
  return [...categories]
    .sort((a, b) => b.transactionCount - a.transactionCount || a.title.localeCompare(b.title, "pt-BR"))
    .slice(0, limit);
}
