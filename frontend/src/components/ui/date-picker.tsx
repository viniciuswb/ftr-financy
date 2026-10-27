import { useState } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { Calendar } from "lucide-react";
import { fromIsoDate, toIsoDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string | null;
  onChange: (iso: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
}

function display(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function DatePicker({ value, onChange, placeholder = "Selecione", label, id }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? fromIsoDate(value) : undefined;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <div className="group flex w-full flex-col gap-2">
        {label && (
          <label htmlFor={id} className="text-sm font-medium leading-5 text-gray-700 group-focus-within:text-brand-base">
            {label}
          </label>
        )}
        <PopoverPrimitive.Trigger
          id={id}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-300 bg-white px-[13px] py-[15px] text-left text-base leading-[18px] outline-none focus-visible:border-brand-base data-[state=open]:border-brand-base"
        >
          <span className={cn("flex-1", value ? "text-gray-800" : "text-gray-400")}>{value ? display(value) : placeholder}</span>
          <Calendar className="size-4 shrink-0 text-gray-500" aria-hidden />
        </PopoverPrimitive.Trigger>
      </div>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 rounded-lg border border-gray-300 bg-white p-3 shadow-[0_4px_7.5px_rgba(0,0,0,0.1)]"
        >
          <DayPicker
            mode="single"
            locale={ptBR}
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (!date) return;
              onChange(toIsoDate(date));
              setOpen(false);
            }}
            classNames={{
              root: "text-sm text-gray-800",
              months: "relative",
              month_caption: "flex h-8 items-center justify-center font-medium capitalize",
              nav: "absolute inset-x-0 top-0 flex h-8 items-center justify-between",
              button_previous: "inline-flex size-8 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-200",
              button_next: "inline-flex size-8 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-200",
              weekday: "size-9 text-xs font-medium text-gray-500",
              day: "p-0",
              day_button: "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-200",
              selected: "[&>button]:bg-brand-base [&>button]:text-white [&>button:hover]:bg-brand-base",
              today: "font-semibold text-brand-base",
              outside: "text-gray-400",
            }}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
