import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus, Search, SquarePen, Trash } from "lucide-react";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TransactionModal } from "@/components/TransactionModal";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import { TypeIndicator } from "@/components/ui/type-indicator";
import { filterTransactions, paginate, periodOptions, type TransactionFilters } from "@/features/transactions";
import { CATEGORIES, DELETE_TRANSACTION, TRANSACTIONS } from "@/graphql/operations";
import type { Category, Transaction } from "@/graphql/types";
import { toastApiError } from "@/lib/api-error";
import { refreshListsOptions } from "@/lib/cache";
import { currentMonthKey, formatShortDate } from "@/lib/dates";
import { formatSignedAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

const COLUMNS = "grid grid-cols-[minmax(240px,1fr)_112px_200px_136px_200px_120px]";
const headerCell = "text-xs font-medium uppercase leading-4 tracking-[0.6px] text-gray-500";

const TYPE_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "INCOME", label: "Entrada" },
  { value: "EXPENSE", label: "Saída" },
];

export function TransactionsPage() {
  const { data, loading, error } = useQuery<{ transactions: Transaction[] }>(TRANSACTIONS);
  const { data: categoriesData } = useQuery<{ categories: Category[] }>(CATEGORIES);
  const [filters, setFilters] = useState<TransactionFilters>(() => ({
    search: "",
    type: "ALL",
    categoryId: "ALL",
    period: currentMonthKey(new Date()),
  }));
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; transaction?: Transaction }>({ open: false });
  const [toDelete, setToDelete] = useState<Transaction | null>(null);
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION, refreshListsOptions);

  const transactions = useMemo(() => data?.transactions ?? [], [data]);
  const categories = categoriesData?.categories ?? [];
  const periods = useMemo(() => periodOptions(transactions, new Date()), [transactions]);
  const filtered = useMemo(() => filterTransactions(transactions, filters), [transactions, filters]);
  const view = paginate(filtered, page);

  function changeFilter(patch: Partial<TransactionFilters>) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteTransaction({ variables: { id: toDelete.id } });
      toast.success("Transação excluída");
      setPage(view.page);
    } catch (e) {
      toastApiError(e, "Não foi possível excluir a transação");
    } finally {
      setToDelete(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-12 sm:px-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-gray-800">Transações</h1>
          <p className="mt-0.5 text-base leading-6 text-gray-600">Gerencie todas as suas transações financeiras</p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true })}>
          <Plus aria-hidden />
          Nova transação
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white px-6 pb-6 pt-5 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Buscar"
          icon={Search}
          placeholder="Buscar por descrição"
          value={filters.search}
          onChange={(e) => changeFilter({ search: e.target.value })}
        />
        <Select
          id="filter-type"
          label="Tipo"
          options={TYPE_OPTIONS}
          value={filters.type}
          onValueChange={(type) => changeFilter({ type: type as TransactionFilters["type"] })}
        />
        <Select
          id="filter-category"
          label="Categoria"
          options={[{ value: "ALL", label: "Todas" }, ...categories.map((c) => ({ value: c.id, label: c.title }))]}
          value={filters.categoryId}
          onValueChange={(categoryId) => changeFilter({ categoryId })}
        />
        <Select
          id="filter-period"
          label="Período"
          options={periods}
          value={filters.period}
          onValueChange={(period) => changeFilter({ period })}
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <div className="min-w-[1008px]">
            <div className={cn(COLUMNS, "h-[57px] items-center border-b border-gray-200")}>
              <span className={cn(headerCell, "px-6")}>Descrição</span>
              <span className={cn(headerCell, "text-center")}>Data</span>
              <span className={cn(headerCell, "text-center")}>Categoria</span>
              <span className={cn(headerCell, "text-center")}>Tipo</span>
              <span className={cn(headerCell, "px-6 text-right")}>Valor</span>
              <span className={cn(headerCell, "px-6 text-right")}>Ações</span>
            </div>
            {loading && !data ? (
              <p className="px-6 py-8 text-sm text-gray-500">Carregando...</p>
            ) : error && !data ? (
              <p className="px-6 py-8 text-sm text-danger">Não foi possível carregar as transações</p>
            ) : view.total === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-500">Nenhuma transação encontrada</p>
            ) : (
              view.items.map((t) => (
                <div key={t.id} className={cn(COLUMNS, "h-[72px] items-center border-b border-gray-200")}>
                  <div className="flex min-w-0 items-center gap-4 px-6">
                    <CategoryIcon icon={t.category.icon} color={t.category.color} />
                    <span className="truncate text-base font-medium leading-6 text-gray-800">{t.description}</span>
                  </div>
                  <span className="text-center text-sm leading-5 text-gray-600">{formatShortDate(t.date)}</span>
                  <div className="flex justify-center px-2">
                    <Tag color={t.category.color}>{t.category.title}</Tag>
                  </div>
                  <div className="flex justify-center">
                    <TypeIndicator type={t.type} />
                  </div>
                  <span className="px-6 text-right text-sm font-semibold leading-5 text-gray-800">{formatSignedAmount(t.type, t.amount)}</span>
                  <div className="flex justify-center gap-2">
                    <IconButton variant="danger" label={`Excluir ${t.description}`} icon={Trash} onClick={() => setToDelete(t)} />
                    <IconButton label={`Editar ${t.description}`} icon={SquarePen} onClick={() => setModal({ open: true, transaction: t })} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <p className="text-sm leading-5 text-gray-700">
            {view.from} a {view.to} | {view.total} {view.total === 1 ? "resultado" : "resultados"}
          </p>
          <Pagination page={view.page} pageCount={view.pageCount} onPageChange={setPage} />
        </div>
      </section>

      <TransactionModal open={modal.open} onOpenChange={(open) => setModal((m) => ({ ...m, open }))} transaction={modal.transaction} />
      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir transação?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
      />
    </main>
  );
}
