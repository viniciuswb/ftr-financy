import { describe, expect, it } from "vitest";
import type { Transaction } from "@/graphql/types";
import { filterTransactions, paginate, periodOptions, type TransactionFilters } from "./transactions";

let n = 0;
function tx(overrides: Partial<Transaction> = {}): Transaction {
  n += 1;
  return {
    id: `t${n}`, type: "EXPENSE", description: "Item", date: "2025-11-10", amount: 100, categoryId: "c1",
    category: { id: "c1", title: "Mercado", icon: "shopping-cart", color: "orange" }, ...overrides,
  };
}
const d = (t: Transaction) => t.description;
const ALL: TransactionFilters = { search: "", type: "ALL", categoryId: "ALL", period: "ALL" };
const range = (len: number) => Array.from({ length: len }, (_, i) => i);

describe("filterTransactions", () => {
  it("search ignores case and accents", () => {
    const list = [tx({ description: "Consulta Saúde" }), tx({ description: "Salário" })];
    expect(filterTransactions(list, { ...ALL, search: "saude" }).map(d)).toEqual(["Consulta Saúde"]);
    expect(filterTransactions(list, { ...ALL, search: "SALÁRIO" }).map(d)).toEqual(["Salário"]);
    expect(filterTransactions(list, { ...ALL, search: "salario" }).map(d)).toEqual(["Salário"]);
  });

  it("combines type, category and period", () => {
    const list = [
      tx({ description: "a", type: "INCOME", categoryId: "c2", date: "2025-11-02" }),
      tx({ description: "b", type: "EXPENSE", categoryId: "c2", date: "2025-11-03" }),
      tx({ description: "c", type: "INCOME", categoryId: "c1", date: "2025-11-04" }),
      tx({ description: "d", type: "INCOME", categoryId: "c2", date: "2025-10-04" }),
    ];
    expect(filterTransactions(list, { ...ALL, type: "INCOME", categoryId: "c2", period: "2025-11" }).map(d)).toEqual(["a"]);
    expect(filterTransactions(list, { ...ALL, type: "INCOME" }).map(d)).toEqual(["a", "c", "d"]);
    expect(filterTransactions(list, ALL).map(d)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("periodOptions", () => {
  it("lists all periods first, then current month, then months with data", () => {
    expect(periodOptions([tx({ date: "2025-11-30" }), tx({ date: "2026-10-02" })], new Date(2026, 9, 26)).map((o) => o.value))
      .toEqual(["ALL", "2026-10", "2025-11"]);
  });

  it("keeps the current month without data, sorts newest first, no duplicates, with labels", () => {
    const list = [tx({ date: "2025-01-05" }), tx({ date: "2025-11-30" }), tx({ date: "2025-11-02" })];
    expect(periodOptions(list, new Date(2026, 9, 26))).toEqual([
      { value: "ALL", label: "Todos os períodos" },
      { value: "2026-10", label: "Outubro / 2026" },
      { value: "2025-11", label: "Novembro / 2025" },
      { value: "2025-01", label: "Janeiro / 2025" },
    ]);
  });
});

describe("paginate", () => {
  it("paginates 10 per page with a footer range", () => {
    expect(paginate(range(27), 3)).toMatchObject({ page: 3, pageCount: 3, total: 27, from: 21, to: 27 });
    expect(paginate(range(27), 1).items).toHaveLength(10);
  });

  it("clamps to the last page when rows disappear", () => {
    expect(paginate(range(20), 3)).toMatchObject({ page: 2, from: 11, to: 20 });
    expect(paginate([], 4)).toMatchObject({ page: 1, pageCount: 1, from: 0, to: 0 });
    expect(paginate(range(5), 0)).toMatchObject({ page: 1, from: 1, to: 5 });
  });
});
