import fullLogo from "@/assets/logo.svg";
import iconLogo from "@/assets/logo-icon.svg";

export function Logo({ variant = "full", className }: { variant?: "full" | "icon"; className?: string }) {
  return variant === "full" ? (
    <img src={fullLogo} alt="Financy" width={134} height={32} className={className} />
  ) : (
    <img src={iconLogo} alt="Financy" width={40} height={40} className={className} />
  );
}
