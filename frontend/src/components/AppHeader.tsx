import { Link, NavLink } from "react-router";
import { Logo } from "@/components/ui/logo";
import { initials } from "@/lib/text";
import { cn } from "@/lib/utils";
import { useAuth } from "@/stores/auth";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/transacoes", label: "Transações", end: false },
  { to: "/categorias", label: "Categorias", end: false },
];

export function AppHeader() {
  const name = useAuth((s) => s.user?.name ?? "");

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="relative mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-12 py-4">
        <Link to="/" aria-label="Financy" className="shrink-0">
          <Logo className="h-6 w-[100px]" />
        </Link>
        <nav aria-label="Principal" className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-5">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "text-sm leading-5 text-gray-600 hover:text-gray-800",
                  isActive && "font-semibold text-brand-base hover:text-brand-base",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/perfil"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-300 text-sm leading-5 text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-base"
        >
          {initials(name)}
        </Link>
      </div>
    </header>
  );
}
