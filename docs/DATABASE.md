# Database Guide

## Overview

This project uses **Prisma ORM** with PostgreSQL. Prisma v7 uses the adapter pattern for database connections.

## Schema

The database schema is defined in `prisma/schema.prisma`:

```prisma
model User {
  id         String   @id @default(uuid()) @db.Uuid
  role_id    String?  @db.Uuid
  username   String?  @unique @db.VarChar(255)
  password   String   @db.VarChar(1000)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  role Role? @relation(fields: [role_id], references: [id])

  @@map("users")
}

model Role {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique
  description String?  @db.VarChar(255)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  users User[]

  @@map("roles")
}
```

## Configuration

### Environment Variables

| Variable            | Description         | Example                                       |
| ------------------- | ------------------- | --------------------------------------------- |
| `DATABASE_URL`      | Production database | `postgres://user:pass@localhost:5435/db`      |
| `DATABASE_URL_TEST` | Test database (E2E) | `postgres://user:pass@localhost:5435/db_test` |

### Prisma Config

Database connection is configured in `prisma.config.ts`:

```typescript
// prisma.config.ts
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
```

## Commands

### Generate Prisma Client

```bash
bun run prisma:generate
# or
bunx prisma generate
```

### Run Migrations

```bash
# Development - creates migration and applies
bunx prisma migrate dev --name init

# Production - applies pending migrations
bun run prisma:migrate

# Reset database (dev only!)
bun run prisma:reset
```

### Database Studio

```bash
bun run prisma:studio
```

Opens a web interface to browse your data.

## Using PrismaService

### Basic Queries

```typescript
import { PrismaService } from "src/_common/prisma/prisma.service.js";

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.user.findMany();
  }

  async findById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserDto) {
    return this.prismaService.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
      },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
```

### With Relations

```typescript
// Include related records
const userWithRole = await this.prismaService.user.findUnique({
  where: { id },
  include: { role: true },
});

// Filter by relation
const adminUsers = await this.prismaService.user.findMany({
  where: {
    role: { name: "Admin" },
  },
});
```

### Omit Fields

```typescript
// Exclude sensitive fields
const userWithoutPassword = await this.prismaService.user.findUnique({
  where: { id },
  omit: { password: true },
});
```

### Pagination

```typescript
async findPaginated(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prismaService.user.findMany({
      skip,
      take: limit,
    }),
    this.prismaService.user.count(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### Transactions

```typescript
const result = await this.prismaService.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.activityLog.create({
    data: { action: "user_created", userId: user.id },
  });
  return user;
});
```

## Error Handling

Prisma errors are handled by `ErrorFilter`:

| Error Code | HTTP Status | Message                       |
| ---------- | ----------- | ----------------------------- |
| P2002      | 409         | Data already exists           |
| P2003      | 400         | Foreign key constraint failed |
| P2025      | 404         | Record not found              |

## Seeding

```bash
bun run seed
```

Seed data in `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create roles
  await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin", description: "Administrator" },
  });

  await prisma.role.upsert({
    where: { name: "User" },
    update: {},
    create: { name: "User", description: "Regular User" },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Testing with Database

For E2E tests, use a separate test database:

```bash
# Set test environment
export NODE_ENV=test
# or
cp .env.test .env.test.local
```

E2E tests automatically use `DATABASE_URL_TEST` when `NODE_ENV=test`.
