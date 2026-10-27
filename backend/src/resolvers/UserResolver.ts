import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { GQLUser } from "../decorators/GQLUser.js";
import { UpdateMeInput } from "../dtos/inputs/UpdateMeInput.js";
import type { User } from "../generated/prisma/client.js";
import { isAuth } from "../middlewares/isAuth.js";
import { UserModel } from "../models/UserModel.js";
import { UserService } from "../services/UserService.js";

@Resolver(() => UserModel)
@UseMiddleware(isAuth)
export class UserResolver {
  private userService = new UserService();

  @Query(() => UserModel)
  me(@GQLUser() user: User): User {
    return user;
  }

  @Mutation(() => UserModel)
  updateMe(
    @GQLUser() user: User,
    @Arg("data", () => UpdateMeInput) data: UpdateMeInput,
  ): Promise<User> {
    return this.userService.updateName(user.id, data.name);
  }
}
