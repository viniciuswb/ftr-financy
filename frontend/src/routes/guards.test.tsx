import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { AppRoutes } from "./app-routes";

const auth = { token: "t", user: { id: "1", name: "Ana Souza", email: "ana@x.com" } };

describe("route guards", () => {
  it("shows Login at / when logged out", () => {
    renderWithProviders(<AppRoutes />, { route: "/" });
    expect(screen.getByRole("heading", { name: "Fazer login" })).toBeInTheDocument();
  });

  it("shows the Dashboard at / when logged in", () => {
    renderWithProviders(<AppRoutes />, { route: "/", auth });
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("redirects protected pages to / when logged out", () => {
    renderWithProviders(<AppRoutes />, { route: "/transacoes" });
    expect(screen.getByRole("heading", { name: "Fazer login" })).toBeInTheDocument();
  });

  it("lets a logged-in user into protected pages", () => {
    renderWithProviders(<AppRoutes />, { route: "/categorias", auth });
    expect(screen.getByRole("heading", { name: "Categorias" })).toBeInTheDocument();
  });

  it("redirects /cadastro to / when logged in", () => {
    renderWithProviders(<AppRoutes />, { route: "/cadastro", auth });
    expect(screen.queryByRole("heading", { name: "Criar conta" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("shows sign-up at /cadastro when logged out", () => {
    renderWithProviders(<AppRoutes />, { route: "/cadastro" });
    expect(screen.getByRole("heading", { name: "Criar conta" })).toBeInTheDocument();
  });

  it("sends unknown paths to /", () => {
    renderWithProviders(<AppRoutes />, { route: "/nada-aqui" });
    expect(screen.getByRole("heading", { name: "Fazer login" })).toBeInTheDocument();
  });
});
