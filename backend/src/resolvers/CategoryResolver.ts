import { Arg, FieldResolver, ID, Int, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { GQLUser } from "../decorators/GQLUser.js";
import { CreateCategoryInput } from "../dtos/inputs/CreateCategoryInput.js";
import { UpdateCategoryInput } from "../dtos/inputs/UpdateCategoryInput.js";
import type { Category, User } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { isAuth } from "../middlewares/isAuth.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { CategoryService } from "../services/CategoryService.js";

@Resolver(() => CategoryModel)
@UseMiddleware(isAuth)
export class CategoryResolver {
  private categoryService = new CategoryService();

  @Query(() => [CategoryModel])
  categories(@GQLUser() user: User): Promise<Category[]> {
    return this.categoryService.list(user.id);
  }

  @Mutation(() => CategoryModel)
  createCategory(
    @GQLUser() user: User,
    @Arg("data", () => CreateCategoryInput) data: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.create(user.id, data);
  }

  @Mutation(() => CategoryModel)
  updateCategory(
    @GQLUser() user: User,
    @Arg("id", () => ID) id: string,
    @Arg("data", () => UpdateCategoryInput) data: UpdateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.update(user.id, id, data);
  }

  @Mutation(() => Boolean)
  deleteCategory(@GQLUser() user: User, @Arg("id", () => ID) id: string): Promise<boolean> {
    return this.categoryService.delete(user.id, id);
  }

  @FieldResolver(() => Int)
  transactionCount(@Root() category: Category): Promise<number> {
    return prisma.transaction.count({ where: { categoryId: category.id } });
  }

  @FieldResolver(() => Int, { description: "All-time sum of the category's amounts in cents, regardless of type" })
  async totalAmount(@Root() category: Category): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: { categoryId: category.id },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }
}
