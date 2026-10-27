import { toast } from "sonner";
import { useAuth } from "@/stores/auth";

/**
 * Builds the handler run when the API rejects a token. Several requests can
 * fail at once; only the first one finds a session to end, the rest are no-ops.
 */
export function createSessionExpiredHandler({
  clearStore,
  navigate,
}: {
  clearStore: () => unknown;
  navigate: (to: string) => unknown;
}) {
  return () => {
    if (useAuth.getState().token === null) return;
    useAuth.getState().logout();
    void clearStore();
    toast.error("Sessão expirada");
    void navigate("/");
  };
}
