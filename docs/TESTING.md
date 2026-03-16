# Testing Guide

## Overview

This project uses **Jest** for testing with **90% coverage threshold** required. Tests are co-located with source files using `.spec.ts` extension.

## Running Tests

```bash
# Unit tests
bun run test

# Watch mode
bun run test:watch

# With coverage (required before commit)
bun run test:cov

# E2E tests
bun run test:e2e
```

## Test Structure

```
src/
├── __mocks__/                    # Global mocks
│   └── prisma.service.ts         # Prisma mock
├── test-utils/                   # Test utilities
│   ├── create-mock-module.ts     # Module helpers
│   ├── mock-users.ts             # User fixtures
│   └── constants.ts              # Test constants
├── auth/
│   ├── auth.service.ts
│   └── auth.service.spec.ts     # Unit tests
└── _common/
    ├── validation/
    │   ├── validation.service.ts
    │   └── validation.service.spec.ts
    └── response/
        ├── response.service.ts
        └── response.service.spec.ts
```

## Writing Unit Tests

### Basic Service Test

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { MyService } from "./my.service.js";

describe("MyService", () => {
  let service: MyService;

  const mockMyDependency = {
    method: jest.fn().mockResolvedValue("mocked"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        { provide: MyDependency, useValue: mockMyDependency },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return mocked value", async () => {
    const result = await service.myMethod();
    expect(result).toBe("mocked");
  });
});
```

### Testing Auth Service

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service.js";
import { PrismaService } from "src/_common/prisma/prisma.service.js";
import { JwtService } from "@nestjs/jwt";
import { mockUsers, mockRoles } from "src/test-utils/mock-users.js";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mock-token"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return token and user on valid credentials", async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        ...mockUsers.user,
        role: mockRoles.user,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        username: "testuser",
        password: "password123",
      });

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("user");
    });

    it("should throw on invalid credentials", async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ username: "wrong", password: "wrong" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

## Test Utilities

### Using Mock Users

```typescript
import {
  mockUsers,
  mockRoles,
  createMockUser,
} from "src/test-utils/mock-users.js";

const admin = mockUsers.admin;
const user = createMockUser({ username: "custom" });
```

### Using Test Constants

```typescript
import { TEST_CONSTANTS } from "src/test-utils/constants.js";

expect(statusCode).toBe(TEST_CONSTANTS.HTTP_STATUS.OK);
```

### Using Prisma Mock

```typescript
import { PrismaService } from "src/_common/prisma/prisma.service.js";
import { PrismaServiceMock } from "src/__mocks__/prisma.service.js";

const module = await Test.createTestingModule({
  providers: [
    MyService,
    { provide: PrismaService, useValue: PrismaServiceMock },
  ],
}).compile();
```

## Jest Configuration

```javascript
// jest.config.js
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/generated/**"],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

## Coverage Report

Run coverage to see detailed report:

```bash
bun run test:cov
```

This generates:

- `coverage/lcov-report/` - HTML report
- `coverage/coverage-final.json` - Raw data
- Console output with summary

## Best Practices

### 1. Test Each Case

```typescript
describe("method", () => {
  it("should return X when Y", async () => {
    /* ... */
  });
  it("should throw error when Z", async () => {
    /* ... */
  });
  it("should handle edge case", async () => {
    /* ... */
  });
});
```

### 2. Use Descriptive Names

```typescript
// ✅ Good
it("should return user with role when valid id provided");

// ❌ Bad
it("should work", () => {
  /* ... */
});
```

### 3. Reset Mocks

```typescript
// jest.setup.ts handles this automatically
afterEach(() => {
  jest.clearAllMocks();
});
```

### 4. Test Error Handling

```typescript
it("should throw NotFoundException when user not found", async () => {
  mockPrisma.user.findUnique.mockResolvedValue(null);

  await expect(service.findOne("invalid-id")).rejects.toThrow(
    NotFoundException,
  );
});
```

### 5. Avoid Test Interdependence

```typescript
// Each test should be independent
beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.user.findUnique.mockReset();
});
```

## E2E Testing

```typescript
// test/app.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/v1/auth/login (POST)", async () => {
    const response = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ username: "admin", password: "password123" })
      .expect(201);

    expect(response.body).toHaveProperty("payload");
  });
});
```
