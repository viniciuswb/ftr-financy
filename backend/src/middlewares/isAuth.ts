import type { MiddlewareFn } from "type-graphql";
import type { GraphQLContext } from "../context.js";
import { unauthenticated } from "../errors.js";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../utils/jwt.js";

export const isAuth: MiddlewareFn<GraphQLContext> = async ({ context }, next) => {
  // Field resolvers run this again for every object; the first check already loaded the user.
  if (context.user) return next();

  const header = context.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
  const userId = token ? verifyToken(token) : null;
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (!user) throw unauthenticated();

  context.user = user;
  return next();
};
