import { Body, Controller, Get, Ip, Post, UseGuards } from "@nestjs/common";

import { Response } from "src/utils/Response";
import { ValidationPipe } from "src/validation/validation.pipe";
import { UsersService } from "./users.service";
import { RoleGuard } from "src/role/role.guard";
import { Auth } from "src/auth/auth.decorator";
import { Roles } from "src/role/roles.decorator";
import { User, UserOptionalDefaultsSchema } from "prisma/zod";

@UseGuards(RoleGuard)
@Controller("/v1/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("/register")
  async register(
    @Body(new ValidationPipe(UserOptionalDefaultsSchema)) loginReq: User,
  ) {
    const res = await this.usersService.register(loginReq);
    return new Response(res, 200);
  }

  @Post("/login")
  async login(
    @Body(new ValidationPipe(UserOptionalDefaultsSchema)) loginReq: User,
    @Ip() lastIp: string,
  ) {
    const res = await this.usersService.login({ ...loginReq, lastIp });
    return new Response(res, 200);
  }

  @Get("/arsip-negara")
  @Roles(["ADMIN"])
  async secret(@Auth() user: User) {
    return { hello: `world ${user.role}` };
  }
}
