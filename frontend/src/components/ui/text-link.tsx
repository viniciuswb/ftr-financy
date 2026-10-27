import { Link, type LinkProps } from "react-router";
import { cn } from "@/lib/utils";

export function TextLink({ className, ...props }: LinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium leading-5 text-brand-base transition-shadow hover:shadow-[inset_0_-1px_0_var(--color-brand-base)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-base [&_svg]:size-5",
        className,
      )}
      {...props}
    />
  );
}
