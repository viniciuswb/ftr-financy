import { useEffect, type ReactNode } from "react";
import { useQuery } from "@apollo/client/react";
import { AppHeader } from "@/components/AppHeader";
import { ME } from "@/graphql/operations";
import type { User } from "@/graphql/types";
import { useAuth } from "@/stores/auth";

export function AppLayout({ children }: { children: ReactNode }) {
  const token = useAuth((s) => s.token);
  const setUser = useAuth((s) => s.setUser);
  const { data } = useQuery<{ me: User }>(ME, { skip: !token });
  const me = data?.me;

  useEffect(() => {
    if (!me) return;
    const current = useAuth.getState().user;
    if (current?.id !== me.id || current.name !== me.name || current.email !== me.email) setUser(me);
  }, [me, setUser]);

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader />
      {children}
    </div>
  );
}
