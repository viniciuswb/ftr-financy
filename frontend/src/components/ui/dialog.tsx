import type { ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/20" />
        <DialogPrimitive.Content
          aria-describedby={description ? undefined : ""}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] max-w-[448px] -translate-x-1/2 -translate-y-1/2 flex-col gap-6 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <DialogPrimitive.Title className="text-base font-semibold leading-6 text-gray-800">{title}</DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="text-sm leading-5 text-gray-600">{description}</DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close
              aria-label="Fechar"
              className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-brand-base"
            >
              <X className="size-4" aria-hidden />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
