import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { AppRoutes } from "@/routes/app-routes";
import { ME } from "@/graphql/operations";

const user = { id: "1", name: "Conta teste", email: "conta@teste.com" };
const auth = { token: "t", user };
const meMock = { request: { query: ME }, result: { data: { me: user } } };

describe("AppHeader", () => {
  it("highlights the current page in the nav", () => {
    renderWithProviders(<AppRoutes />, { route: "/categorias", auth, mocks: [meMock] });
    expect(screen.getByRole("link", { name: "Categorias" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("shows the user's initials linking to the profile", () => {
    renderWithProviders(<AppRoutes />, { route: "/", auth, mocks: [meMock] });
    expect(screen.getByRole("link", { name: "CT" })).toHaveAttribute("href", "/perfil");
  });

  it("refreshes the stored user from me", async () => {
    const fresh = { id: "1", name: "Maria Lima", email: "conta@teste.com" };
    renderWithProviders(<AppRoutes />, {
      route: "/",
      auth,
      mocks: [{ request: { query: ME }, result: { data: { me: fresh } } }],
    });
    expect(await screen.findByRole("link", { name: "ML" })).toBeInTheDocument();
  });
});
