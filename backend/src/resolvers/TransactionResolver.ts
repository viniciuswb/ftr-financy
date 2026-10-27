import { Arg, FieldResolver, ID, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { GQLUser } from "../decorators/GQLUser.js";
import { CreateTransactionInput } from "../dtos/inputs/CreateTransactionInput.js";
import { UpdateTransactionInput } from "../dtos/inputs/UpdateTransactionInput.js";
import type { Category, User } from "../generated/prisma/client.js";
import { isAuth } from "../middlewares/isAuth.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { TransactionModel } from "../models/TransactionModel.js";
import { CategoryService } from "../services/CategoryService.js";
import { TransactionService } from "../services/TransactionService.js";

@Resolver(() => TransactionModel)
@UseMiddleware(isAuth)
export class TransactionResolver {
  private transactionService = new TransactionService();
  private categoryService = new CategoryService();

  @Query(() => [TransactionModel])
  transactions(@GQLUser() user: User): Promise<TransactionModel[]> {
    return this.transactionService.list(user.id);
  }

  @Mutation(() => TransactionModel)
  createTransaction(
    @GQLUser() user: User,
    @Arg("data", () => CreateTransactionInput) data: CreateTransactionInput,
  ): Promise<TransactionModel> {
    return this.transactionService.create(user.id, data);
  }

  @Mutation(() => TransactionModel)
  updateTransaction(
    @GQLUser() user: User,
    @Arg("id", () => ID) id: string,
    @Arg("data", () => UpdateTransactionInput) data: UpdateTransactionInput,
  ): Promise<TransactionModel> {
    return this.transactionService.update(user.id, id, data);
  }

  @Mutation(() => Boolean)
  deleteTransaction(@GQLUser() user: User, @Arg("id", () => ID) id: string): Promise<boolean> {
    return this.transactionService.delete(user.id, id);
  }

  @FieldResolver(() => CategoryModel)
  category(@GQLUser() user: User, @Root() transaction: TransactionModel): Promise<Category> {
    return this.categoryService.findOwned(user.id, transaction.categoryId);
  }
}
