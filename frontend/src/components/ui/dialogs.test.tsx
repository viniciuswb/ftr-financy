import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./dialog";
import { ConfirmDialog } from "./alert-dialog";
import { Select } from "./select";
import { Button } from "./button";

it("Dialog renders title and closes via the X", async () => {
  const onOpenChange = vi.fn();
  render(
    <Dialog open onOpenChange={onOpenChange} title="Nova transação" description="Registre">
      <p>conteúdo</p>
    </Dialog>,
  );
  expect(screen.getByRole("dialog", { name: "Nova transação" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

it("ConfirmDialog confirms", async () => {
  const onConfirm = vi.fn();
  render(
    <ConfirmDialog open onOpenChange={() => {}} title="Excluir?" description="Não dá para desfazer" confirmLabel="Excluir" onConfirm={onConfirm} />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Excluir" }));
  expect(onConfirm).toHaveBeenCalled();
});

it("Select shows the placeholder and reports a chosen option", async () => {
  const onValueChange = vi.fn();
  render(
    <Select
      placeholder="Selecione"
      value=""
      onValueChange={onValueChange}
      options={[{ value: "a", label: "Opção A" }, { value: "b", label: "Opção B" }]}
    />,
  );
  expect(screen.getByText("Selecione")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("combobox"));
  await userEvent.click(await screen.findByRole("option", { name: "Opção B" }));
  expect(onValueChange).toHaveBeenCalledWith("b");
});

it("Button is disabled when asked", () => {
  render(<Button disabled>Salvar</Button>);
  expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
});
