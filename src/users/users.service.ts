import * as bcrypt from "bcrypt";
import { Logger } from "winston";
import { User } from "@prisma/client";
import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";

import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  getAll() {
    return this.prismaService.user.findMany();
  }

  async register(data: Partial<User>) {
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

    this.logger.info(`User (${data.username}) created successfully`);

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
}
