import * as bcrypt from "bcrypt";
import { Logger } from "winston";
import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { JwtService } from "@nestjs/jwt";

import { PrismaService } from "src/common/prisma/prisma.service";
import { ValidationService } from "src/common/validation/validation.service";
import {
  AuthLoginPayload,
  AuthRegisterPayload,
  AuthWhatsAppAgentPayload,
  UsersValidation,
} from "./zod";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { TinyUrlService } from "src/common/tiny-url/tiny-url.service";

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly validationService: ValidationService,
    private readonly configService: ConfigService,
    private readonly tinyUrlService: TinyUrlService,
  ) {}

  async register(data: AuthRegisterPayload) {
    const registerUser = this.validationService.validate(
      UsersValidation.RESGISTER,
      data,
    );

    const result = await this.prismaService.$transaction(async (tx) => {
      const isUserExist = await tx.user.findFirst({
        where: {
          phone: registerUser.phone,
        },
      });

      if (isUserExist) throw new ForbiddenException("User already exist");

      registerUser.password = await bcrypt.hash(
        registerUser.password as string,
        10,
      );

      this.logger.info(`Register User: ${registerUser.phone}`);

      const school = await tx.school.create({
        data: {
          name: registerUser.school_name,
          max_students: +this.configService.get("MAX_STUDENTS_DEFAULT")!,
          max_users: +this.configService.get("MAX_USERS_DEFAULT")!, //
          address: "",
        },
        select: {
          id: true,
          name: true,
        },
      });

      const orgAdminRole = await tx.role.findUniqueOrThrow({
        where: { name: "Organization Admin", is_system: false },
        select: {
          id: true,
        },
      });

      const user = await tx.user.create({
        data: {
          phone: registerUser.phone,
          password: registerUser.password as string,
          school_members: {
            create: {
              school_id: school.id,
              role_id: orgAdminRole.id,
            },
          },
          user_role: {
            create: {
              role: {
                connect: {
                  name: "Member",
                },
              },
            },
          },
        },
        select: {
          id: true,
          phone: true,
          user_role: {
            select: {
              role_id: true,
            },
          },
        },
      });

      const permissions = await tx.permission.findMany({
        where: {
          role_permissions: {
            every: {
              role_id: user.user_role!.role_id,
            },
          },
        },
        select: {
          name: true,
        },
      });

      const attendaceModule = await tx.module.findUniqueOrThrow({
        where: { name: "ENROLLMENT" },
        select: {
          id: true,
        },
      });

      const plan = await tx.plan.findUniqueOrThrow({
        where: { name: "FREE" },
        select: {
          id: true,
        },
      });

      await tx.schoolModule.create({
        data: {
          school_id: school.id,
          module_id: attendaceModule.id,
          plan_id: plan.id,
          is_active: true,
          activated_at: new Date(),
        },
      });

      return {
        user,
        permissions,
      };
    });

    return {
      token: this.jwtService.sign({
        user: {
          id: result.user.id,
          phone: result.user.phone,
        },
        permissions: result.permissions,
      }),
      user: result.user,
    };
  }

  async login(data: AuthLoginPayload) {
    const loginUser = this.validationService.validate(
      UsersValidation.LOGIN,
      data,
    );

    const user = await this.prismaService.user.findFirst({
      where: {
        phone: loginUser.phone,
      },
      select: {
        id: true,
        phone: true,
        password: true,
        user_role: true,
      },
    });

    if (!user) throw new UnauthorizedException("Username or password wrong");

    const isMatch = await bcrypt.compare(
      loginUser.password as string,
      user.password,
    );

    if (!isMatch) throw new UnauthorizedException("Username or password wrong");

    this.logger.info(`Login User: ${user.phone}`);

    const permissions = await this.prismaService.permission.findMany({
      where: {
        role_permissions: {
          every: {
            role_id: user.user_role!.role_id,
          },
        },
      },
      select: {
        name: true,
      },
    });

    return {
      token: this.jwtService.sign({
        user: {
          id: user.id,
          phone: user.phone,
        },
        permissions: permissions,
      }),
      user,
    };
  }

  async authWithWhatsappAgent(data: AuthWhatsAppAgentPayload) {
    const authUser = this.validationService.validate(
      UsersValidation.AUTH_WHATSAPP_AGENT,
      data,
    );

    const token = await this.prismaService.loginToken.create({
      data: {
        phone: authUser?.phone,
      },
      select: {
        token: true,
      },
    });

    const hostname =
      this.configService.get("NODE_ENV") === "production"
        ? "https://domain.com"
        : "http://localhost:3000";

    // return await this.tinyUrlService.shortener(
    //   `${hostname}/auth/${token.token}`,
    // );
  }

  async logout(res: Response) {
    res.clearCookie("token");

    return "Logout Success";
  }
}
