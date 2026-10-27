import { Arg, ID, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { GQLUser } from "../decorators/GQLUser.js";
import { CreateCategoryInput } from "../dtos/inputs/CreateCategoryInput.js";
import { UpdateCategoryInput } from "../dtos/inputs/UpdateCategoryInput.js";
import type { Category, User } from "../generated/prisma/client.js";
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
}
