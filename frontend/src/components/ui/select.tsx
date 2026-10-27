import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps {
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({ options, value, onValueChange, placeholder, label, id, disabled, className }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <div className={cn("group flex w-full flex-col gap-2", className)}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium leading-5 text-gray-700 group-focus-within:text-brand-base">
            {label}
          </label>
        )}
        <SelectPrimitive.Trigger
          id={id}
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-white px-[13px] py-[15px] text-left text-base leading-[18px] text-gray-800 outline-none focus-visible:border-brand-base data-[state=open]:border-brand-base disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-gray-400",
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            <SelectPrimitive.Value placeholder={placeholder} />
          </span>
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="size-4 shrink-0 text-gray-500" aria-hidden />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
      </div>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-gray-300 bg-white shadow-[0_4px_7.5px_rgba(0,0,0,0.1)]"
        >
          <SelectPrimitive.Viewport className="flex flex-col gap-4 px-[13px] py-[15px]">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="flex cursor-pointer items-center justify-between gap-2 text-base leading-[18px] text-gray-800 outline-none data-[highlighted]:text-brand-base data-[state=checked]:font-medium"
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check className="size-5 text-gray-800" aria-hidden />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
