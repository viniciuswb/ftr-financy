import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "./input";

it("Input shows the error message and marks the field invalid", () => {
  render(<Input label="E-mail" error="E-mail inválido" />);
  expect(screen.getByText("E-mail inválido")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "E-mail" })).toHaveAttribute("aria-invalid", "true");
});

it("Input shows helper text when there is no error", () => {
  render(<Input label="Senha" helper="Mínimo de 8 caracteres" />);
  expect(screen.getByText("Mínimo de 8 caracteres")).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Senha" })).not.toHaveAttribute("aria-invalid", "true");
});
