import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtGuard } from "../guards/jwt.guard";
import { Public } from "../decorators/public.decorator";
import { Roles } from "../decorators/roles.decorator";
import { EUserRole } from "../../types/index";

describe("JwtGuard", () => {
  let guard: JwtGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    guard = new JwtGuard(reflector);
  });

  describe("canActivate", () => {
    describe("when route is public", () => {
      it("should return true for public routes", async () => {
        jest.spyOn(reflector, "get").mockReturnValue(true);

        const context = {
          switchToHttp: () => ({ getRequest: () => ({}) }),
          getHandler: () => ({}),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });
    });

    describe("when route requires authentication", () => {
      it("should return false when user is not authenticated", async () => {
        jest.spyOn(reflector, "get").mockReturnValue(undefined);

        const context = {
          switchToHttp: () => ({ getRequest: () => ({}) }),
          getHandler: () => ({}),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(false);
      });

      it("should return true when user is authenticated", async () => {
        jest.spyOn(reflector, "get").mockReturnValue(undefined);

        const context = {
          switchToHttp: () => ({
            getRequest: () => ({ user: { id: "1", role: { name: "Admin" } } }),
          }),
          getHandler: () => ({}),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });
    });

    describe("when route requires specific roles", () => {
      it("should return true when user has required role", async () => {
        jest.spyOn(reflector, "get").mockImplementation((key) => {
          if (key === Public) return undefined;
          if (key === Roles) return [EUserRole.ADMIN];
          return undefined;
        });

        const context = {
          switchToHttp: () => ({
            getRequest: () => ({
              user: { id: "1", role: { name: EUserRole.ADMIN } },
            }),
          }),
          getHandler: () => ({}),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
      });

      it("should return false when user does not have required role", async () => {
        jest.spyOn(reflector, "get").mockImplementation((key) => {
          if (key === Public) return undefined;
          if (key === Roles) return [EUserRole.ADMIN, EUserRole.SUPER_ADMIN];
          return undefined;
        });

        const context = {
          switchToHttp: () => ({
            getRequest: () => ({
              user: { id: "1", role: { name: EUserRole.USER } },
            }),
          }),
          getHandler: () => ({}),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(false);
      });

      it("should return false when user has no role property", async () => {
        jest.spyOn(reflector, "get").mockImplementation((key) => {
          if (key === Public) return undefined;
          if (key === Roles) return [EUserRole.ADMIN];
          return undefined;
        });

        const context = {
          switchToHttp: () => ({
            getRequest: () => ({ user: { id: "1" } }),
          }),
          getHandler: () => ({}),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(false);
      });
    });
  });
});
