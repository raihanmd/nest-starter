# Claude Code - Project-Specific Instructions

You are working on a NestJS starter project with the following characteristics:

## Project Type

- **Framework**: NestJS v11 (ESM modules)
- **Language**: TypeScript
- **Runtime**: Node.js 20+ / Bun

## Key Conventions

### 1. Import Extensions

This project uses ESM modules. All local imports MUST include `.js` extension:

```typescript
// ✅ Correct
import { AuthService } from "./auth.service.js";
import { UsersValidation } from "./zod/index.js";

// ❌ Wrong - will cause errors
import { AuthService } from "./auth.service";
```

### 2. File Organization

- **Shared infrastructure**: `src/_common/`
- **Feature modules**: `src/{module-name}/`
- **Tests**: Co-located with source files (`*.spec.ts`)
- **Mocks**: `src/__mocks__/`
- **Test utilities**: `src/test-utils/`

### 3. Testing Patterns

- All tests must maintain 90% coverage threshold
- Use provided test utilities from `src/test-utils/`
- Mock PrismaService using `src/__mocks__/prisma.service.ts`
- Use `jest-extended` for enhanced matchers

### 4. Environment Variables

- All env vars documented in `.env.example`
- Test environment uses `.env.test`
- NEVER commit actual secrets

## Code Style Guidelines

### TypeScript

- Use strict mode
- Enable `strictNullChecks`
- Use `zod` for runtime validation

### NestJS

- Use class-based controllers
- Prefer functional guards when possible
- Use dependency injection

### Naming Conventions

- **Files**: kebab-case (`auth.service.ts`)
- **Classes**: PascalCase (`AuthService`)
- **Methods/variables**: camelCase (`findUserById`)
- **Constants**: SCREAMING_SNAKE_CASE (`JWT_SECRET`)

## Testing Requirements

When writing tests:

1. Use `Test.createTestingModule()` for unit tests
2. Mock all external dependencies
3. Test both success and error cases
4. Use descriptive test names: `should return user when valid id provided`
5. Run `bun run test:cov` before committing

## Important Files to Know

| File                                           | Purpose                             |
| ---------------------------------------------- | ----------------------------------- |
| `AGENTS.md`                                    | General AI agent instructions       |
| `CLAUDE.md`                                    | Your (Claude) specific instructions |
| `src/_common/common.module.ts`                 | Global module with guards/filters   |
| `src/_common/guards/jwt.guard.ts`              | Authentication guard                |
| `src/_common/validation/validation.service.ts` | Zod validation                      |
| `prisma/schema.prisma`                         | Database schema                     |

## Commands Reference

```bash
# Development
bun run dev              # Start with hot reload
bun run build            # Build for production

# Testing
bun run test             # Run unit tests
bun run test:cov         # Run with coverage
bun run test:e2e         # Run E2E tests

# Database
bun run prisma:generate  # Generate Prisma client
bun run prisma:migrate    # Run migrations
bun run seed             # Seed database

# Code quality
bun run lint             # Lint code
bun run format           # Format code
```

## First-Time Setup Checklist

When starting work on this project:

1. [ ] Check if `.env` exists, create from `.env.example` if not
2. [ ] Run `bun install` to install dependencies
3. [ ] Run `bun run prisma:generate` to generate Prisma client
4. [ ] Run `bun run prisma:migrate` to apply migrations
5. [ ] Run `bun run test` to verify tests pass

## Error Handling

This project uses a global exception filter (`src/_common/error/error.filter.ts`) that handles:

- Zod validation errors (400)
- Prisma errors (409 for duplicates, 404 for not found)
- HTTP exceptions
- Unknown errors (500)

## Response Format

All responses follow this structure:

```typescript
// Success
{ payload: T }

// Pagination
{ payload: T[], meta: { total, page, limit, totalPages } }

// Error
{ message: string, error: string, statusCode: number }
```

Remember: Read `AGENTS.md` for comprehensive project documentation!
