import { afterEach, describe, expect, it, vi } from "vitest";
import { CombinedGraphQLErrors } from "@apollo/client";
import { gql } from "@apollo/client";
import { createApolloClient, isUnauthenticated } from "./apollo";

const graphQLError = (code: string) =>
  new CombinedGraphQLErrors({ errors: [{ message: "x", extensions: { code } }] });

describe("isUnauthenticated", () => {
  it("detects UNAUTHENTICATED errors", () => {
    expect(isUnauthenticated(graphQLError("UNAUTHENTICATED"))).toBe(true);
    expect(isUnauthenticated(graphQLError("BAD_USER_INPUT"))).toBe(false);
    expect(isUnauthenticated(new Error("network"))).toBe(false);
  });
});

const QUERY = gql`query Me { me { id } }`;

function stubFetch(code: string) {
  const fetchMock = vi.fn(async () =>
    new Response(JSON.stringify({ errors: [{ message: "nope", extensions: { code } }], data: null }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("createApolloClient", () => {
  it("sends the Bearer token and reports an expired session", async () => {
    const fetchMock = stubFetch("UNAUTHENTICATED");
    const onUnauthenticated = vi.fn();
    const client = createApolloClient({ uri: "http://api/graphql", getToken: () => "abc", onUnauthenticated });
    await client.query({ query: QUERY, errorPolicy: "all" });
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer abc");
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it("does not report an expired session when no token was sent (wrong password)", async () => {
    const fetchMock = stubFetch("UNAUTHENTICATED");
    const onUnauthenticated = vi.fn();
    const client = createApolloClient({ uri: "http://api/graphql", getToken: () => null, onUnauthenticated });
    await client.query({ query: QUERY, errorPolicy: "all" });
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(new Headers(init.headers).has("authorization")).toBe(false);
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it("ignores other error codes", async () => {
    stubFetch("BAD_USER_INPUT");
    const onUnauthenticated = vi.fn();
    const client = createApolloClient({ uri: "http://api/graphql", getToken: () => "abc", onUnauthenticated });
    await client.query({ query: QUERY, errorPolicy: "all" });
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });
});
