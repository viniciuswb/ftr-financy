import { Navigate, Route, Routes } from "react-router";
import { HomeRoute, ProtectedRoute, PublicOnlyRoute } from "./guards";
import { SignUpPage } from "@/pages/SignUpPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { ProfilePage } from "@/pages/ProfilePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/cadastro" element={<PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>} />
      <Route path="/transacoes" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
      <Route path="/categorias" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
