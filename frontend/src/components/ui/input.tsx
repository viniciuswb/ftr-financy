import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  label?: string;
  icon?: LucideIcon;
  error?: string;
  helper?: string;
  rightSlot?: ReactNode;
}

export function Input({ ref, label, icon: Icon, error, helper, rightSlot, className, id, disabled, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? helper;

  return (
    <div className={cn("group flex w-full flex-col gap-2", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "text-sm font-medium leading-5 text-gray-700 group-focus-within:text-brand-base",
            error && "text-danger group-focus-within:text-danger",
          )}
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex w-full items-center gap-3 overflow-clip rounded-lg border border-gray-300 bg-white px-[13px] py-[14px] focus-within:border-brand-base",
          error && "border-danger focus-within:border-danger",
          disabled && "opacity-50",
        )}
      >
        {Icon && <Icon
            className="size-4 shrink-0 text-gray-400 group-focus-within:text-brand-base [.group:has(input:not(:placeholder-shown):enabled):not(:focus-within)_&]:text-gray-700"
            aria-hidden
          />}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className="min-w-0 flex-1 bg-transparent text-base leading-[18px] text-gray-800 caret-brand-base outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-black"
          {...props}
        />
        {rightSlot}
      </div>
      {message && (
        <p id={messageId} className={cn("text-xs leading-4", error ? "text-danger" : "text-gray-500")}>
          {message}
        </p>
      )}
    </div>
  );
}
