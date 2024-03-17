import { Body, Controller, Ip, Post } from "@nestjs/common";

import { Response } from "src/utils/Response";
import { ValidationPipe } from "src/validation/validation.pipe";
import { UsersService } from "./users.service";
import { User, UserCreateInputSchema } from "prisma/generated/zod";

@Controller("/v1/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("/register")
  async register(
    @Body(new ValidationPipe(UserCreateInputSchema)) loginReq: User,
  ) {
    const res = await this.usersService.register(loginReq);
    return new Response(res, 200);
  }

  @Post("/login")
  async login(
    @Body(new ValidationPipe(UserCreateInputSchema)) loginReq: User,
    @Ip() lastIp: string,
  ) {
    const res = await this.usersService.login({ ...loginReq, lastIp });
    return new Response(res, 200);
  }
}
