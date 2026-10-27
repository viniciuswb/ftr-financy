import { Field, InputType } from "type-graphql";

@InputType()
export class UpdateCategoryInput {
  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  icon?: string | null;

  @Field(() => String, { nullable: true })
  color?: string | null;
}
