import type { ApolloCache } from "@apollo/client";
import { CATEGORIES, TRANSACTIONS } from "@/graphql/operations";

/**
 * Options for every transaction/category mutation. Transactions and categories
 * depend on each other (deleting a category cascades; totals and counts move),
 * so after any change both lists must be fresh on every screen: mounted queries
 * are refetched, and the cached lists are evicted so screens mounted later fetch again.
 */
export const refreshListsOptions = {
  refetchQueries: [TRANSACTIONS, CATEGORIES],
  awaitRefetchQueries: true,
  update(cache: ApolloCache) {
    // No broadcast: mounted queries are refetched above; evicting would only flash them as incomplete.
    cache.evict({ id: "ROOT_QUERY", fieldName: "transactions", broadcast: false });
    cache.evict({ id: "ROOT_QUERY", fieldName: "categories", broadcast: false });
    cache.gc();
  },
};
