import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const base =
  "inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-sm font-medium leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-base";
const idle = "border border-gray-300 bg-white p-2 text-gray-700 enabled:hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50";

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: Math.max(pageCount, 1) }, (_, i) => i + 1);
  return (
    <nav aria-label="Paginação" className="flex items-center gap-2">
      <button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={cn(base, idle)}>
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? "page" : undefined}
          onClick={() => onPageChange(p)}
          className={cn(base, p === page ? "bg-brand-base text-white" : idle)}
        >
          {p}
        </button>
      ))}
      <button type="button" aria-label="Próxima página" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} className={cn(base, idle)}>
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
