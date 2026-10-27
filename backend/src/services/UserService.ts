import type { User } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export class UserService {
  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}
