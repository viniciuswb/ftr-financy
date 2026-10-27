import { ApolloProvider } from "@apollo/client/react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "@/components/ui/toaster";
import { createApolloClient } from "@/lib/apollo";
import { createSessionExpiredHandler } from "@/lib/session";
import { AppRoutes } from "@/routes/app-routes";
import { useAuth } from "@/stores/auth";

const router = createBrowserRouter([{ path: "*", element: <AppRoutes /> }]);

const client = createApolloClient({
  uri: import.meta.env.VITE_BACKEND_URL,
  getToken: () => useAuth.getState().token,
  onUnauthenticated: createSessionExpiredHandler({
    clearStore: () => client.clearStore(),
    navigate: (to) => router.navigate(to),
  }),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
      <Toaster />
    </ApolloProvider>
  );
}
