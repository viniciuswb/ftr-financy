import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { isAuthenticated, useAuth } from "@/stores/auth";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const authenticated = useAuth(isAuthenticated);
  return authenticated ? children : <Navigate to="/" replace />;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const authenticated = useAuth(isAuthenticated);
  return authenticated ? <Navigate to="/" replace /> : children;
}

export function HomeRoute() {
  const authenticated = useAuth(isAuthenticated);
  return authenticated ? <DashboardPage /> : <LoginPage />;
}
