import type { Category } from "@/graphql/types";

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
