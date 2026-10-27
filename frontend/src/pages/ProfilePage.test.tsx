import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import { AppRoutes } from "@/routes/app-routes";
import { ME, UPDATE_ME } from "@/graphql/operations";
import { useAuth } from "@/stores/auth";

const user = { id: "1", name: "Conta teste", email: "conta@teste.com" };
const auth = { token: "t", user };
const meMock = { request: { query: ME }, result: { data: { me: user } } };

describe("ProfilePage", () => {
  it("saves a new name and updates the header", async () => {
    const updated = { ...user, name: "Maria Lima" };
    const updateMock = {
      request: { query: UPDATE_ME, variables: { data: { name: "Maria Lima" } } },
      result: { data: { updateMe: updated } },
    };
    renderWithProviders(<AppRoutes />, { route: "/perfil", auth, mocks: [meMock, updateMock] });
    const input = screen.getByLabelText("Nome completo");
    await userEvent.clear(input);
    await userEvent.type(input, "Maria Lima");
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(await screen.findByText("Perfil atualizado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ML" })).toBeInTheDocument();
    expect(useAuth.getState().user?.name).toBe("Maria Lima");
  });

  it("rejects a blank name", async () => {
    renderWithProviders(<AppRoutes />, { route: "/perfil", auth, mocks: [meMock] });
    const input = screen.getByLabelText("Nome completo");
    await userEvent.clear(input);
    await userEvent.type(input, "   ");
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(await screen.findByText("Nome é obrigatório")).toBeInTheDocument();
    // no mutation mock is registered: a call would surface as an error and change nothing, so the stored name must stay
    expect(useAuth.getState().user?.name).toBe("Conta teste");
  });

  it("keeps the email read-only", () => {
    renderWithProviders(<AppRoutes />, { route: "/perfil", auth, mocks: [meMock] });
    expect(screen.getByLabelText("E-mail")).toBeDisabled();
    expect(screen.getByText("O e-mail não pode ser alterado")).toBeInTheDocument();
  });

  it("logs out", async () => {
    renderWithProviders(<AppRoutes />, { route: "/perfil", auth, mocks: [meMock] });
    await userEvent.click(screen.getByRole("button", { name: "Sair da conta" }));
    await waitFor(() => expect(useAuth.getState().token).toBeNull());
    expect(await screen.findByRole("heading", { name: "Fazer login" })).toBeInTheDocument();
  });
});
