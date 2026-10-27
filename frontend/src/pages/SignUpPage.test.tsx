import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import { REGISTER } from "@/graphql/operations";
import { renderWithProviders } from "@/test/render";
import { useAuth } from "@/stores/auth";
import { AppRoutes } from "@/routes/app-routes";

const user = { __typename: "User", id: "1", name: "Ana Souza", email: "ana@x.com" };
const HELPER = "A senha deve ter no mínimo 8 caracteres";

async function fill(password: string) {
  const u = userEvent.setup();
  await u.type(screen.getByLabelText("Nome completo"), "Ana Souza");
  await u.type(screen.getByLabelText("E-mail"), "ana@x.com");
  await u.type(screen.getByLabelText("Senha"), password);
  await u.click(screen.getByRole("button", { name: "Cadastrar" }));
}

describe("SignUpPage", () => {
  it("shows the password rule as helper text", () => {
    renderWithProviders(<AppRoutes />, { route: "/cadastro" });
    expect(screen.getByText(HELPER)).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).not.toHaveAttribute("aria-invalid");
  });

  it("requires at least 8 characters for the password", async () => {
    renderWithProviders(<AppRoutes />, { route: "/cadastro" });
    await fill("1234567");
    expect(await screen.findByLabelText("Senha")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(HELPER)).toBeInTheDocument();
    expect(useAuth.getState().token).toBeNull();
  });

  it("requires a name", async () => {
    renderWithProviders(<AppRoutes />, { route: "/cadastro" });
    await userEvent.setup().click(screen.getByRole("button", { name: "Cadastrar" }));
    expect(await screen.findByText("Informe seu nome")).toBeInTheDocument();
  });

  it("creates the account and logs in", async () => {
    renderWithProviders(<AppRoutes />, {
      route: "/cadastro",
      mocks: [
        {
          request: { query: REGISTER, variables: { data: { name: "Ana Souza", email: "ana@x.com", password: "12345678" } } },
          result: { data: { register: { __typename: "AuthOutput", token: "tok", user } } },
        },
      ],
    });
    await fill("12345678");
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(useAuth.getState().token).toBe("tok");
    expect(localStorage.getItem("financy.auth")).not.toBeNull();
    expect(await screen.findByText("Conta criada com sucesso!")).toBeInTheDocument();
  });

  it("shows the API message when the e-mail is taken", async () => {
    renderWithProviders(<AppRoutes />, {
      route: "/cadastro",
      mocks: [
        {
          request: { query: REGISTER, variables: { data: { name: "Ana Souza", email: "ana@x.com", password: "12345678" } } },
          result: { errors: [new GraphQLError("E-mail já cadastrado", { extensions: { code: "BAD_USER_INPUT" } })] },
        },
      ],
    });
    await fill("12345678");
    expect(await screen.findByText("E-mail já cadastrado")).toBeInTheDocument();
    expect(useAuth.getState().token).toBeNull();
  });

  it("links back to login", async () => {
    renderWithProviders(<AppRoutes />, { route: "/cadastro" });
    await userEvent.setup().click(screen.getByRole("link", { name: "Fazer login" }));
    expect(await screen.findByRole("heading", { name: "Fazer login" })).toBeInTheDocument();
  });
});
