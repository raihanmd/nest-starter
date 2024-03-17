import { Body, Controller, Inject, Ip, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ValidationPipe } from "src/validation/validation.pipe";
import { Logger } from "winston";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { User, UserCreateInputSchema } from "prisma/generated/zod";
import { Response } from "src/utils/Response";

@Controller("/v1/users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

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
