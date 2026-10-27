import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import { AppRoutes } from "@/routes/app-routes";
import { CATEGORIES, DELETE_CATEGORY, ME, TRANSACTIONS } from "@/graphql/operations";
import type { Category } from "@/graphql/types";

const user = { id: "1", name: "Conta teste", email: "conta@teste.com" };
const auth = { token: "t", user };
const meMock = { request: { query: ME }, result: { data: { me: user } } };

function cat(overrides: Partial<Category>): Category {
  return { id: "1", title: "Alimentação", description: "Restaurantes", icon: "utensils", color: "blue", transactionCount: 12, totalAmount: 100, ...overrides };
}
const categoriesMock = (categories: Category[]) => ({ request: { query: CATEGORIES }, result: { data: { categories } } });

describe("CategoriesPage", () => {
  it("shows the summary and one card per category", async () => {
    const list = [cat({}), cat({ id: "2", title: "Mercado", description: null, transactionCount: 3 })];
    renderWithProviders(<AppRoutes />, { route: "/categorias", auth, mocks: [meMock, categoriesMock(list)] });
    expect(await screen.findByText("12 itens")).toBeInTheDocument();
    expect(screen.getByText("3 itens")).toBeInTheDocument();
    expect(screen.getByText("total de categorias")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("categoria mais utilizada")).toBeInTheDocument();
  });

  it("shows singular item count", async () => {
    renderWithProviders(<AppRoutes />, { route: "/categorias", auth, mocks: [meMock, categoriesMock([cat({ transactionCount: 1 })])] });
    expect(await screen.findByText("1 item")).toBeInTheDocument();
  });

  it("warns how many transactions a delete removes, then deletes", async () => {
    const del = { request: { query: DELETE_CATEGORY, variables: { id: "1" } }, result: { data: { deleteCategory: true } } };
    renderWithProviders(<AppRoutes />, {
      route: "/categorias",
      auth,
      mocks: [
        meMock,
        categoriesMock([cat({})]),
        del,
        categoriesMock([]),
        { request: { query: TRANSACTIONS }, result: { data: { transactions: [] } } },
      ],
    });
    await userEvent.click(await screen.findByRole("button", { name: "Excluir Alimentação" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Esta categoria e suas 12 transações serão excluídas.")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Excluir" }));
    expect(await screen.findByText("Categoria excluída")).toBeInTheDocument();
  });

  it("uses the no-transactions wording when the category is empty", async () => {
    renderWithProviders(<AppRoutes />, { route: "/categorias", auth, mocks: [meMock, categoriesMock([cat({ transactionCount: 0 })])] });
    await userEvent.click(await screen.findByRole("button", { name: "Excluir Alimentação" }));
    expect(await screen.findByText("Esta categoria será excluída.")).toBeInTheDocument();
  });

  it("opens the modal from Nova categoria", async () => {
    renderWithProviders(<AppRoutes />, { route: "/categorias", auth, mocks: [meMock, categoriesMock([])] });
    await userEvent.click(await screen.findByRole("button", { name: "Nova categoria" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
