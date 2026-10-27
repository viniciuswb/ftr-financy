import { useState, type Ref } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";

export function PasswordInput({ ref, ...props }: Omit<InputProps, "type" | "icon" | "rightSlot"> & { ref?: Ref<HTMLInputElement> }) {
  const [visible, setVisible] = useState(false);
  const Toggle = visible ? EyeOff : Eye;
  return (
    <Input
      ref={ref}
      type={visible ? "text" : "password"}
      icon={Lock}
      rightSlot={
        <button
          type="button"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setVisible((v) => !v)}
          className="cursor-pointer text-gray-500 focus-visible:outline-2 focus-visible:outline-brand-base"
        >
          <Toggle className="size-4" aria-hidden />
        </button>
      }
      {...props}
    />
  );
}
