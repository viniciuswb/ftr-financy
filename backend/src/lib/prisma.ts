import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from "../env.js";
import { PrismaClient } from "../generated/prisma/client.js";

export const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: env.DATABASE_URL }),
});
