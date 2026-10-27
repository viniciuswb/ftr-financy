import type { CreateTransactionInput } from "../dtos/inputs/CreateTransactionInput.js";
import type { UpdateTransactionInput } from "../dtos/inputs/UpdateTransactionInput.js";
import { notFound } from "../errors.js";
import type { Transaction } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { TransactionModel, TransactionType } from "../models/TransactionModel.js";
import { formatDate, parseDate, requirePositiveAmount, requireText } from "../utils/validate.js";
import { CategoryService } from "./CategoryService.js";

function toModel(transaction: Transaction): TransactionModel {
  return {
    ...transaction,
    type: transaction.type as TransactionType,
    date: formatDate(transaction.date),
  };
}

export class TransactionService {
  private categoryService = new CategoryService();

  async list(userId: string): Promise<TransactionModel[]> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    return transactions.map(toModel);
  }

  async create(userId: string, input: CreateTransactionInput): Promise<TransactionModel> {
    const description = requireText(input.description, "Descrição");
    const date = parseDate(input.date);
    const amount = requirePositiveAmount(input.amount);
    await this.categoryService.findOwned(userId, input.categoryId);

    const transaction = await prisma.transaction.create({
      data: { userId, type: input.type, description, date, amount, categoryId: input.categoryId },
    });
    return toModel(transaction);
  }

  async update(userId: string, id: string, input: UpdateTransactionInput): Promise<TransactionModel> {
    await this.findOwned(userId, id);
    if (input.categoryId != null) await this.categoryService.findOwned(userId, input.categoryId);

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(input.type != null && { type: input.type }),
        ...(input.description != null && { description: requireText(input.description, "Descrição") }),
        ...(input.date != null && { date: parseDate(input.date) }),
        ...(input.amount != null && { amount: requirePositiveAmount(input.amount) }),
        ...(input.categoryId != null && { categoryId: input.categoryId }),
      },
    });
    return toModel(transaction);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    await this.findOwned(userId, id);
    await prisma.transaction.delete({ where: { id } });
    return true;
  }

  private async findOwned(userId: string, id: string): Promise<Transaction> {
    const transaction = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!transaction) throw notFound("Transação não encontrada");
    return transaction;
  }
}
