import type { User } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { requireText } from "../utils/validate.js";

export class UserService {
  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  updateName(userId: string, name: string): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data: { name: requireText(name, "Nome") } });
  }
}
