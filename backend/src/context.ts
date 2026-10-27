import type { User } from "./generated/prisma/client.js";

export interface GraphQLContext {
  authorization?: string;
  user?: User;
}
