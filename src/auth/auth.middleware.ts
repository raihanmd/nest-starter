import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}
  async use(req: any, res: any, next: () => void) {
    const token = req.headers["token"] as string;
    if (!token) {
      throw new UnauthorizedException("Unauthorized");
    }

    const user = await this.prismaService.user.findFirst({
      where: {
        token,
      },
    });

    if (user) {
      req.user = { role: user.role };
      next();
    } else {
      throw new UnauthorizedException("Unauthorized");
    }
  }
}
