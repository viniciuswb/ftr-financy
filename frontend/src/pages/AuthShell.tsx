import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100 px-4 pb-12 pt-12">
      <Logo />
      <section className="mt-8 w-full max-w-[448px] rounded-xl border border-gray-200 bg-white p-8">
        <header className="text-center">
          <h1 className="text-xl font-bold leading-7 text-gray-800">{title}</h1>
          <p className="text-base leading-6 text-gray-600">{subtitle}</p>
        </header>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-gray-300" />
      <span className="text-sm leading-5 text-gray-500">ou</span>
      <span className="h-px flex-1 bg-gray-300" />
    </div>
  );
}
