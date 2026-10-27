import { Field, ID, InputType, Int } from "type-graphql";
import { TransactionType } from "../../models/TransactionModel.js";

@InputType()
export class CreateTransactionInput {
  @Field(() => TransactionType)
  type!: TransactionType;

  @Field(() => String)
  description!: string;

  @Field(() => String)
  date!: string;

  @Field(() => Int)
  amount!: number;

  @Field(() => ID)
  categoryId!: string;
}
