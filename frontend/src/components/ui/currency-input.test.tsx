import { expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrencyInput } from "./currency-input";

function Controlled({ initial, onChange }: { initial: number; onChange: (c: number) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <CurrencyInput
      value={value}
      onChange={(c) => {
        setValue(c);
        onChange(c);
      }}
    />
  );
}

it("CurrencyInput turns typed digits into cents", async () => {
  const onChange = vi.fn();
  render(<Controlled initial={0} onChange={onChange} />);
  await userEvent.type(screen.getByRole("textbox"), "8950");
  expect(onChange).toHaveBeenLastCalledWith(8950);
  expect(screen.getByRole("textbox")).toHaveValue("89,50");
  expect(screen.getByText("R$")).toBeInTheDocument();
});

it("CurrencyInput ignores letters and treats empty as zero", async () => {
  const onChange = vi.fn();
  render(<Controlled initial={0} onChange={onChange} />);
  await userEvent.type(screen.getByRole("textbox"), "ab");
  expect(onChange).toHaveBeenLastCalledWith(0);
  await userEvent.type(screen.getByRole("textbox"), "12");
  await userEvent.clear(screen.getByRole("textbox"));
  expect(onChange).toHaveBeenLastCalledWith(0);
  for (const call of onChange.mock.calls) expect(Number.isNaN(call[0])).toBe(false);
});

it("CurrencyInput treats a pasted formatted value as digits", async () => {
  const onChange = vi.fn();
  render(<Controlled initial={0} onChange={onChange} />);
  await userEvent.click(screen.getByRole("textbox"));
  await userEvent.paste("1.234,56");
  expect(onChange).toHaveBeenLastCalledWith(123456);
  expect(screen.getByRole("textbox")).toHaveValue("1.234,56");
});
