import type { ReactNode } from "react";
import { categoryColorClasses } from "@/lib/category-style";
import { cn } from "@/lib/utils";

export function Tag({ color, children, className }: { color: string; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-start justify-end whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium leading-5",
        categoryColorClasses(color).tag,
        className,
      )}
    >
      {children}
    </span>
  );
}
