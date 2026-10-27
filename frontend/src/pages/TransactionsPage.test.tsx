import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import { AppRoutes } from "@/routes/app-routes";
import { CATEGORIES, DELETE_TRANSACTION, ME, TRANSACTIONS } from "@/graphql/operations";
import type { Category, Transaction } from "@/graphql/types";
import { currentMonthKey } from "@/lib/dates";

const user = { id: "1", name: "Conta teste", email: "conta@teste.com" };
const auth = { token: "t", user };
const meMock = { request: { query: ME }, result: { data: { me: user } } };

const food: Category = { id: "c1", title: "Alimentação", description: null, icon: "utensils", color: "blue", transactionCount: 0, totalAmount: 0 };
const health: Category = { id: "c2", title: "Saúde", description: null, icon: "heart-pulse", color: "red", transactionCount: 0, totalAmount: 0 };
const categoriesMock = { request: { query: CATEGORIES }, result: { data: { categories: [food, health] } } };
const transactionsMock = (transactions: Transaction[]) => ({ request: { query: TRANSACTIONS }, result: { data: { transactions } } });

const thisMonth = currentMonthKey(new Date());
function tx(id: number, overrides: Partial<Transaction> = {}): Transaction {
  const category = overrides.categoryId === "c2" ? health : food;
  return {
    id: `t${id}`, type: "EXPENSE", description: `Compra ${id}`, date: `${thisMonth}-${String(id).padStart(2, "0")}`,
    amount: 1000 + id, categoryId: category.id, category: { id: category.id, title: category.title, icon: category.icon, color: category.color },
    ...overrides,
  };
}
const monthOf = (n: number) => Array.from({ length: n }, (_, i) => tx(i + 1));
const old = tx(20, { description: "Antiga", date: "2020-03-05" });

function renderPage(transactions: Transaction[], extra: ReturnType<typeof transactionsMock>[] = []) {
  return renderWithProviders(<AppRoutes />, {
    route: "/transacoes",
    auth,
    mocks: [meMock, categoriesMock, transactionsMock(transactions), ...extra],
  });
}

async function choose(label: string, option: string) {
  await userEvent.click(screen.getByRole("combobox", { name: label }));
  await userEvent.click(await screen.findByRole("option", { name: option }));
}

describe("TransactionsPage", () => {
  it("lists the current month by default with a footer range", async () => {
    renderPage([...monthOf(12), old]);
    expect(await screen.findByText("Compra 1")).toBeInTheDocument();
    expect(screen.queryByText("Antiga")).not.toBeInTheDocument();
    expect(screen.getByText("1 a 10 | 12 resultados")).toBeInTheDocument();
    expect(screen.getByText("- R$ 10,01")).toBeInTheDocument();
  });

  it("filters by 'Todos os períodos' to list everything", async () => {
    renderPage([...monthOf(5), old]);
    await screen.findByText("Compra 1");
    await choose("Período", "Todos os períodos");
    expect(await screen.findByText("Antiga")).toBeInTheDocument();
    expect(screen.getByText("1 a 6 | 6 resultados")).toBeInTheDocument();
  });

  it("searches ignoring case and accents, and filters by type and category", async () => {
    const list = [
      tx(1, { description: "Consulta Saúde", categoryId: "c2" }),
      tx(2, { description: "Salário", type: "INCOME" }),
      tx(3, { description: "Pizza" }),
    ];
    renderPage(list);
    await screen.findByText("Pizza");
    await userEvent.type(screen.getByLabelText("Buscar"), "SAUDE");
    expect(screen.getByText("Consulta Saúde")).toBeInTheDocument();
    expect(screen.queryByText("Pizza")).not.toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("Buscar"));
    await userEvent.type(screen.getByLabelText("Buscar"), "salário");
    expect(screen.getByText("Salário")).toBeInTheDocument();
    expect(screen.queryByText("Consulta Saúde")).not.toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("Buscar"));
    await choose("Tipo", "Entrada");
    expect(screen.getByText("1 a 1 | 1 resultados")).toBeInTheDocument();
    await choose("Tipo", "Todos");
    await choose("Categoria", "Saúde");
    expect(screen.getByText("Consulta Saúde")).toBeInTheDocument();
    expect(screen.queryByText("Pizza")).not.toBeInTheDocument();
  });

  it("shows an empty state", async () => {
    renderPage([]);
    expect(await screen.findByText("Nenhuma transação encontrada")).toBeInTheDocument();
    expect(screen.getByText("0 a 0 | 0 resultados")).toBeInTheDocument();
  });

  it("returns to page 1 when a filter changes", async () => {
    renderPage(monthOf(12));
    await screen.findByText("Compra 1");
    await userEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("11 a 12 | 12 resultados")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Buscar"), "Compra");
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("1 a 10 | 12 resultados")).toBeInTheDocument();
  });

  it("shows the previous page after deleting the only row of the last page", async () => {
    const del = { request: { query: DELETE_TRANSACTION, variables: { id: "t11" } }, result: { data: { deleteTransaction: true } } };
    const afterDelete = [categoriesMock, transactionsMock(monthOf(10))] as never[];
    renderPage(monthOf(11), [del as never, ...afterDelete]);
    await screen.findByText("Compra 1");
    await userEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByText("11 a 11 | 11 resultados")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Excluir Compra 11" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Excluir transação?")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Excluir" }));
    expect(await screen.findByText("Transação excluída")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("1 a 10 | 10 resultados")).toBeInTheDocument());
    expect(screen.getByText("Compra 1")).toBeInTheDocument();
  });

  it("opens the modal to create and to edit", async () => {
    renderPage(monthOf(2));
    await screen.findByText("Compra 1");
    await userEvent.click(screen.getByRole("button", { name: "Nova transação" }));
    expect(await screen.findByText("Registre sua despesa ou receita")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    await userEvent.click(screen.getByRole("button", { name: "Editar Compra 2" }));
    expect(await screen.findByText("Editar transação")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toHaveValue("Compra 2");
  });
});
