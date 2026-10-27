import { Field, ObjectType } from "type-graphql";
import { UserModel } from "../../models/UserModel.js";

@ObjectType()
export class AuthOutput {
  @Field(() => String)
  token!: string;

  @Field(() => UserModel)
  user!: UserModel;
}
