import { CombinedGraphQLErrors } from "@apollo/client";
import { toast } from "sonner";
import { isUnauthenticated } from "@/lib/apollo";

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError || (error instanceof Error && /failed to fetch|network/i.test(error.message));
}

/**
 * The one place a failed API call becomes a toast. An expired session shows
 * nothing here: the Apollo error link already logged out with "Sessão expirada".
 */
export function toastApiError(error: unknown, fallback: string) {
  if (isUnauthenticated(error)) return;
  if (CombinedGraphQLErrors.is(error)) return void toast.error(error.message);
  if (isNetworkError(error)) return void toast.error("Não foi possível conectar ao servidor");
  toast.error(fallback);
}
