import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "./date-picker";

it("DatePicker emits the clicked day as YYYY-MM-DD", async () => {
  const onChange = vi.fn();
  render(<DatePicker value="2025-11-01" onChange={onChange} />);
  await userEvent.click(screen.getByRole("button", { name: /01\/11\/2025/ }));
  await userEvent.click(await screen.findByRole("button", { name: /30/ }));
  expect(onChange).toHaveBeenCalledWith("2025-11-30");
});

it("DatePicker shows the placeholder when empty", () => {
  render(<DatePicker value={null} onChange={() => {}} />);
  expect(screen.getByText("Selecione")).toBeInTheDocument();
});
