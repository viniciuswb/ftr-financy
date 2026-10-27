import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import express, { type Express } from "express";
import type { GraphQLContext } from "./context.js";
import { env } from "./env.js";
import { buildAppSchema } from "./schema.js";

export async function createApolloServer(): Promise<ApolloServer<GraphQLContext>> {
  return new ApolloServer<GraphQLContext>({ schema: await buildAppSchema() });
}

export async function createApp(): Promise<Express> {
  const apollo = await createApolloServer();
  await apollo.start();

  const app = express();
  app.use(
    "/graphql",
    cors({ origin: env.CORS_ORIGIN }),
    express.json(),
    expressMiddleware(apollo, {
      context: async ({ req }) => ({ authorization: req.headers.authorization }),
    }),
  );
  return app;
}
