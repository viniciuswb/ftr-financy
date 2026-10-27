import { centsFromDigits, formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: number;
  onChange: (cents: number) => void;
  label?: string;
  id?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/** "R$ 89,50" -> "89,50" (the prefix is rendered separately). */
function numberPart(cents: number): string {
  return formatCurrency(cents).replace(/^R\$\s*/, "");
}

export function CurrencyInput({ value, onChange, label, id, error, disabled, className }: CurrencyInputProps) {
  return (
    <div className={cn("group flex w-full flex-col gap-2", className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn("text-sm font-medium leading-5 text-gray-700 group-focus-within:text-brand-base", error && "text-danger group-focus-within:text-danger")}
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-[13px] py-[14px] focus-within:border-brand-base",
          error && "border-danger focus-within:border-danger",
          disabled && "opacity-50",
        )}
      >
        <span className="text-base leading-[18px] text-gray-800">R$</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          value={numberPart(value)}
          onChange={(e) => onChange(centsFromDigits(e.target.value))}
          className="min-w-0 flex-1 bg-transparent text-base leading-[18px] text-gray-800 caret-brand-base outline-none"
        />
      </div>
      {error && <p className="text-xs leading-4 text-danger">{error}</p>}
    </div>
  );
}
