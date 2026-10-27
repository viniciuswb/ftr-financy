import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import { AppRoutes } from "@/routes/app-routes";
import { CATEGORIES, ME, TRANSACTIONS } from "@/graphql/operations";
import type { Category, Transaction } from "@/graphql/types";
import { currentMonthKey } from "@/lib/dates";

const user = { id: "1", name: "Conta teste", email: "conta@teste.com" };
const auth = { token: "t", user };
const meMock = { request: { query: ME }, result: { data: { me: user } } };

function cat(id: string, title: string, transactionCount: number, totalAmount: number): Category {
  return { id, title, description: null, icon: "utensils", color: "blue", transactionCount, totalAmount };
}
const food = cat("c1", "Alimentação", 12, 54230);
const thisMonth = currentMonthKey(new Date());

function tx(id: number, overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: `t${id}`, type: "EXPENSE", description: `Compra ${id}`, date: `${thisMonth}-${String(id).padStart(2, "0")}`,
    amount: 10000, categoryId: "c1", category: { id: "c1", title: "Alimentação", icon: "utensils", color: "blue" }, ...overrides,
  };
}

function renderPage(transactions: Transaction[], categories: Category[]) {
  return renderWithProviders(<AppRoutes />, {
    route: "/",
    auth,
    mocks: [
      meMock,
      { request: { query: TRANSACTIONS }, result: { data: { transactions } } },
      { request: { query: CATEGORIES }, result: { data: { categories } } },
    ],
  });
}

describe("DashboardPage", () => {
  it("shows the 5 newest transactions, the summaries and the top categories", async () => {
    const list = [
      tx(7, { description: "Salário", type: "INCOME", amount: 425000 }),
      tx(6), tx(5), tx(4), tx(3), tx(2),
    ];
    renderPage(list, [food, cat("c2", "Transporte", 1, 100)]);
    expect(await screen.findByText("Salário")).toBeInTheDocument();
    expect(screen.queryByText("Compra 2")).not.toBeInTheDocument();
    expect(screen.getByText("+ R$ 4.250,00")).toBeInTheDocument();
    expect(screen.getAllByText("- R$ 100,00")).toHaveLength(4);
    // balance = 4250 - 5*100 = 3750; month income = 4250; month expense = 500
    expect(screen.getByText("R$ 3.750,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 4.250,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 500,00")).toBeInTheDocument();
    const section = screen.getByRole("region", { name: "Categorias" });
    expect(within(section).getByText("12 itens")).toBeInTheDocument();
    expect(within(section).getByText("R$ 542,30")).toBeInTheDocument();
    expect(within(section).getByText("1 item")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/transacoes");
    expect(screen.getByRole("link", { name: "Gerenciar" })).toHaveAttribute("href", "/categorias");
  });

  it("formats a negative balance with a leading minus", async () => {
    renderPage([tx(1, { amount: 5000 })], [food]);
    expect(await screen.findByText("-R$ 50,00")).toBeInTheDocument();
  });

  it("shows empty states", async () => {
    renderPage([], []);
    expect(await screen.findByText("Nenhuma transação ainda")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma categoria ainda")).toBeInTheDocument();
  });

  it("opens the new transaction modal", async () => {
    renderPage([tx(1)], [food]);
    await userEvent.click(await screen.findByRole("button", { name: /Nova transação/ }));
    expect(await screen.findByRole("dialog", { name: "Nova transação" })).toBeInTheDocument();
  });
});
