import { beforeEach, describe, expect, it, vi } from "vitest";
import { isAuthenticated, useAuth } from "./auth";

const payload = { token: "tok-1", user: { id: "1", name: "Ana Souza", email: "ana@x.com" } };

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  useAuth.setState({ token: null, user: null });
});

describe("auth store", () => {
  it("remembers the session in localStorage when asked", () => {
    useAuth.getState().login(payload, true);
    expect(JSON.parse(localStorage.getItem("financy.auth")!)).toEqual(payload);
    expect(sessionStorage.getItem("financy.auth")).toBeNull();
    expect(isAuthenticated(useAuth.getState())).toBe(true);
  });

  it("keeps the session only for the tab otherwise", () => {
    useAuth.getState().login(payload, false);
    expect(JSON.parse(sessionStorage.getItem("financy.auth")!)).toEqual(payload);
    expect(localStorage.getItem("financy.auth")).toBeNull();
  });

  it("clears both storages on logout", () => {
    localStorage.setItem("financy.auth", JSON.stringify(payload));
    sessionStorage.setItem("financy.auth", JSON.stringify(payload));
    useAuth.getState().login(payload, true);
    useAuth.getState().logout();
    expect(localStorage.getItem("financy.auth")).toBeNull();
    expect(sessionStorage.getItem("financy.auth")).toBeNull();
    expect(useAuth.getState().token).toBeNull();
    expect(isAuthenticated(useAuth.getState())).toBe(false);
  });

  it("updates the stored user in place without changing where it is kept", () => {
    useAuth.getState().login(payload, false);
    useAuth.getState().setUser({ ...payload.user, name: "Ana Maria" });
    expect(JSON.parse(sessionStorage.getItem("financy.auth")!).user.name).toBe("Ana Maria");
    expect(localStorage.getItem("financy.auth")).toBeNull();
  });

  it("loads a stored session on start, preferring localStorage", async () => {
    sessionStorage.setItem("financy.auth", JSON.stringify({ ...payload, token: "from-session" }));
    localStorage.setItem("financy.auth", JSON.stringify(payload));
    vi.resetModules();
    const fresh = await import("./auth");
    expect(fresh.useAuth.getState().token).toBe("tok-1");
    localStorage.clear();
    vi.resetModules();
    const fresh2 = await import("./auth");
    expect(fresh2.useAuth.getState().token).toBe("from-session");
  });

  it("ignores corrupt stored data", async () => {
    localStorage.setItem("financy.auth", "{nope");
    vi.resetModules();
    const fresh = await import("./auth");
    expect(fresh.useAuth.getState().token).toBeNull();
  });
});
