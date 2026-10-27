import { DateTimeISOResolver } from "graphql-scalars";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType("Category")
export class CategoryModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String)
  icon!: string;

  @Field(() => String)
  color!: string;

  @Field(() => DateTimeISOResolver)
  createdAt!: Date;

  @Field(() => DateTimeISOResolver)
  updatedAt!: Date;
}
