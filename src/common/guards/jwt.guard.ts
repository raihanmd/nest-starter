import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { ApiSecret } from "../decorators/api-secret.decorator";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  constructor(
    private readonly reflector: Reflector,
    // private readonly configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get(Public, context.getHandler());
    if (!!isPublic) return true;

    const validJwt = await super.canActivate(context);

    if (!validJwt) return false;

    const isNeedApiSecret = this.reflector.get(ApiSecret, context.getHandler());

    if (!isNeedApiSecret) {
      return true;
    }

    const roles: string[] = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }

    const user = context.switchToHttp().getRequest().user;

    if (!user) return false;

    return roles.indexOf(user.role) != -1;
  }
}
