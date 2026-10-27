import { describe, expect, it } from "vitest";
import { InMemoryCache } from "@apollo/client";
import { CATEGORIES, TRANSACTIONS } from "@/graphql/operations";
import { refreshListsOptions } from "./cache";

describe("refreshListsOptions", () => {
  it("refetches mounted queries and evicts both lists from the cache", () => {
    const cache = new InMemoryCache();
    cache.writeQuery({ query: TRANSACTIONS, data: { transactions: [] } });
    cache.writeQuery({ query: CATEGORIES, data: { categories: [] } });
    expect(refreshListsOptions.refetchQueries).toEqual([TRANSACTIONS, CATEGORIES]);
    expect(refreshListsOptions.awaitRefetchQueries).toBe(true);

    refreshListsOptions.update(cache);

    expect(cache.diff({ query: TRANSACTIONS, optimistic: false, returnPartialData: true }).complete).toBe(false);
    expect(cache.diff({ query: CATEGORIES, optimistic: false, returnPartialData: true }).complete).toBe(false);
  });
});
