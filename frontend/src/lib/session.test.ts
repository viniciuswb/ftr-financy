import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { useAuth } from "@/stores/auth";
import { createSessionExpiredHandler } from "./session";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

describe("session expiry handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.getState().login({ token: "t", user: { id: "1", name: "A", email: "a@a.com" } }, true);
  });

  it("logs out once even when several requests fail together", () => {
    const clearStore = vi.fn();
    const navigate = vi.fn();
    const handler = createSessionExpiredHandler({ clearStore, navigate });
    handler();
    handler();
    handler();
    expect(useAuth.getState().token).toBeNull();
    expect(clearStore).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/");
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("Sessão expirada");
  });

  it("fires again for a later session", () => {
    const handler = createSessionExpiredHandler({ clearStore: vi.fn(), navigate: vi.fn() });
    handler();
    useAuth.getState().login({ token: "t2", user: { id: "1", name: "A", email: "a@a.com" } }, true);
    handler();
    expect(toast.error).toHaveBeenCalledTimes(2);
  });
});
