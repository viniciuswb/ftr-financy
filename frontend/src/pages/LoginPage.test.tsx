import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import { toast } from "sonner";
import { LOGIN } from "@/graphql/operations";
import { renderWithProviders } from "@/test/render";
import { useAuth } from "@/stores/auth";
import { AppRoutes } from "@/routes/app-routes";

const user = { __typename: "User", id: "1", name: "Ana Souza", email: "ana@x.com" };

function loginMock(result: object) {
  return {
    request: { query: LOGIN, variables: { data: { email: "ana@x.com", password: "12345678" } } },
    ...result,
  };
}

async function fillAndSubmit(email = "ana@x.com", password = "12345678") {
  const u = userEvent.setup();
  await u.type(screen.getByLabelText("E-mail"), email);
  await u.type(screen.getByLabelText("Senha"), password);
  await u.click(screen.getByRole("button", { name: "Entrar" }));
  return u;
}

describe("LoginPage", () => {
  it("validates email format before calling the API", async () => {
    const resultFn = vi.fn(() => ({ data: { login: { __typename: "AuthOutput", token: "t", user } } }));
    renderWithProviders(<AppRoutes />, { mocks: [{ ...loginMock({ result: resultFn }) }] });
    await fillAndSubmit("abc");
    expect(await screen.findByText("E-mail inválido")).toBeInTheDocument();
    expect(resultFn).not.toHaveBeenCalled();
  });

  it("requires a password", async () => {
    renderWithProviders(<AppRoutes />);
    const u = userEvent.setup();
    await u.type(screen.getByLabelText("E-mail"), "ana@x.com");
    await u.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Informe sua senha")).toBeInTheDocument();
  });

  it("logs in and stores the session", async () => {
    renderWithProviders(<AppRoutes />, {
      mocks: [loginMock({ result: { data: { login: { __typename: "AuthOutput", token: "tok", user } } } })],
    });
    const u = await fillAndSubmit();
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(useAuth.getState().token).toBe("tok");
    // not remembered: tab-only storage
    expect(sessionStorage.getItem("financy.auth")).not.toBeNull();
    expect(localStorage.getItem("financy.auth")).toBeNull();
    void u;
  });

  it("remembers the session when 'Lembrar-me' is checked", async () => {
    renderWithProviders(<AppRoutes />, {
      mocks: [loginMock({ result: { data: { login: { __typename: "AuthOutput", token: "tok", user } } } })],
    });
    const u = userEvent.setup();
    await u.type(screen.getByLabelText("E-mail"), "ana@x.com");
    await u.type(screen.getByLabelText("Senha"), "12345678");
    await u.click(screen.getByRole("checkbox", { name: "Lembrar-me" }));
    await u.click(screen.getByRole("button", { name: "Entrar" }));
    await screen.findByRole("heading", { name: "Dashboard" });
    expect(localStorage.getItem("financy.auth")).not.toBeNull();
    expect(sessionStorage.getItem("financy.auth")).toBeNull();
  });

  it("shows the API message on wrong password and does not expire the session", async () => {
    renderWithProviders(<AppRoutes />, {
      mocks: [
        loginMock({
          result: {
            errors: [new GraphQLError("E-mail ou senha inválidos", { extensions: { code: "BAD_USER_INPUT" } })],
          },
        }),
      ],
    });
    await fillAndSubmit();
    expect(await screen.findByText("E-mail ou senha inválidos")).toBeInTheDocument();
    expect(screen.queryByText("Sessão expirada")).not.toBeInTheDocument();
    expect(useAuth.getState().token).toBeNull();
    expect(screen.getByRole("heading", { name: "Fazer login" })).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    renderWithProviders(<AppRoutes />);
    const u = userEvent.setup();
    const field = screen.getByLabelText("Senha");
    expect(field).toHaveAttribute("type", "password");
    await u.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(field).toHaveAttribute("type", "text");
    await u.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(field).toHaveAttribute("type", "password");
  });

  it("shows an info toast for 'Recuperar senha'", async () => {
    const info = vi.spyOn(toast, "info");
    renderWithProviders(<AppRoutes />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Recuperar senha" }));
    expect(info).toHaveBeenCalledWith("Funcionalidade em breve");
  });

  it("links to the sign-up page", async () => {
    renderWithProviders(<AppRoutes />);
    await userEvent.setup().click(screen.getByRole("link", { name: "Criar conta" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Criar conta" })).toBeInTheDocument());
  });
});
