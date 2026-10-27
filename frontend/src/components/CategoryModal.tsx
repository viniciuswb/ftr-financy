import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CREATE_CATEGORY, UPDATE_CATEGORY } from "@/graphql/operations";
import type { Category } from "@/graphql/types";
import { CATEGORY_COLOR_KEYS, CATEGORY_ICON_KEYS, categoryColorClasses, categoryIcon } from "@/lib/category-style";
import { toastApiError } from "@/lib/api-error";
import { refreshListsOptions } from "@/lib/cache";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  description: z.string().trim(),
  icon: z.string(),
  color: z.string(),
});
type FormValues = z.infer<typeof schema>;

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

function defaults(category?: Category): FormValues {
  return {
    title: category?.title ?? "",
    description: category?.description ?? "",
    icon: category?.icon ?? CATEGORY_ICON_KEYS[0],
    color: category?.color ?? CATEGORY_COLOR_KEYS[0],
  };
}

export function CategoryModal({ open, onOpenChange, category }: CategoryModalProps) {
  const [create, { loading: creating }] = useMutation(CREATE_CATEGORY, refreshListsOptions);
  const [update, { loading: updating }] = useMutation(UPDATE_CATEGORY, refreshListsOptions);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults(category) });

  useEffect(() => {
    if (open) reset(defaults(category));
  }, [open, category, reset]);

  async function onSubmit(values: FormValues) {
    try {
      if (category) {
        await update({
          variables: {
            id: category.id,
            data: { title: values.title, description: values.description || null, icon: values.icon, color: values.color },
          },
        });
        toast.success("Categoria atualizada");
      } else {
        await create({
          variables: {
            data: {
              title: values.title,
              ...(values.description && { description: values.description }),
              icon: values.icon,
              color: values.color,
            },
          },
        });
        toast.success("Categoria criada");
      }
      onOpenChange(false);
    } catch (error) {
      toastApiError(error, "Não foi possível salvar a categoria");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={category ? "Editar categoria" : "Nova categoria"}
      description="Organize suas transações com categorias"
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Input label="Título" placeholder="Ex. Alimentação" error={errors.title?.message} {...register("title")} />
          <Input label="Descrição" placeholder="Descrição da categoria" helper="Opcional" {...register("description")} />
          <div className="flex flex-col gap-2">
            <span id="category-icon-label" className="text-sm font-medium leading-5 text-gray-700">Ícone</span>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div role="radiogroup" aria-labelledby="category-icon-label" className="flex flex-wrap gap-2">
                  {CATEGORY_ICON_KEYS.map((key) => {
                    const Icon = categoryIcon(key);
                    const selected = field.value === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={key}
                        onClick={() => field.onChange(key)}
                        className={cn(
                          "flex size-[42px] cursor-pointer items-center justify-center rounded-lg border bg-white text-gray-500 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-base",
                          selected ? "border-brand-base text-brand-base" : "border-gray-300",
                        )}
                      >
                        <Icon className="size-5" aria-hidden />
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span id="category-color-label" className="text-sm font-medium leading-5 text-gray-700">Cor</span>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <div role="radiogroup" aria-labelledby="category-color-label" className="flex flex-wrap gap-2">
                  {CATEGORY_COLOR_KEYS.map((key) => {
                    const selected = field.value === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={key}
                        onClick={() => field.onChange(key)}
                        className={cn(
                          "flex h-[30px] w-[50px] cursor-pointer items-center justify-center rounded-lg border bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-base",
                          selected ? "border-brand-base" : "border-gray-300",
                        )}
                      >
                        <span className={cn("h-5 w-10 rounded", categoryColorClasses(key).swatch)} />
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>
        </div>
        <Button type="submit" disabled={creating || updating}>
          Salvar
        </Button>
      </form>
    </Dialog>
  );
}
