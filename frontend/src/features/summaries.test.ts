import { describe, expect, it } from "vitest";
import { categoriesSummary, dashboardSummary, topCategories } from "./summaries";
import { formatCurrency } from "@/lib/money";
import type { Category, Transaction } from "@/graphql/types";

function cat(overrides: Partial<Category> = {}): Category {
  return { id: "1", title: "Cat", description: null, icon: "utensils", color: "green", transactionCount: 0, totalAmount: 0, ...overrides };
}

describe("categoriesSummary", () => {
  it("totals categories and transactions and finds the most used", () => {
    expect(
      categoriesSummary([cat({ title: "Mercado", transactionCount: 3 }), cat({ title: "Alimentação", transactionCount: 12 })]),
    ).toMatchObject({ totalCategories: 2, totalTransactions: 15, mostUsed: { title: "Alimentação" } });
  });

  it("has no most used category when empty or all counts are zero", () => {
    expect(categoriesSummary([]).mostUsed).toBeNull();
    expect(categoriesSummary([cat({ transactionCount: 0 })]).mostUsed).toBeNull();
  });

  it("breaks ties by title with pt-BR collation", () => {
    const result = categoriesSummary([
      cat({ id: "1", title: "Saúde", transactionCount: 4 }),
      cat({ id: "2", title: "Álcool", transactionCount: 4 }),
      cat({ id: "3", title: "Zebra", transactionCount: 4 }),
    ]);
    expect(result.mostUsed?.title).toBe("Álcool");
  });
});

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "t", type: "EXPENSE", description: "x", date: "2026-10-01", amount: 100, categoryId: "1",
    category: { id: "1", title: "Cat", icon: "utensils", color: "green" }, ...overrides,
  };
}

describe("dashboardSummary", () => {
  it("sums the balance over all time and the month figures over the current month", () => {
    const list = [
      tx({ type: "INCOME", amount: 425000, date: "2026-10-01" }),
      tx({ type: "EXPENSE", amount: 8950, date: "2026-10-20" }),
      tx({ type: "EXPENSE", amount: 10000, date: "2026-09-30" }),
    ];
    expect(dashboardSummary(list, new Date(2026, 9, 26))).toEqual({ balance: 406050, monthIncome: 425000, monthExpense: 8950 });
  });

  it("allows a negative balance", () => {
    const result = dashboardSummary([tx({ amount: 5000 }), tx({ amount: 2500 })], new Date(2026, 9, 26));
    expect(result.balance).toBe(-7500);
    expect(formatCurrency(result.balance)).toBe("-R$ 75,00");
  });
});

describe("topCategories", () => {
  it("picks the five most used categories ordered by count then title", () => {
    const list = [
      cat({ id: "1", title: "Zeta", transactionCount: 2 }),
      cat({ id: "2", title: "Beta", transactionCount: 2 }),
      cat({ id: "3", title: "Alfa", transactionCount: 9 }),
      cat({ id: "4", title: "Delta", transactionCount: 1 }),
      cat({ id: "5", title: "Épsilon", transactionCount: 5 }),
      cat({ id: "6", title: "Gama", transactionCount: 0 }),
    ];
    expect(topCategories(list).map((c) => c.title)).toEqual(["Alfa", "Épsilon", "Beta", "Zeta", "Delta"]);
    expect(topCategories(list, 2)).toHaveLength(2);
  });
});
