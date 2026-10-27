import type { AuthOutput } from "../dtos/outputs/AuthOutput.js";
import type { LoginInput } from "../dtos/inputs/LoginInput.js";
import type { RegisterInput } from "../dtos/inputs/RegisterInput.js";
import { badInput } from "../errors.js";
import { prisma } from "../lib/prisma.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";
import { normalizeEmail, requireText } from "../utils/validate.js";

const MIN_PASSWORD_LENGTH = 8;

export class AuthService {
  async register(input: RegisterInput): Promise<AuthOutput> {
    const name = requireText(input.name, "Nome");
    const email = requireText(normalizeEmail(input.email), "E-mail");
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      throw badInput("A senha deve ter no mínimo 8 caracteres");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw badInput("E-mail já cadastrado");

    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(input.password) },
    });
    return { token: signToken(user.id), user };
  }

  async login(input: LoginInput): Promise<AuthOutput> {
    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(input.email) } });
    const valid = user ? await comparePassword(input.password, user.password) : false;
    if (!user || !valid) throw badInput("E-mail ou senha inválidos");

    return { token: signToken(user.id), user };
  }
}
