import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: "outline" | "danger";
  label: string;
  icon: LucideIcon;
}

export function IconButton({ variant = "outline", label, icon: Icon, className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-base enabled:hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "danger" ? "text-danger" : "text-gray-700",
        className,
      )}
      {...props}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
