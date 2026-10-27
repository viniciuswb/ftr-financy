import { beforeEach, describe, expect, it, vi } from "vitest";
import { CombinedGraphQLErrors } from "@apollo/client";
import { toast } from "sonner";
import { toastApiError } from "./api-error";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const graphQLError = (message: string, code: string) =>
  new CombinedGraphQLErrors({ errors: [{ message, extensions: { code } }] });

describe("toastApiError", () => {
  beforeEach(() => vi.mocked(toast.error).mockClear());

  it("shows nothing for an unauthenticated error (the session handler already toasts)", () => {
    toastApiError(graphQLError("Não autenticado", "UNAUTHENTICATED"), "fallback");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows the API message for a GraphQL error", () => {
    toastApiError(graphQLError("E-mail ou senha inválidos", "UNAUTHORIZED"), "fallback");
    expect(toast.error).toHaveBeenCalledWith("E-mail ou senha inválidos");
  });

  it("shows a Portuguese message for network errors", () => {
    toastApiError(new TypeError("Failed to fetch"), "fallback");
    expect(toast.error).toHaveBeenCalledWith("Não foi possível conectar ao servidor");
  });

  it("uses the fallback for anything else", () => {
    toastApiError("boom", "Não foi possível salvar");
    expect(toast.error).toHaveBeenCalledWith("Não foi possível salvar");
  });
});
