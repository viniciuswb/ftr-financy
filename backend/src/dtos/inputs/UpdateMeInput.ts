import { Field, InputType } from "type-graphql";

@InputType()
export class UpdateMeInput {
  @Field(() => String)
  name!: string;
}
