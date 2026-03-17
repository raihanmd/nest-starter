import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt, JwtPayload } from "passport-jwt";
import { EUserRole } from "src/types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("JWT_SECRET") ?? "default-secret",
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): {
    userId: string;
    username: string;
    role: EUserRole;
  } {
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role as EUserRole,
    };
  }
}
