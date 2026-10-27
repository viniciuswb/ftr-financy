import { Arg, Mutation, Resolver } from "type-graphql";
import { LoginInput } from "../dtos/inputs/LoginInput.js";
import { RegisterInput } from "../dtos/inputs/RegisterInput.js";
import { AuthOutput } from "../dtos/outputs/AuthOutput.js";
import { AuthService } from "../services/AuthService.js";

@Resolver()
export class AuthResolver {
  private authService = new AuthService();

  @Mutation(() => AuthOutput)
  register(@Arg("data", () => RegisterInput) data: RegisterInput): Promise<AuthOutput> {
    return this.authService.register(data);
  }

  @Mutation(() => AuthOutput)
  login(@Arg("data", () => LoginInput) data: LoginInput): Promise<AuthOutput> {
    return this.authService.login(data);
  }
}
