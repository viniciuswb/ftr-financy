import { createParameterDecorator } from "type-graphql";
import type { GraphQLContext } from "../context.js";

export function GQLUser() {
  return createParameterDecorator<GraphQLContext>(({ context }) => context.user!);
}
