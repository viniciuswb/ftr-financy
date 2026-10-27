import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import { TransactionModal } from "./TransactionModal";
import { CATEGORIES, CREATE_TRANSACTION, TRANSACTIONS, UPDATE_TRANSACTION } from "@/graphql/operations";
import type { Category, Transaction } from "@/graphql/types";
import { currentMonthKey } from "@/lib/dates";

const food: Category = { id: "c1", title: "Alimentação", description: null, icon: "utensils", color: "blue", transactionCount: 1, totalAmount: 100 };
const salary: Category = { id: "c2", title: "Salário", description: null, icon: "briefcase-business", color: "green", transactionCount: 0, totalAmount: 0 };
const categoriesMock = (categories: Category[]) => ({ request: { query: CATEGORIES }, result: { data: { categories } } });
const transactionsMock = { request: { query: TRANSACTIONS }, result: { data: { transactions: [] } } };

const existing: Transaction = {
  id: "t1", type: "INCOME", description: "Freela", date: "2025-11-30", amount: 250000, categoryId: "c2",
  category: { id: "c2", title: "Salário", icon: "briefcase-business", color: "green" },
};

describe("TransactionModal", () => {
  it("sends cents and the picked day", async () => {
    const day = `${currentMonthKey(new Date())}-15`;
    const created: Transaction = { ...existing, id: "n1", type: "EXPENSE", description: "Jantar", date: day, amount: 8950, categoryId: "c1", category: { id: "c1", title: "Alimentação", icon: "utensils", color: "blue" } };
    const result = vi.fn(() => ({ data: { createTransaction: created } }));
    const create = {
      request: { query: CREATE_TRANSACTION, variables: { data: { type: "EXPENSE", description: "Jantar", date: day, amount: 8950, categoryId: "c1" } } },
      result,
    };
    const onOpenChange = vi.fn();
    renderWithProviders(<TransactionModal open onOpenChange={onOpenChange} />, {
      mocks: [categoriesMock([food, salary]), create, categoriesMock([food, salary]), transactionsMock],
    });
    expect(screen.getByText("Nova transação")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Despesa" })).toBeChecked();
    await userEvent.type(screen.getByLabelText("Descrição"), "Jantar");
    await userEvent.click(screen.getByLabelText("Data"));
    await userEvent.click(await screen.findByRole("button", { name: /\b15\b/ }));
    await userEvent.type(screen.getByLabelText("Valor"), "8950");
    expect(screen.getByLabelText("Valor")).toHaveValue("89,50");
    await userEvent.click(screen.getByRole("combobox", { name: "Categoria" }));
    await userEvent.click(await screen.findByRole("option", { name: "Alimentação" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Transação criada")).toBeInTheDocument();
    expect(result).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("rejects an empty amount", async () => {
    const result = vi.fn(() => ({ data: { createTransaction: existing } }));
    const create = { request: { query: CREATE_TRANSACTION, variables: { data: { type: "EXPENSE", description: "Jantar", date: "2025-11-30", amount: 0, categoryId: "c1" } } }, result };
    renderWithProviders(<TransactionModal open onOpenChange={() => {}} />, { mocks: [categoriesMock([food]), create] });
    await userEvent.type(screen.getByLabelText("Descrição"), "Jantar");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Valor deve ser maior que zero")).toBeInTheDocument();
    expect(screen.getByText("Data é obrigatória")).toBeInTheDocument();
    expect(screen.getByText("Categoria é obrigatória")).toBeInTheDocument();
    expect(result).not.toHaveBeenCalled();
  });

  it("requires a description", async () => {
    renderWithProviders(<TransactionModal open onOpenChange={() => {}} />, { mocks: [categoriesMock([food])] });
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Descrição é obrigatória")).toBeInTheDocument();
  });

  it("disables the category select with a hint when there are no categories", async () => {
    renderWithProviders(<TransactionModal open onOpenChange={() => {}} />, { mocks: [categoriesMock([])] });
    expect(await screen.findByText("Crie uma categoria primeiro")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Categoria" })).toBeDisabled();
  });

  it("edits an existing transaction", async () => {
    const update = {
      request: { query: UPDATE_TRANSACTION, variables: { id: "t1", data: { type: "INCOME", description: "Freela web", date: "2025-11-30", amount: 250000, categoryId: "c2" } } },
      result: { data: { updateTransaction: { ...existing, description: "Freela web" } } },
    };
    renderWithProviders(<TransactionModal open onOpenChange={() => {}} transaction={existing} />, {
      mocks: [categoriesMock([food, salary]), update, categoriesMock([food, salary]), transactionsMock],
    });
    expect(screen.getByText("Editar transação")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Receita" })).toBeChecked();
    expect(screen.getByLabelText("Descrição")).toHaveValue("Freela");
    expect(screen.getByLabelText("Data")).toHaveTextContent("30/11/2025");
    expect(screen.getByLabelText("Valor")).toHaveValue("2.500,00");
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Categoria" })).toHaveTextContent("Salário"));
    const description = screen.getByLabelText("Descrição");
    await userEvent.clear(description);
    await userEvent.type(description, "Freela web");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(await screen.findByText("Transação atualizada")).toBeInTheDocument();
  });
});
