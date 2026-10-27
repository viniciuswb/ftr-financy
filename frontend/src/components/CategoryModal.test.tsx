import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import { CategoryModal } from "./CategoryModal";
import { CATEGORIES, CREATE_CATEGORY, TRANSACTIONS, UPDATE_CATEGORY } from "@/graphql/operations";
import type { Category } from "@/graphql/types";

const existing: Category = {
  id: "c1", title: "Mercado", description: "Compras", icon: "shopping-cart", color: "orange", transactionCount: 3, totalAmount: 1000,
};
const refetchMocks = [
  { request: { query: CATEGORIES }, result: { data: { categories: [] } } },
  { request: { query: TRANSACTIONS }, result: { data: { transactions: [] } } },
];

describe("CategoryModal", () => {
  it("creates a category with the chosen icon and color", async () => {
    const created = { ...existing, id: "n1", title: "Carro", description: null, icon: "car-front", color: "purple", transactionCount: 0, totalAmount: 0 };
    const create = {
      request: { query: CREATE_CATEGORY, variables: { data: { title: "Carro", icon: "car-front", color: "purple" } } },
      result: { data: { createCategory: created } },
    };
    renderWithProviders(<CategoryModal open onOpenChange={() => {}} />, { mocks: [create, ...refetchMocks] });
    expect(screen.getByText("Nova categoria")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Título"), "Carro");
    await userEvent.click(screen.getByRole("radio", { name: "car-front" }));
    await userEvent.click(screen.getByRole("radio", { name: "purple" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Categoria criada")).toBeInTheDocument();
  });

  it("requires a title", async () => {
    const result = vi.fn(() => ({ data: { createCategory: existing } }));
    const create = { request: { query: CREATE_CATEGORY, variables: { data: { title: "", icon: "briefcase-business", color: "green" } } }, result };
    renderWithProviders(<CategoryModal open onOpenChange={() => {}} />, { mocks: [create] });
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Título é obrigatório")).toBeInTheDocument();
    expect(result).not.toHaveBeenCalled();
  });

  it("pre-fills the form when editing and sends only the edit", async () => {
    const update = {
      request: { query: UPDATE_CATEGORY, variables: { id: "c1", data: { title: "Supermercado", description: "Compras", icon: "shopping-cart", color: "orange" } } },
      result: { data: { updateCategory: { ...existing, title: "Supermercado" } } },
    };
    renderWithProviders(<CategoryModal open onOpenChange={() => {}} category={existing} />, { mocks: [update, ...refetchMocks] });
    expect(screen.getByText("Editar categoria")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("Mercado");
    expect(screen.getByLabelText("Descrição")).toHaveValue("Compras");
    expect(screen.getByRole("radio", { name: "shopping-cart" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "orange" })).toBeChecked();
    const title = screen.getByLabelText("Título");
    await userEvent.clear(title);
    await userEvent.type(title, "Supermercado");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Categoria atualizada")).toBeInTheDocument();
  });
});
