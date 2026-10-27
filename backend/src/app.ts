import { ApolloServer } from "@apollo/server";
import type { GraphQLContext } from "./context.js";
import { buildAppSchema } from "./schema.js";

export async function createApolloServer(): Promise<ApolloServer<GraphQLContext>> {
  return new ApolloServer<GraphQLContext>({ schema: await buildAppSchema() });
}
