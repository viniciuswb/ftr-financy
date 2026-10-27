import "reflect-metadata";
import type { GraphQLSchema } from "graphql";
import { buildSchema } from "type-graphql";
import { AuthResolver } from "./resolvers/AuthResolver.js";
import { UserResolver } from "./resolvers/UserResolver.js";

export function buildAppSchema(): Promise<GraphQLSchema> {
  return buildSchema({
    resolvers: [AuthResolver, UserResolver],
    validate: false,
    emitSchemaFile: false,
  });
}
