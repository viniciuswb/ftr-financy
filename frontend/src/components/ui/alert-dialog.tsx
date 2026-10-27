import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm }: ConfirmDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/20" />
        <AlertDialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-32px)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-1">
            <AlertDialogPrimitive.Title className="text-base font-semibold leading-6 text-gray-800">{title}</AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-sm leading-5 text-gray-600">{description}</AlertDialogPrimitive.Description>
          </div>
          <div className="flex justify-end gap-3">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" size="sm">Cancelar</Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button size="sm" onClick={onConfirm}>{confirmLabel}</Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
