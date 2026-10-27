import { create } from "zustand";
import type { AuthPayload, User } from "@/graphql/types";

const KEY = "financy.auth";

interface AuthState {
  token: string | null;
  user: User | null;
  login: (payload: AuthPayload, remember: boolean) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const isAuthenticated = (state: Pick<AuthState, "token">) => state.token !== null;

function read(storage: Storage): AuthPayload | null {
  try {
    const parsed = JSON.parse(storage.getItem(KEY) ?? "null");
    return parsed && typeof parsed.token === "string" && parsed.user ? (parsed as AuthPayload) : null;
  } catch {
    return null;
  }
}

function write(storage: Storage, payload: AuthPayload) {
  try {
    storage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // storage unavailable: the session still works in memory
  }
}

function clearStorage() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      storage.removeItem(KEY);
    } catch {
      // ignore
    }
  }
}

const stored = read(localStorage) ?? read(sessionStorage);

export const useAuth = create<AuthState>()((set, get) => ({
  token: stored?.token ?? null,
  user: stored?.user ?? null,
  login: (payload, remember) => {
    clearStorage();
    write(remember ? localStorage : sessionStorage, { token: payload.token, user: payload.user });
    set({ token: payload.token, user: payload.user });
  },
  logout: () => {
    clearStorage();
    set({ token: null, user: null });
  },
  setUser: (user) => {
    const { token } = get();
    if (token) {
      const storage = read(localStorage) ? localStorage : sessionStorage;
      write(storage, { token, user });
    }
    set({ user });
  },
}));
