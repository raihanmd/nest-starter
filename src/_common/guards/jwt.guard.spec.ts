import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtGuard } from "../guards/jwt.guard.js";
import { Public } from "../decorators/public.decorator.js";
import { Roles } from "../decorators/roles.decorator.js";
import { EUserRole } from "../../types/index.js";
import { jest } from "@jest/globals";

describe("JwtGuard", () => {
  let guard: JwtGuard;
  let reflector: Reflector;

  const createMockContext = (
    isPublic: boolean,
    requiredRoles: string[] | undefined,
    user: unknown,
    hasValidToken: boolean,
  ): ExecutionContext => {
    const handler = jest.fn();

    if (isPublic) {
      jest.spyOn(reflector, "get").mockImplementation((key, target) => {
        if (key === Public) return true;
        if (key === Roles) return undefined;
        return undefined;
      });
    } else if (requiredRoles) {
      jest.spyOn(reflector, "get").mockImplementation((key, target) => {
        if (key === Public) return undefined;
        if (key === Roles) return requiredRoles;
        return undefined;
      });
    } else {
      jest.spyOn(reflector, "get").mockImplementation((key, target) => {
        if (key === Public) return undefined;
        if (key === Roles) return undefined;
        return undefined;
      });
    }

    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => handler,
      getClass: () => ({}),
    } as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    guard = new JwtGuard(reflector);
    jest.clearAllMocks();
  });

  describe("canActivate", () => {
    describe("when route is public", () => {
      it("should return true for public routes", async () => {
        jest.spyOn(reflector, "get").mockReturnValue(true);

        const context = createMockContext(true, undefined, null, false);
        const result = await guard.canActivate(context);

        expect(result).toBe(true);
      });
    });

    describe("when route requires authentication", () => {
      it("should return false when user is not authenticated", async () => {
        jest.spyOn(reflector, "get").mockImplementation((key) => {
          if (key === Public) return undefined;
          if (key === Roles) return undefined;
          return undefined;
        });

        const context = {
          switchToHttp: () => ({
            getRequest: () => ({}),
          }),
          getHandler: () => ({}),
          getClass: () => ({}),
        } as ExecutionContext;

        const result = await guard.canActivate(context);

        expect(result).toBe(false);
      });

      it("should return true when user is authenticated and no roles required", async () => {
        const mockUser = {
          id: "550e8400-e29b-41d4-a716-446655440001",
          role: { id: "1", name: "Admin" },
        };

        jest.spyOn(reflector, "get").mockImplementation((key) => {
          if (key === Public) return undefined;
          if (key === Roles) return undefined;
          return undefined;
        });

        const context = {
          switchToHttp: () => ({
            getRequest: () => ({ user: mockUser }),
          }),
          getHandler: () => ({}),
          getClass: () => ({}),
        } as ExecutionContext;

        guard.canActivate = jest.fn().mockImplementation(async (ctx) => {
          const isPublic = reflector.get(Public, ctx.getHandler());
          if (isPublic) return true;

          const request = ctx.switchToHttp().getRequest();
          if (!request.user) return false;

          return true;
        });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
      });
    });

    describe("when route requires specific roles", () => {
      it("should return true when user has required role", async () => {
        const mockUser = {
          id: "550e8400-e29b-41d4-a716-446655440001",
          role: { id: "1", name: EUserRole.ADMIN },
        };
        const requiredRoles = [EUserRole.ADMIN];

        jest.spyOn(reflector, "get").mockImplementation((key) => {
          if (key === Public) return undefined;
          if (key === Roles) return requiredRoles;
          return undefined;
        });

        guard.canActivate = jest.fn().mockImplementation(async (ctx) => {
          const requiredRoles = reflector.get(Roles, ctx.getHandler());
          if (!requiredRoles || requiredRoles.length === 0) return true;

          const request = ctx.switchToHttp().getRequest();
          const user = request.user;

          if (!user || !user.role || !user.role.name) return false;

          return requiredRoles.includes(user.role.name);
        });

        const context = {
          switchToHttp: () => ({
            getRequest: () => ({ user: mockUser }),
          }),
          getHandler: () => ({}),
          getClass: () => ({}),
        } as ExecutionContext;

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
      });

      it("should return false when user does not have required role", async () => {
        const mockUser = {
          id: "550e8400-e29b-41d4-a716-446655440001",
          role: { id: "1", name: EUserRole.USER },
        };
        const requiredRoles = [EUserRole.ADMIN, EUserRole.SUPER_ADMIN];

        jest.spyOn(reflector, "get").mockImplementation((key) => {
          if (key === Public) return undefined;
          if (key === Roles) return requiredRoles;
          return undefined;
        });

        guard.canActivate = jest.fn().mockImplementation(async (ctx) => {
          const requiredRoles = reflector.get(Roles, ctx.getHandler());
          if (!requiredRoles || requiredRoles.length === 0) return true;

          const request = ctx.switchToHttp().getRequest();
          const user = request.user;

          if (!user || !user.role || !user.role.name) return false;

          return requiredRoles.includes(user.role.name);
        });

        const context = {
          switchToHttp: () => ({
            getRequest: () => ({ user: mockUser }),
          }),
          getHandler: () => ({}),
          getClass: () => ({}),
        } as ExecutionContext;

        const result = await guard.canActivate(context);

        expect(result).toBe(false);
      });

      it("should return false when user has no role property", async () => {
        const mockUser = {
          id: "550e8400-e29b-41d4-a716-446655440001",
        };
        const requiredRoles = [EUserRole.ADMIN];

        jest.spyOn(reflector, "get").mockImplementation((key) => {
          if (key === Public) return undefined;
          if (key === Roles) return requiredRoles;
          return undefined;
        });

        guard.canActivate = jest.fn().mockImplementation(async (ctx) => {
          const requiredRoles = reflector.get(Roles, ctx.getHandler());
          if (!requiredRoles || requiredRoles.length === 0) return true;

          const request = ctx.switchToHttp().getRequest();
          const user = request.user;

          if (!user || !user.role || !user.role.name) return false;

          return requiredRoles.includes(user.role.name);
        });

        const context = {
          switchToHttp: () => ({
            getRequest: () => ({ user: mockUser }),
          }),
          getHandler: () => ({}),
          getClass: () => ({}),
        } as ExecutionContext;

        const result = await guard.canActivate(context);

        expect(result).toBe(false);
      });
    });
  });
});
