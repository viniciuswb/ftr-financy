import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { MockedProvider } from "@apollo/client/testing/react";
import type { MockedResponse } from "@apollo/client/testing";
import { Toaster } from "@/components/ui/toaster";
import type { AuthPayload } from "@/graphql/types";
import { useAuth } from "@/stores/auth";

export interface RenderOptions {
  route?: string;
  mocks?: MockedResponse[];
  auth?: AuthPayload;
}

export function renderWithProviders(ui: ReactElement, { route = "/", mocks = [], auth }: RenderOptions = {}) {
  window.localStorage.clear();
  window.sessionStorage.clear();
  useAuth.setState({ token: auth?.token ?? null, user: auth?.user ?? null });
  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
        <Toaster />
      </MemoryRouter>
    </MockedProvider>,
  );
}
