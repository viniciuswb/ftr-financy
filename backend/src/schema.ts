import "reflect-metadata";
import type { GraphQLSchema } from "graphql";
import { buildSchema } from "type-graphql";
import { AuthResolver } from "./resolvers/AuthResolver.js";
import { CategoryResolver } from "./resolvers/CategoryResolver.js";
import { UserResolver } from "./resolvers/UserResolver.js";

export function buildAppSchema(): Promise<GraphQLSchema> {
  return buildSchema({
    resolvers: [AuthResolver, UserResolver, CategoryResolver],
    validate: false,
    emitSchemaFile: false,
  });
}
