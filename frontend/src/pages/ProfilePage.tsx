import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { LogOut, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UPDATE_ME } from "@/graphql/operations";
import type { User } from "@/graphql/types";
import { initials } from "@/lib/text";
import { useAuth } from "@/stores/auth";

const schema = z.object({ name: z.string().trim().min(1, "Nome é obrigatório") });
type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const navigate = useNavigate();
  const client = useApolloClient();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const logout = useAuth((s) => s.logout);
  const [mutate, { loading }] = useMutation<{ updateMe: User }>(UPDATE_ME);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: user?.name ?? "" } });

  async function onSubmit({ name }: FormValues) {
    try {
      const result = await mutate({ variables: { data: { name } } });
      if (!result.data) return;
      setUser(result.data.updateMe);
      toast.success("Perfil atualizado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o perfil");
    }
  }

  async function onLogout() {
    logout();
    await client.clearStore();
    navigate("/");
  }

  return (
    <main className="px-4 pb-12 pt-12">
      <div className="mx-auto flex w-full max-w-[448px] flex-col gap-8 rounded-xl border border-gray-200 bg-white p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-gray-300 text-2xl leading-8 text-gray-800">
            {initials(user?.name ?? "")}
          </div>
          <div className="flex w-full flex-col items-center text-center">
            <h1 className="max-w-full break-words text-xl font-semibold leading-7 text-gray-800">{user?.name}</h1>
            <p className="mt-0.5 max-w-full break-words text-base leading-6 text-gray-500">{user?.email}</p>
          </div>
        </div>
        <hr className="border-gray-200" />
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Input
              label="Nome completo"
              icon={UserIcon}
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="E-mail"
              icon={Mail}
              value={user?.email ?? ""}
              disabled
              readOnly
              helper="O e-mail não pode ser alterado"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Button type="submit" disabled={loading}>
              Salvar alterações
            </Button>
            <Button type="button" variant="outline" onClick={onLogout}>
              <LogOut className="text-danger" aria-hidden />
              Sair da conta
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
