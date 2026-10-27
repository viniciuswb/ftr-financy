import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@apollo/client/react";
import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORIES, CREATE_TRANSACTION, TRANSACTIONS, UPDATE_TRANSACTION } from "@/graphql/operations";
import type { Category, Transaction } from "@/graphql/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  description: z.string().trim().min(1, "Descrição é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  amount: z.number().int().min(1, "Valor deve ser maior que zero"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
});
type FormValues = z.infer<typeof schema>;

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

function defaults(transaction?: Transaction): FormValues {
  return {
    type: transaction?.type ?? "EXPENSE",
    description: transaction?.description ?? "",
    date: transaction?.date ?? "",
    amount: transaction?.amount ?? 0,
    categoryId: transaction?.categoryId ?? "",
  };
}

const TYPE_OPTIONS = [
  { value: "EXPENSE", label: "Despesa", icon: CircleArrowDown, active: "border-danger", iconClass: "text-danger" },
  { value: "INCOME", label: "Receita", icon: CircleArrowUp, active: "border-success", iconClass: "text-success" },
] as const;

export function TransactionModal({ open, onOpenChange, transaction }: TransactionModalProps) {
  const { data } = useQuery<{ categories: Category[] }>(CATEGORIES);
  const categories = data?.categories ?? [];
  const options = { refetchQueries: [TRANSACTIONS, CATEGORIES], awaitRefetchQueries: true };
  const [create, { loading: creating }] = useMutation(CREATE_TRANSACTION, options);
  const [update, { loading: updating }] = useMutation(UPDATE_TRANSACTION, options);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults(transaction) });

  useEffect(() => {
    if (open) reset(defaults(transaction));
  }, [open, transaction, reset]);

  async function onSubmit(values: FormValues) {
    const input = {
      type: values.type,
      description: values.description,
      date: values.date,
      amount: values.amount,
      categoryId: values.categoryId,
    };
    try {
      if (transaction) {
        await update({ variables: { id: transaction.id, data: input } });
        toast.success("Transação atualizada");
      } else {
        await create({ variables: { data: input } });
        toast.success("Transação criada");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a transação");
    }
  }

  const noCategories = categories.length === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={transaction ? "Editar transação" : "Nova transação"}
      description="Registre sua despesa ou receita"
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div role="radiogroup" aria-label="Tipo" className="mb-2 flex rounded-xl border border-gray-200 bg-white p-[7px]">
                {TYPE_OPTIONS.map(({ value, label, icon: Icon, active, iconClass }) => {
                  const selected = field.value === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => field.onChange(value)}
                      className={cn(
                        "flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-lg border px-3 py-[10px] text-base leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-base",
                        selected ? cn("bg-gray-100 font-medium text-gray-800", active) : "border-transparent text-gray-600 hover:bg-gray-100",
                      )}
                    >
                      <Icon className={cn("size-4", selected ? iconClass : "text-gray-400")} aria-hidden />
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          />
          <Input label="Descrição" placeholder="Ex. Almoço no restaurante" error={errors.description?.message} {...register("description")} />
          <div className="grid grid-cols-2 items-start gap-4">
            <div className="flex flex-col gap-2">
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker id="transaction-date" label="Data" value={field.value || null} onChange={field.onChange} />
                )}
              />
              {errors.date && <p className="text-xs leading-4 text-danger">{errors.date.message}</p>}
            </div>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput id="transaction-amount" label="Valor" value={field.value} onChange={field.onChange} error={errors.amount?.message} />
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  id="transaction-category"
                  label="Categoria"
                  placeholder="Selecione"
                  disabled={noCategories}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={categories.map((c) => ({ value: c.id, label: c.title }))}
                />
              )}
            />
            {noCategories ? (
              <p className="text-xs leading-4 text-gray-500">Crie uma categoria primeiro</p>
            ) : (
              errors.categoryId && <p className="text-xs leading-4 text-danger">{errors.categoryId.message}</p>
            )}
          </div>
        </div>
        <Button type="submit" disabled={creating || updating}>
          Salvar
        </Button>
      </form>
    </Dialog>
  );
}
