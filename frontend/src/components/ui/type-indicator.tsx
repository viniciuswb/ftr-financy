import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import type { TransactionType } from "@/lib/money";
import { cn } from "@/lib/utils";

export function TypeIndicator({ type, className }: { type: TransactionType; className?: string }) {
  const income = type === "INCOME";
  const Icon = income ? CircleArrowUp : CircleArrowDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium leading-5",
        income ? "text-success" : "text-danger",
        className,
      )}
    >
      <Icon className="size-4" aria-hidden />
      {income ? "Entrada" : "Saída"}
    </span>
  );
}
