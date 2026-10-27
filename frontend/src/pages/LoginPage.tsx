import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LOGIN } from "@/graphql/operations";
import type { AuthPayload } from "@/graphql/types";
import { useAuth } from "@/stores/auth";
import { AuthShell, OrDivider } from "./AuthShell";
import { PasswordInput } from "./PasswordInput";

const schema = z.object({
  email: z.string().min(1, "Informe seu e-mail").pipe(z.email("E-mail inválido")),
  password: z.string().min(1, "Informe sua senha"),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [remember, setRemember] = useState(false);
  const [mutate, { loading }] = useMutation<{ login: AuthPayload }>(LOGIN);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      const result = await mutate({ variables: { data } });
      if (!result.data) return;
      const { token, user } = result.data.login;
      login({ token, user }, remember);
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível entrar");
    }
  }

  return (
    <AuthShell title="Fazer login" subtitle="Entre na sua conta para continuar">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            icon={Mail}
            placeholder="mail@exemplo.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <PasswordInput
            label="Senha"
            placeholder="Digite sua senha"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm leading-5 text-gray-700">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              Lembrar-me
            </label>
            <button
              type="button"
              onClick={() => toast.info("Funcionalidade em breve")}
              className="cursor-pointer text-sm font-medium leading-5 text-brand-base hover:shadow-[inset_0_-1px_0_var(--color-brand-base)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-base"
            >
              Recuperar senha
            </button>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          Entrar
        </Button>
        <OrDivider />
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm leading-5 text-gray-600">Ainda não tem uma conta?</p>
          <Link to="/cadastro" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
            <UserPlus aria-hidden />
            Criar conta
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
