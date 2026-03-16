# Architecture Documentation

## Overview

This NestJS starter follows a modular architecture pattern with clear separation of concerns. The application is organized into feature modules that share common infrastructure.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ AuthModule  │  │ UsersModule │  │ Other Feature       │ │
│  │             │  │             │  │ Modules             │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼───────────────────┼─────────────┘
          │                │                   │
┌─────────┼────────────────┼───────────────────┼─────────────┐
│         ▼                ▼                   ▼              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              CommonModule (Global)                    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐  │   │
│  │  │ Guards  │ │ Filters  │ │  Pipes   │ │ Services │  │   │
│  │  │ JwtGuard│ │ErrorFilter│ │ZodPipe  │ │Response  │  │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                 │
│  ┌───────────────────────┴────────────────────────────┐   │
│  │              PrismaService                          │   │
│  │         (Database Connection)                       │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│                    PostgreSQL                                │
└─────────────────────────────────────────────────────────────┘
```

## Module Structure

### Feature Modules

Each feature module follows a consistent structure:

```
src/{module}/
├── {module}.module.ts      # Module definition
├── {module}.controller.ts   # HTTP endpoints
├── {module}.service.ts      # Business logic
├── zod/                     # Validation schemas
│   └── index.ts
└── {module}.service.spec.ts # Unit tests
```

### Common Infrastructure (`src/_common/`)

The `_common` directory contains shared infrastructure that all modules use:

| Directory     | Purpose                                        |
| ------------- | ---------------------------------------------- |
| `decorators/` | Custom decorators (`@Public()`, `@Roles()`)    |
| `guards/`     | Auth guards (`JwtGuard`)                       |
| `filters/`    | Exception filters (`ErrorFilter`)              |
| `pipes/`      | Validation pipes (`ZodValidationPipe`)         |
| `services/`   | Shared services (Prisma, Response, Validation) |
| `strategies/` | Passport strategies (`JwtStrategy`)            |
| `middleware/` | Custom middleware (`ApiKeyMiddleware`)         |

## Request Flow

### Authenticated Request

```
1. HTTP Request
       │
       ▼
2. Global Prefix (v1)
       │
       ▼
3. CORS Middleware
       │
       ▼
4. ThrottlerGuard (rate limiting)
       │
       ▼
5. JwtGuard (authentication)
   ├── Check @Public() decorator
   │       └── Allow if public
   ├── Validate JWT token
   │       └── Deny if invalid
   └── Check @Roles() decorator
           └── Deny if role mismatch
       │
       ▼
6. ZodValidationPipe (request validation)
       │
       ▼
7. Controller Handler
       │
       ▼
8. Service (business logic)
       │
       ▼
9. PrismaService (database)
       │
       ▼
10. ResponseService (format response)
       │
       ▼
11. ErrorFilter (error handling)
```

## Dependency Injection

The application uses NestJS's dependency injection system:

```typescript
// Controller depends on Service
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
  ) {}
}

// Service depends on Prisma and other services
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
}
```

## Configuration

Environment-based configuration using `@nestjs/config`:

```typescript
// ConfigModule in CommonModule
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [".env", ".env.local"],
});
```

## Security Layers

1. **API Key Middleware** - Optional header-based API key validation
2. **JWT Authentication** - Stateless token-based auth
3. **RBAC Guards** - Role-based endpoint protection
4. **Rate Limiting** - Prevent abuse via `@nestjs/throttler`
5. **CORS** - Restrict allowed origins
6. **Input Validation** - Zod schemas for type safety

## Database

Uses Prisma ORM with the adapter pattern for v7:

```typescript
// PrismaService with adapter
constructor(private readonly configService: ConfigService) {
  const adapter = new PrismaPg({
    connectionString: configService.get('DATABASE_URL'),
  });
  super({ adapter });
}
```

## Testing Strategy

- **Unit Tests**: Test services in isolation with mocks
- **Integration Tests**: Test module integration
- **E2E Tests**: Test full HTTP request/response cycle

See [TESTING.md](./TESTING.md) for details.
