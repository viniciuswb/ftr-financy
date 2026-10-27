import type { Transaction, TransactionType } from "@/graphql/types";
import { currentMonthKey, monthKey, monthLabel } from "@/lib/dates";
import { normalizeSearch } from "@/lib/text";

export type TransactionFilters = {
  search: string;
  type: "ALL" | TransactionType;
  categoryId: "ALL" | string;
  period: "ALL" | string; // "YYYY-MM"
};

export function filterTransactions(list: Transaction[], filters: TransactionFilters): Transaction[] {
  const search = normalizeSearch(filters.search);
  return list.filter(
    (t) =>
      (search === "" || normalizeSearch(t.description).includes(search)) &&
      (filters.type === "ALL" || t.type === filters.type) &&
      (filters.categoryId === "ALL" || t.categoryId === filters.categoryId) &&
      (filters.period === "ALL" || monthKey(t.date) === filters.period),
  );
}

export function periodOptions(list: Transaction[], now: Date): { value: string; label: string }[] {
  const current = currentMonthKey(now);
  const others = [...new Set(list.map((t) => monthKey(t.date)))].filter((k) => k !== current).sort().reverse();
  return [
    { value: "ALL", label: "Todos os períodos" },
    ...[current, ...others].map((value) => ({ value, label: monthLabel(value) })),
  ];
}

export function paginate<T>(list: T[], page: number, perPage = 10) {
  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * perPage;
  const items = list.slice(start, start + perPage);
  return {
    items,
    page: current,
    pageCount,
    total,
    from: total === 0 ? 0 : start + 1,
    to: total === 0 ? 0 : start + items.length,
  };
}
