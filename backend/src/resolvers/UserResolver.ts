import { Query, Resolver, UseMiddleware } from "type-graphql";
import { GQLUser } from "../decorators/GQLUser.js";
import type { User } from "../generated/prisma/client.js";
import { isAuth } from "../middlewares/isAuth.js";
import { UserModel } from "../models/UserModel.js";

@Resolver(() => UserModel)
@UseMiddleware(isAuth)
export class UserResolver {
  @Query(() => UserModel)
  me(@GQLUser() user: User): User {
    return user;
  }
}
