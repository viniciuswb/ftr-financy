import { DateTimeISOResolver } from "graphql-scalars";
import { Field, ID, Int, ObjectType, registerEnumType } from "type-graphql";

export enum TransactionType {
  EXPENSE = "EXPENSE",
  INCOME = "INCOME",
}

registerEnumType(TransactionType, { name: "TransactionType" });

@ObjectType("Transaction")
export class TransactionModel {
  @Field(() => ID)
  id!: string;

  @Field(() => TransactionType)
  type!: TransactionType;

  @Field(() => String)
  description!: string;

  @Field(() => String, { description: "YYYY-MM-DD" })
  date!: string;

  @Field(() => Int, { description: "Amount in cents, always positive" })
  amount!: number;

  @Field(() => ID)
  categoryId!: string;

  @Field(() => DateTimeISOResolver)
  createdAt!: Date;

  @Field(() => DateTimeISOResolver)
  updatedAt!: Date;
}
