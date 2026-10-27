import { ApolloClient, CombinedGraphQLErrors, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";

export interface ApolloClientOptions {
  uri: string;
  getToken: () => string | null;
  onUnauthenticated: () => void;
}

export function isUnauthenticated(error: unknown): boolean {
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((e) => e.extensions?.code === "UNAUTHENTICATED")
  );
}

export function createApolloClient({ uri, getToken, onUnauthenticated }: ApolloClientOptions) {
  const authLink = new SetContextLink((prev) => {
    const token = getToken();
    return token ? { headers: { ...prev.headers, Authorization: `Bearer ${token}` } } : {};
  });

  // Only a request that carried a token can mean "session expired"; a failed
  // login (no token sent) must never trigger a logout.
  const errorLink = new ErrorLink(({ error, operation }) => {
    const sentToken = Boolean(operation.getContext().headers?.Authorization);
    if (sentToken && isUnauthenticated(error)) onUnauthenticated();
  });

  return new ApolloClient({
    link: ApolloLink.from([authLink, errorLink, new HttpLink({ uri })]),
    cache: new InMemoryCache(),
  });
}
