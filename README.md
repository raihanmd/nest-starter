<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<h1 align="center">NestJS Starter</h1>

<p align="center">
  Production-ready NestJS backend starter with JWT authentication, RBAC, Zod validation, and Prisma ORM.
</p>

<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/-NestJS-red?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/-TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
  <a href="https://www.prisma.io/" target="_blank">
    <img src="https://img.shields.io/badge/-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  </a>
  <a href="https://jestjs.io/" target="_blank">
    <img src="https://img.shields.io/badge/-Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  </a>
</p>

## Features

- **JWT Authentication** - Stateless authentication using JWT tokens
- **RBAC (Role-Based Access Control)** - Role-based authorization with guards
- **Zod Validation** - Type-safe request validation using Zod schemas
- **Prisma ORM** - Database abstraction with PostgreSQL
- **ESM Modules** - Modern ECMAScript Modules support
- **Rate Limiting** - API protection with @nestjs/throttler
- **Global Error Handling** - Unified error response format
- **Comprehensive Testing** - 90% coverage threshold with Jest

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Generate Prisma client
bun run prisma:generate

# Run database migrations
bun run prisma:migrate

# Seed database (optional)
bun run seed

# Start development server
bun run dev
```

## Environment Variables

See `.env.example` for all required environment variables:

| Variable            | Description                  |
| ------------------- | ---------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string |
| `DATABASE_URL_TEST` | Test database URL (E2E)      |
| `SERVER_PORT`       | Server port (default: 3000)  |
| `JWT_SECRET`        | JWT signing secret           |
| `API_KEY`           | API key for middleware       |

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
| `bun run prisma:studio`   | Open Prisma Studio        |
| `bun run seed`            | Seed database             |

## Project Structure

```
src/
├── _common/                    # Shared infrastructure
│   ├── decorators/             # Custom decorators (@Public, @Roles)
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

## Documentation

For detailed documentation, see:

- [AI Agent Instructions](AGENTS.md) - Complete guide for AI agents
- [Architecture](docs/ARCHITECTURE.md) - System architecture
- [API Reference](docs/API.md) - API endpoints
- [RBAC Guide](docs/RBAC.md) - Role-based access control
- [Validation Guide](docs/VALIDATION.md) - Zod validation patterns
- [Database Guide](docs/DATABASE.md) - Prisma schema and queries
- [Testing Guide](docs/TESTING.md) - Testing best practices

## Adding New Endpoints

1. **Define Zod schema** in `src/{module}/zod/`
2. **Create service** with business logic
3. **Create controller** with endpoints
4. **Register module** in AppModule
5. **Add unit tests**

See [AGENTS.md](AGENTS.md) for step-by-step guide.

## Testing

This project requires **90% test coverage**:

```bash
# Run tests
bun run test

# Run with coverage
bun run test:cov
```

## API Response Format

### Success

```json
{
  "payload": { "id": "1", "name": "Example" }
}
```

### Paginated

```json
{
  "payload": [...],
  "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```

### Error

```json
{
  "message": "Error description",
  "error": "ErrorType",
  "statusCode": 400
}
```

## Tech Stack

- **Runtime**: Node.js 20+ / Bun
- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Validation**: Zod
- **Authentication**: JWT + Passport
- **Testing**: Jest + jest-extended
- **Linting**: ESLint + Prettier

## License

MIT License
