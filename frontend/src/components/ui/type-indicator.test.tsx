import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TypeIndicator } from "./type-indicator";

it("TypeIndicator labels income and expense", () => {
  const { rerender } = render(<TypeIndicator type="INCOME" />);
  expect(screen.getByText("Entrada")).toBeInTheDocument();
  rerender(<TypeIndicator type="EXPENSE" />);
  expect(screen.getByText("Saída")).toBeInTheDocument();
});
