import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./pagination";

it("Pagination disables prev on the first page and next on the last", () => {
  const { rerender } = render(<Pagination page={1} pageCount={3} onPageChange={() => {}} />);
  expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Próxima página" })).toBeEnabled();
  rerender(<Pagination page={3} pageCount={3} onPageChange={() => {}} />);
  expect(screen.getByRole("button", { name: "Página anterior" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
});

it("Pagination reports the clicked page", async () => {
  const onPageChange = vi.fn();
  render(<Pagination page={1} pageCount={3} onPageChange={onPageChange} />);
  await userEvent.click(screen.getByRole("button", { name: "2" }));
  expect(onPageChange).toHaveBeenCalledWith(2);
  await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));
  expect(onPageChange).toHaveBeenLastCalledWith(2);
});
