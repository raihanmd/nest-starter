import * as bcrypt from "bcrypt";
import { v4 } from "uuid";
import { Logger } from "winston";
import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

import { PrismaService } from "src/prisma/prisma.service";
import { User } from "prisma/generated/zod";

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async register(data: User) {
    const isUserExist = await this.prismaService.user.findFirst({
      where: {
        username: data.username,
      },
    });

    if (isUserExist) {
      this.logger.warn("User already exist");
      throw new ForbiddenException("User already exist");
    }

    data.password = await bcrypt.hash(data.password as string, 10);

    return this.prismaService.user.create({
      data: {
        username: data.username as string,
        password: data.password,
      },
      select: {
        username: true,
      },
    });
  }

  async login(data: User) {
    const user = await this.prismaService.user.findFirst({
      where: {
        username: data.username,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Username or password wrong");
    }

    const isMatch = await bcrypt.compare(
      data.password as string,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException("Username or password wrong");
    }

    data.token = v4();

    return await this.prismaService.user.update({
      data: {
        lastIp: data.lastIp,
        token: data.token,
      },
      where: {
        username: data.username,
      },
      select: {
        username: true,
        token: true,
      },
    });
  }
}
