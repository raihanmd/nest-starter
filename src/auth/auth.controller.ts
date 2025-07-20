import { Body, Controller, HttpCode, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ResponseService } from "src/common/response/response.service";
import { Public } from "src/common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import {
  AuthLoginPayload,
  AuthRegisterPayload,
  AuthWhatsAppAgentPayload,
} from "./zod";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";

@ApiTags("Users")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
    private readonly configService: ConfigService,
  ) {}

  @HttpCode(200)
  @Public()
  @Post("register")
  async register(@Body() loginReq: AuthRegisterPayload, @Res() res: Response) {
    const data = await this.authService.register(loginReq);

    res.cookie("token", data.token, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "strict",
    });

    return res.json(this.responseService.success(res));
  }

  @HttpCode(200)
  @Public()
  @Post("login")
  async login(@Body() loginReq: AuthLoginPayload, @Res() res: Response) {
    const data = await this.authService.login(loginReq);

    res.cookie("token", data.token, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "strict",
    });

    return res.json(this.responseService.success(res));
  }

  @HttpCode(200)
  @Public()
  @Post("auth/whatsapp-agent")
  async authWithWhatsappAgent(@Body() authReq: AuthWhatsAppAgentPayload) {
    const data = await this.authService.authWithWhatsappAgent(authReq);

    return this.responseService.success(data);
  }
}
