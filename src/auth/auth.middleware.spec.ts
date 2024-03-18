import { PrismaService } from "src/prisma/prisma.service";
import { AuthMiddleware } from "./auth.middleware";

describe("AuthMiddleware", () => {
  it("should be defined", () => {
    expect(new AuthMiddleware(new PrismaService())).toBeDefined();
  });
});
