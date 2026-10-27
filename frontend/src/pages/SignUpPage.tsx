import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { LogIn, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { REGISTER } from "@/graphql/operations";
import type { AuthPayload } from "@/graphql/types";
import { useAuth } from "@/stores/auth";
import { AuthShell, OrDivider } from "./AuthShell";
import { PasswordInput } from "./PasswordInput";

const PASSWORD_RULE = "A senha deve ter no mínimo 8 caracteres";

const schema = z.object({
  name: z.string().trim().min(1, "Informe seu nome"),
  email: z.string().min(1, "Informe seu e-mail").pipe(z.email("E-mail inválido")),
  password: z.string().min(8, PASSWORD_RULE),
});
type FormValues = z.infer<typeof schema>;

export function SignUpPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [mutate, { loading }] = useMutation<{ register: AuthPayload }>(REGISTER);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    try {
      const result = await mutate({ variables: { data } });
      if (!result.data) return;
      const { token, user } = result.data.register;
      login({ token, user }, true);
      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (error) {
      toastApiError(error, "Não foi possível criar a conta");
    }
  }

  return (
    <AuthShell title="Criar conta" subtitle="Comece a controlar suas finanças ainda hoje">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Input
            label="Nome completo"
            icon={UserIcon}
            placeholder="Seu nome completo"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
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
            autoComplete="new-password"
            helper={PASSWORD_RULE}
            error={errors.password?.message}
            {...register("password")}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          Cadastrar
        </Button>
        <OrDivider />
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm leading-5 text-gray-600">Já tem uma conta?</p>
          <Link to="/" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
            <LogIn aria-hidden />
            Fazer login
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
