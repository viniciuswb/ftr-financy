import "reflect-metadata";
import type { ApolloServer } from "@apollo/server";
import type { GraphQLFormattedError } from "graphql";
import { createApolloServer } from "../src/app.js";
import type { GraphQLContext } from "../src/context.js";
import { prisma } from "../src/lib/prisma.js";

export interface ExecResult<T> {
  data?: T;
  errors?: readonly GraphQLFormattedError[];
}

let server: ApolloServer<GraphQLContext> | undefined;

export async function resetDb(): Promise<void> {
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

export async function exec<T = any>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
): Promise<ExecResult<T>> {
  server ??= await createApolloServer();
  const response = await server.executeOperation(
    { query, variables },
    { contextValue: { authorization: token ? `Bearer ${token}` : undefined } },
  );
  if (response.body.kind !== "single") throw new Error("Unexpected incremental response");
  return response.body.singleResult as ExecResult<T>;
}

export function errorCode(result: ExecResult<unknown>): string | undefined {
  return result.errors?.[0]?.extensions?.code as string | undefined;
}

let userCounter = 0;

export async function signUp(
  overrides: Partial<{ name: string; email: string; password: string }> = {},
): Promise<{ token: string; userId: string }> {
  userCounter += 1;
  const data = {
    name: "Conta teste",
    email: `user-${userCounter}@teste.com`,
    password: "12345678",
    ...overrides,
  };
  const result = await exec(
    `mutation($data: RegisterInput!) { register(data: $data) { token user { id } } }`,
    { data },
  );
  if (result.errors) throw new Error(result.errors[0].message);
  return { token: result.data.register.token, userId: result.data.register.user.id };
}
