# Role-Based Access Control (RBAC) Guide

## Overview

This project implements Role-Based Access Control (RBAC) using custom decorators and guards. All endpoints are protected by default and require authentication unless explicitly marked as public.

## User Roles

| Role          | Description         | Access Level                 |
| ------------- | ------------------- | ---------------------------- |
| `Super Admin` | Super Administrator | Full access to all endpoints |
| `Admin`       | Administrator       | Management access            |
| `User`        | Regular User        | Basic access                 |

Defined in `src/types/index.ts`:

```typescript
export enum EUserRole {
  SUPER_ADMIN = "Super Admin",
  ADMIN = "Admin",
  USER = "User",
}
```

## How It Works

### 1. JwtGuard

The `JwtGuard` is registered globally in `CommonModule` and handles authentication for all routes:

```typescript
// src/_common/common.module.ts
{
  provide: APP_GUARD,
  useClass: JwtGuard,
}
```

The guard performs three checks:

1. **Public Check** - Is the route marked with `@Public()`?
2. **JWT Validation** - Is the token valid?
3. **Role Check** - Does the user have the required role?

### 2. Public Decorator

Mark endpoints as public (no authentication required):

```typescript
import { Public } from "src/_common/decorators/public.decorator.js";

@Controller("auth")
export class AuthController {
  @Public()
  @Post("login")
  async login() {
    /* ... */
  }
}
```

### 3. Roles Decorator

Require specific roles for endpoint access:

```typescript
import { Roles } from "src/_common/decorators/roles.decorator.js";
import { EUserRole } from "src/types/index.js";

@Controller("users")
export class UsersController {
  @Roles([EUserRole.ADMIN])
  @Delete(":id")
  async deleteUser(@Param("id") id: string) {
    /* ... */
  }

  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  @Post()
  async createUser(@Body() data: CreateUserDto) {
    /* ... */
  }
}
```

## Decorator Flow

```
Request
    │
    ▼
JwtGuard.canActivate()
    │
    ├─► @Public() present?
    │       └─► YES → Allow access
    │
    ├─► Valid JWT?
    │       └─► NO → Deny (401)
    │
    ├─► @Roles() present?
    │       └─► NO → Allow access
    │
    └─► User has required role?
            └─► NO → Deny (403)
            └─► YES → Allow access
```

## Examples

### Public Endpoint (No Auth)

```typescript
@Public()
@Get('health')
async health() {
  return { status: 'ok' };
}
```

### Protected Endpoint (Any Authenticated User)

```typescript
@Get('profile')
async getProfile(@Req() req: ReqWithUser) {
  return this.userService.findById(req.user.id);
}
```

### Admin-Only Endpoint

```typescript
@Roles([EUserRole.ADMIN])
@Get('users')
async listUsers() {
  return this.userService.findAll();
}
```

### Super Admin or Admin

```typescript
@Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
@Delete('users/:id')
async deleteUser(@Param('id') id: string) {
  return this.userService.delete(id);
}
```

## User Object Structure

After JWT validation, the request object contains:

```typescript
interface ReqWithUser {
  user: {
    id: string;
    role: {
      id: string;
      name: string; // 'Admin' | 'User' | 'Super Admin'
    };
  };
}
```

## Testing RBAC

```typescript
describe("JwtGuard", () => {
  it("should allow public routes without token", async () => {
    jest.spyOn(reflector, "get").mockReturnValue(true);
    const result = await guard.canActivate(publicContext);
    expect(result).toBe(true);
  });

  it("should deny access without required role", async () => {
    jest.spyOn(reflector, "get").mockReturnValue([EUserRole.ADMIN]);
    const result = await guard.canActivate(userContext); // User has 'User' role
    expect(result).toBe(false);
  });

  it("should allow access with required role", async () => {
    jest.spyOn(reflector, "get").mockReturnValue([EUserRole.ADMIN]);
    const result = await guard.canActivate(adminContext); // User has 'Admin' role
    expect(result).toBe(true);
  });
});
```

## Best Practices

1. **Default to Private** - All endpoints should require auth by default
2. **Use `@Public()` sparingly** - Only for login, health checks, etc.
3. **Follow least privilege** - Grant minimum required roles
4. **Test role combinations** - Ensure role hierarchy works correctly
5. **Validate roles in services** - Don't rely solely on guards for business logic
