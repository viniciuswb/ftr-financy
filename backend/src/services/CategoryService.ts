import { CATEGORY_COLORS, CATEGORY_ICONS } from "../constants/category.js";
import type { CreateCategoryInput } from "../dtos/inputs/CreateCategoryInput.js";
import type { UpdateCategoryInput } from "../dtos/inputs/UpdateCategoryInput.js";
import { badInput, notFound } from "../errors.js";
import type { Category } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { requireText } from "../utils/validate.js";

function optionalText(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

function checkIcon(icon: string): string {
  if (!CATEGORY_ICONS.includes(icon)) throw badInput("Ícone inválido");
  return icon;
}

function checkColor(color: string): string {
  if (!CATEGORY_COLORS.includes(color)) throw badInput("Cor inválida");
  return color;
}

export class CategoryService {
  list(userId: string): Promise<Category[]> {
    return prisma.category.findMany({ where: { userId }, orderBy: { title: "asc" } });
  }

  async findOwned(userId: string, id: string): Promise<Category> {
    const category = await prisma.category.findFirst({ where: { id, userId } });
    if (!category) throw notFound("Categoria não encontrada");
    return category;
  }

  create(userId: string, input: CreateCategoryInput): Promise<Category> {
    return prisma.category.create({
      data: {
        userId,
        title: requireText(input.title, "Título"),
        description: optionalText(input.description),
        icon: checkIcon(input.icon),
        color: checkColor(input.color),
      },
    });
  }

  async update(userId: string, id: string, input: UpdateCategoryInput): Promise<Category> {
    await this.findOwned(userId, id);
    return prisma.category.update({
      where: { id },
      data: {
        ...(input.title != null && { title: requireText(input.title, "Título") }),
        ...(input.description !== undefined && { description: optionalText(input.description) }),
        ...(input.icon != null && { icon: checkIcon(input.icon) }),
        ...(input.color != null && { color: checkColor(input.color) }),
      },
    });
  }

  async delete(userId: string, id: string): Promise<boolean> {
    await this.findOwned(userId, id);
    await prisma.category.delete({ where: { id } });
    return true;
  }
}
