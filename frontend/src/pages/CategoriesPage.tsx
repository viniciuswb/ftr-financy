import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { ArrowUpDown, Plus, SquarePen, Tag as TagIcon, Trash } from "lucide-react";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CategoryModal } from "@/components/CategoryModal";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Tag } from "@/components/ui/tag";
import { CATEGORIES, DELETE_CATEGORY, TRANSACTIONS } from "@/graphql/operations";
import type { Category } from "@/graphql/types";
import { categoriesSummary } from "@/features/summaries";
import { categoryColorClasses, categoryIcon } from "@/lib/category-style";
import { pluralItems } from "@/lib/text";
import { cn } from "@/lib/utils";

function SummaryCard({ icon, iconClass, value, label }: { icon: React.ReactNode; iconClass?: string; value: string; label: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6">
      <span className={cn("flex size-8 shrink-0 items-center justify-center [&_svg]:size-6", iconClass)}>{icon}</span>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="truncate text-[28px] font-bold leading-8 text-gray-800">{value}</p>
        <p className="text-xs font-medium uppercase leading-4 tracking-[0.6px] text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const { data, loading, error } = useQuery<{ categories: Category[] }>(CATEGORIES);
  const [modal, setModal] = useState<{ open: boolean; category?: Category }>({ open: false });
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [CATEGORIES, TRANSACTIONS],
    awaitRefetchQueries: true,
  });

  const categories = data?.categories ?? [];
  const { totalCategories, totalTransactions, mostUsed } = categoriesSummary(categories);
  const MostUsedIcon = mostUsed ? categoryIcon(mostUsed.icon) : null;

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteCategory({ variables: { id: toDelete.id } });
      toast.success("Categoria excluída");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível excluir a categoria");
    } finally {
      setToDelete(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-12 sm:px-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-8 text-gray-800">Categorias</h1>
          <p className="text-base leading-6 text-gray-600">Organize suas transações por categorias</p>
        </div>
        <Button size="sm" onClick={() => setModal({ open: true })}>
          <Plus aria-hidden />
          Nova categoria
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SummaryCard icon={<TagIcon aria-hidden />} iconClass="text-gray-700" value={String(totalCategories)} label="total de categorias" />
        <SummaryCard icon={<ArrowUpDown aria-hidden />} iconClass="text-purple-base" value={String(totalTransactions)} label="total de transações" />
        <SummaryCard
          icon={MostUsedIcon ? <MostUsedIcon aria-hidden /> : null}
          iconClass={mostUsed ? categoryColorClasses(mostUsed.color).icon : undefined}
          value={mostUsed?.title ?? "—"}
          label="categoria mais utilizada"
        />
      </section>

      {loading && !data ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : error && !data ? (
        <p className="text-sm text-danger">Não foi possível carregar as categorias</p>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <article key={category.id} className="flex flex-col rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <CategoryIcon icon={category.icon} color={category.color} />
                <div className="flex gap-2">
                  <IconButton variant="danger" label={`Excluir ${category.title}`} icon={Trash} onClick={() => setToDelete(category)} />
                  <IconButton label={`Editar ${category.title}`} icon={SquarePen} onClick={() => setModal({ open: true, category })} />
                </div>
              </div>
              <div className="mt-5 flex min-h-[68px] flex-col gap-1">
                <h2 className="text-base font-semibold leading-6 text-gray-800">{category.title}</h2>
                {category.description ? <p className="text-sm leading-5 text-gray-600">{category.description}</p> : null}
              </div>
              <div className="mt-5 flex items-center justify-between gap-2">
                <Tag color={category.color}>{category.title}</Tag>
                <span className="shrink-0 text-sm leading-5 text-gray-600">{pluralItems(category.transactionCount)}</span>
              </div>
            </article>
          ))}
        </section>
      )}

      <CategoryModal open={modal.open} onOpenChange={(open) => setModal((m) => ({ ...m, open }))} category={modal.category} />
      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Excluir categoria"
        description={
          toDelete && toDelete.transactionCount > 0
            ? `Esta categoria e suas ${toDelete.transactionCount} transações serão excluídas.`
            : "Esta categoria será excluída."
        }
        confirmLabel="Excluir"
        onConfirm={confirmDelete}
      />
    </main>
  );
}
