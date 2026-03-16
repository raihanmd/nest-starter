# NestJS Starter - AI Agent Instructions

This document provides instructions for AI agents working on this NestJS starter project.

## Project Overview

A production-ready NestJS backend starter with:

- **JWT Authentication** - Stateless authentication using JWT tokens
- **RBAC (Role-Based Access Control)** - Role-based authorization with guards
- **Zod Validation** - Type-safe request validation using Zod schemas
- **Prisma ORM** - Database abstraction with PostgreSQL
- **ESM Modules** - Modern ECMAScript Modules support

## Quick Start

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run prisma:generate

# Run database migrations
bun run prisma:migrate

# Seed database (optional)
bun run seed

# Start development server
bun run dev

# Run tests
bun run test

# Run tests with coverage (90% threshold required)
bun run test:cov
```

## Project Structure

```
src/
├── _common/                    # Shared infrastructure
│   ├── decorators/             # Custom decorators (Public, Roles)
│   ├── error/                  # Global exception filter
│   ├── guards/                 # Auth guards (JwtGuard)
│   ├── middleware/             # Middleware (ApiKeyMiddleware)
│   ├── pipes/                  # Validation pipes (ZodValidationPipe)
│   ├── prisma/                 # Prisma service
│   ├── response/               # Response formatting
│   ├── strategies/             # Passport strategies
│   ├── validation/             # Zod validation service
│   └── common.module.ts        # Global module
├── auth/                       # Authentication module
│   ├── auth.controller.ts      # Auth endpoints
│   ├── auth.service.ts         # Auth business logic
│   ├── auth.module.ts          # Auth module
│   └── zod/                    # Auth validation schemas
├── types/                      # TypeScript types
├── test-utils/                 # Testing utilities
├── __mocks__/                  # Mock services
├── generated/                 # Prisma generated files
├── app.module.ts              # Root module
└── main.ts                    # Application entry point
```

## Environment Configuration

### Required Environment Variables

| Variable            | Description                  | Example                                       |
| ------------------- | ---------------------------- | --------------------------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string | `postgres://user:pass@localhost:5432/db`      |
| `DATABASE_URL_TEST` | Test database URL (E2E)      | `postgres://user:pass@localhost:5432/db_test` |
| `SERVER_PORT`       | Server port                  | `3000`                                        |
| `JWT_SECRET`        | JWT signing secret           | (generate strong random string)               |
| `API_KEY`           | API key for middleware       | (generate random string)                      |

### Creating Environment Files

```bash
# Production/Development
cp .env.example .env

# Testing (E2E tests use this automatically)
cp .env.test .env.test
```

## How To: Add New Endpoints

### Step 1: Define Zod Validation Schema

Create a new file in `src/{module}/zod/` or add to existing:

```typescript
// src/users/zod/index.ts
import { z } from "zod";

export class UsersValidation {
  static CREATE = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8),
    roleId: z.string().uuid().optional(),
  });

  static UPDATE = this.CREATE.partial();

  static QUERY = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
  });
}

export type CreateUserPayload = z.infer<typeof UsersValidation.CREATE>;
export type UpdateUserPayload = z.infer<typeof UsersValidation.UPDATE>;
export type QueryUserPayload = z.infer<typeof UsersValidation.QUERY>;
```

### Step 2: Create/Update Service

```typescript
// src/users/users.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/_common/prisma/prisma.service.js";
import { CreateUserPayload, UpdateUserPayload } from "./zod/index.js";

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateUserPayload) {
    return this.prismaService.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password, // Hash this in production!
        role_id: data.roleId,
      },
    });
  }

  async findAll(query: QueryUserPayload) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaService.user.findMany({
        skip,
        take: limit,
        where: search
          ? {
              OR: [
                { username: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : undefined,
      }),
      this.prismaService.user.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async update(id: string, data: UpdateUserPayload) {
    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prismaService.user.delete({ where: { id } });
  }
}
```

### Step 3: Create Controller

```typescript
// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service.js";
import {
  UsersValidation,
  CreateUserPayload,
  QueryUserPayload,
} from "./zod/index.js";
import { ZodValidationPipeFactory } from "src/_common/pipes/zod-validation-validation-pipe.js";
import { ResponseService } from "src/_common/response/response.service.js";
import { Roles } from "src/_common/decorators/roles.decorator.js";
import { EUserRole } from "src/types/index.js";

@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
  async create(
    @Body(ZodValidationPipeFactory(UsersValidation.CREATE))
    createUserDto: CreateUserPayload,
  ) {
    const data = await this.usersService.create(createUserDto);
    return this.responseService.success(data);
  }

  @Get()
  async findAll(
    @Query(ZodValidationPipeFactory(UsersValidation.QUERY))
    query: QueryUserPayload,
  ) {
    const result = await this.usersService.findAll(query);
    return this.responseService.pagination(result.data, result.meta);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const data = await this.usersService.findOne(id);
    return this.responseService.success(data);
  }

  @Put(":id")
  @Roles([EUserRole.ADMIN])
  async update(
    @Param("id") id: string,
    @Body(ZodValidationPipeFactory(UsersValidation.UPDATE))
    updateUserDto: Partial<CreateUserPayload>,
  ) {
    const data = await this.usersService.update(id, updateUserDto);
    return this.responseService.success(data);
  }

  @Delete(":id")
  @Roles([EUserRole.SUPER_ADMIN])
  async delete(@Param("id") id: string) {
    await this.usersService.delete(id);
    return this.responseService.success({ deleted: true });
  }
}
```

### Step 4: Create Module

```typescript
// src/users/users.module.ts
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### Step 5: Register Module in AppModule

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { CommonModule } from "./_common/common.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [CommonModule, AuthModule, UsersModule],
})
export class AppModule {}
```

### Step 6: Write Unit Tests

```typescript
// src/users/users.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service.js";
import { PrismaService } from "src/_common/prisma/prisma.service.js";
import { mockUsers } from "src/test-utils/mock-users.js";

describe("UsersService", () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe("create", () => {
    it("should create a user", async () => {
      const createData = {
        username: "newuser",
        email: "new@test.com",
        password: "password123",
      };

      mockPrismaService.user.create.mockResolvedValue({
        id: "1",
        ...createData,
      });

      const result = await service.create(createData);

      expect(result).toHaveProperty("id");
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });
  });
});
```

## Validation Flow

```
Request → ZodValidationPipe → ValidationService → Controller
                ↓
         Zod Schema Validation
                ↓
         Error → ErrorFilter → JSON Response
```

### Using Validation Pipes

```typescript
// Simple validation
@Body(ZodValidationPipeFactory(SchemaClass.VALIDATION))
data: ValidationType

// File validation
@UseInterceptors(FileInterceptor('file'))
@Body(ZodValidationPipeFactory(DataSchema))
@UploadedFile(FileValidationPipeFactory('IMAGE'))
file: Express.Multer.File
```

## RBAC Implementation

### Available Roles

```typescript
import { EUserRole } from "src/types/index.js";

EUserRole.SUPER_ADMIN; // Super Administrator
EUserRole.ADMIN; // Administrator
EUserRole.USER; // Regular User
```

### Decorators

```typescript
// Make endpoint public (no auth required)
@Public()
@Get('public-endpoint')
async publicEndpoint() {}

// Require specific roles
@Roles([EUserRole.ADMIN])
@Post('admin-only')
async adminOnly() {}

// Multiple roles
@Roles([EUserRole.ADMIN, EUserRole.SUPER_ADMIN])
@Delete('user/:id')
async deleteUser() {}
```

### How JwtGuard Works

1. **Check Public**: If `@Public()` decorator is present, allow access
2. **Validate JWT**: If no token or invalid token, deny access
3. **Check Roles**: If `@Roles()` decorator is present, verify user has required role
4. **Allow**: If all checks pass, allow access

## Database

### Schema Location

`prisma/schema.prisma`

### Running Migrations

```bash
# Create migration
bunx prisma migrate dev --name init

# Apply migrations
bun run prisma:migrate

# Reset database (dev only!)
bun run prisma:reset

# Open Prisma Studio (GUI)
bun run prisma:studio
```

### Prisma Service Usage

```typescript
import { PrismaService } from "src/_common/prisma/prisma.service.js";

@Injectable()
export class SomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async someOperation() {
    // Standard queries
    const users = await this.prismaService.user.findMany();

    // With relations
    const user = await this.prismaService.user.findUnique({
      where: { id: "1" },
      include: { role: true },
    });

    // With omit (exclude fields)
    const userWithoutPassword = await this.prismaService.user.findUnique({
      where: { id: "1" },
      omit: { password: true },
    });
  }
}
```

## Testing

### Running Tests

```bash
# Unit tests
bun run test

# Watch mode
bun run test:watch

# With coverage (90% threshold required)
bun run test:cov

# E2E tests
bun run test:e2e

# E2E watch mode
bun run test:e2e:watch
```

### Test Structure

- Unit tests: `src/**/*.spec.ts`
- E2E tests: `test/**/*.e2e-spec.ts`
- Test config: `jest.config.js`
- Test setup: `jest.setup.ts`

### Test Utilities

Available in `src/test-utils/`:

```typescript
import {
  createMockModule,
  mockUsers,
  mockRoles,
  createMockUser,
  TEST_CONSTANTS,
} from "src/test-utils/index.js";
```

### Prisma Mock

```typescript
import { PrismaService } from 'src/_common/prisma/prisma.service.js';
import { PrismaServiceMock } from 'src/__mocks__/prisma.service.js';

// In Test.createTestingModule
{
  provide: PrismaService,
  useValue: PrismaServiceMock,
}
```

## API Response Format

### Success Response

```json
{
  "payload": {
    "id": "1",
    "name": "Example"
  }
}
```

### Paginated Response

```json
{
  "payload": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "message": "Error description",
  "error": "Error Type",
  "statusCode": 400
}
```

## Common Issues

### ESM Import Errors

If you get import errors, ensure you're using `.js` extensions:

```typescript
// ✅ Correct (ESM)
import { AuthService } from "./auth.service.js";

// ❌ Wrong
import { AuthService } from "./auth.service";
```

### Prisma Client Not Generated

```bash
bun run prisma:generate
```

### Test Database Not Found

Ensure `.env.test` exists with `DATABASE_URL_TEST` variable.

## Available Scripts

| Script                    | Description               |
| ------------------------- | ------------------------- |
| `bun run dev`             | Start development server  |
| `bun run build`           | Build for production      |
| `bun run start:prod`      | Start production server   |
| `bun run test`            | Run unit tests            |
| `bun run test:cov`        | Run tests with coverage   |
| `bun run test:e2e`        | Run E2E tests             |
| `bun run lint`            | Run ESLint                |
| `bun run format`          | Format code with Prettier |
| `bun run prisma:generate` | Generate Prisma client    |
| `bun run prisma:migrate`  | Run migrations            |
| `bun run seed`            | Seed database             |

## Documentation

For more details, see:

- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [RBAC Guide](docs/RBAC.md)
- [Validation Guide](docs/VALIDATION.md)
- [Database Guide](docs/DATABASE.md)
- [Testing Guide](docs/TESTING.md)
