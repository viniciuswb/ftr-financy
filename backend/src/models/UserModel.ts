import { DateTimeISOResolver } from "graphql-scalars";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType("User")
export class UserModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  email!: string;

  @Field(() => DateTimeISOResolver)
  createdAt!: Date;

  @Field(() => DateTimeISOResolver)
  updatedAt!: Date;
}
