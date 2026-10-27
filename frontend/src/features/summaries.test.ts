import { describe, expect, it } from "vitest";
import { categoriesSummary } from "./summaries";
import type { Category } from "@/graphql/types";

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
