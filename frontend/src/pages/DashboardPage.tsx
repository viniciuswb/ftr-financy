import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@apollo/client/react";
import { ChevronRight, CircleArrowDown, CircleArrowUp, Plus, Wallet } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TransactionModal } from "@/components/TransactionModal";
import { Tag } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";
import { dashboardSummary, topCategories } from "@/features/summaries";
import { CATEGORIES, TRANSACTIONS } from "@/graphql/operations";
import type { Category, Transaction } from "@/graphql/types";
import { formatShortDate } from "@/lib/dates";
import { formatCurrency, formatSignedAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import { pluralItems } from "@/lib/text";

const sectionTitle = "text-xs font-medium uppercase leading-4 tracking-[0.6px] text-gray-500";

function SummaryCard({ icon, iconClass, label, value }: { icon: ReactNode; iconClass: string; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <span className={cn("flex size-5 items-center justify-center [&_svg]:size-5", iconClass)}>{icon}</span>
        <h2 className={sectionTitle}>{label}</h2>
      </div>
      <p className="truncate text-[28px] font-bold leading-8 text-gray-800">{value}</p>
    </div>
  );
}

function Panel({ title, linkTo, linkLabel, children }: { title: string; linkTo: string; linkLabel: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <header className="flex h-[61px] items-center justify-between border-b border-gray-200 px-6">
        <h2 className={sectionTitle}>{title}</h2>
        <TextLink to={linkTo}>
          {linkLabel}
          <ChevronRight aria-hidden />
        </TextLink>
      </header>
      {children}
    </section>
  );
}

export function DashboardPage() {
  const { data: txData, loading: txLoading } = useQuery<{ transactions: Transaction[] }>(TRANSACTIONS);
  const { data: catData, loading: catLoading } = useQuery<{ categories: Category[] }>(CATEGORIES);
  const [modalOpen, setModalOpen] = useState(false);

  const transactions = useMemo(() => txData?.transactions ?? [], [txData]);
  const categories = useMemo(() => catData?.categories ?? [], [catData]);
  const summary = dashboardSummary(transactions, new Date());
  const recent = transactions.slice(0, 5);
  const top = topCategories(categories);

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-12 sm:px-12">
      <h1 className="sr-only">Dashboard</h1>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SummaryCard icon={<Wallet aria-hidden />} iconClass="text-purple-base" label="Saldo total" value={formatCurrency(summary.balance)} />
        <SummaryCard icon={<CircleArrowUp aria-hidden />} iconClass="text-success" label="Receitas do mês" value={formatCurrency(summary.monthIncome)} />
        <SummaryCard icon={<CircleArrowDown aria-hidden />} iconClass="text-danger" label="Despesas do mês" value={formatCurrency(summary.monthExpense)} />
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Transações recentes" linkTo="/transacoes" linkLabel="Ver todas">
            {txLoading && !txData ? (
              <p className="px-6 py-8 text-sm text-gray-500">Carregando...</p>
            ) : recent.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-500">Nenhuma transação ainda</p>
            ) : (
              recent.map((t) => (
                <div key={t.id} className="flex h-20 items-center gap-4 border-b border-gray-200 px-6">
                  <CategoryIcon icon={t.category.icon} color={t.category.color} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-base font-medium leading-6 text-gray-800">{t.description}</span>
                    <span className="text-sm leading-5 text-gray-600">{formatShortDate(t.date)}</span>
                  </div>
                  <div className="hidden w-40 shrink-0 justify-center sm:flex">
                    <Tag color={t.category.color}>{t.category.title}</Tag>
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-2 sm:w-40">
                    <span className="whitespace-nowrap text-sm font-semibold leading-5 text-gray-800">{formatSignedAmount(t.type, t.amount)}</span>
                    {t.type === "INCOME" ? (
                      <CircleArrowUp className="size-4 text-success" aria-label="Entrada" />
                    ) : (
                      <CircleArrowDown className="size-4 text-danger" aria-label="Saída" />
                    )}
                  </div>
                </div>
              ))
            )}
            <div className="flex h-[60px] items-center justify-center">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 text-sm font-medium leading-5 text-brand-base hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-base"
              >
                <Plus className="size-4" aria-hidden />
                Nova transação
              </button>
            </div>
          </Panel>
        </div>

        <Panel title="Categorias" linkTo="/categorias" linkLabel="Gerenciar">
          {catLoading && !catData ? (
            <p className="px-6 py-8 text-sm text-gray-500">Carregando...</p>
          ) : top.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-gray-500">Nenhuma categoria ainda</p>
          ) : (
            <ul className="flex flex-col gap-5 p-6">
              {top.map((c) => (
                <li key={c.id} className="flex items-center gap-1">
                  <Tag color={c.color}>{c.title}</Tag>
                  <span className="flex-1 text-right text-sm leading-5 text-gray-600">{pluralItems(c.transactionCount)}</span>
                  <span className="w-[88px] text-right text-sm font-semibold leading-5 text-gray-800">{formatCurrency(c.totalAmount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <TransactionModal open={modalOpen} onOpenChange={setModalOpen} />
    </main>
  );
}
