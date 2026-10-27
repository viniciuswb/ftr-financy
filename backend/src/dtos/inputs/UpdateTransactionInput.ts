import { Field, ID, InputType, Int } from "type-graphql";
import { TransactionType } from "../../models/TransactionModel.js";

@InputType()
export class UpdateTransactionInput {
  @Field(() => TransactionType, { nullable: true })
  type?: TransactionType | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  date?: string | null;

  @Field(() => Int, { nullable: true })
  amount?: number | null;

  @Field(() => ID, { nullable: true })
  categoryId?: string | null;
}
