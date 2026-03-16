# Validation Guide

## Overview

This project uses **Zod** for runtime type validation. Zod schemas are used to validate incoming request data (body, query, params) and file uploads.

## Validation Flow

```
Request
    │
    ▼
ZodValidationPipe
    │
    ▼
ValidationService.validate(schema, data)
    │
    ├─► Valid → Controller
    │
    └─► Invalid → ErrorFilter → 400 Response
```

## Creating Validation Schemas

### Basic Schema

```typescript
// src/auth/zod/index.ts
import { z } from "zod";

export class AuthValidation {
  static LOGIN = z.object({
    username: z.string(),
    password: z.string().min(8),
  });
}

export type AuthLoginPayload = z.infer<typeof AuthValidation.LOGIN>;
```

### Schema with Multiple Rules

```typescript
export const CREATE_USER = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  roleId: z.string().uuid("Invalid role ID").optional(),
});
```

### Query Parameters

```typescript
export const QUERY_USERS = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["username", "email", "created_at"]).optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});
```

### Partial Updates

```typescript
export const UPDATE_USER = CREATE_USER.partial();
```

## Using Validation Pipes

### Body Validation

```typescript
import { ZodValidationPipeFactory } from "src/_common/pipes/zod-validation-validation-pipe.js";

@Controller("users")
export class UsersController {
  @Post()
  async create(
    @Body(ZodValidationPipeFactory(AuthValidation.CREATE_USER))
    createUserDto: CreateUserPayload,
  ) {
    // createUserDto is typed and validated
    return this.usersService.create(createUserDto);
  }
}
```

### Query Validation

```typescript
@Get()
async findAll(
  @Query(ZodValidationPipeFactory(AuthValidation.QUERY_USERS))
  query: QueryUsersPayload,
) {
  return this.usersService.findAll(query);
}
```

### Params Validation

```typescript
@Get(':id')
async findOne(
  @Param('id', ZodValidationPipeFactory(z.string().uuid()))
  id: string,
) {
  return this.usersService.findOne(id);
}
```

## File Validation

### Built-in File Schemas

```typescript
import { FileValidationPipeFactory } from 'src/_common/pipes/file-validation-pipe.js';

// Image validation (PNG, JPEG, JPG, SVG, WebP) - max 5MB
@UseInterceptors(FileInterceptor('avatar'))
@UploadedFile(FileValidationPipeFactory('IMAGE'))
file: Express.Multer.File

// Any file type - max 100MB
@UseInterceptors(FileInterceptor('document'))
@UploadedFile(FileValidationPipeFactory('ANY'))
file: Express.Multer.File
```

### Optional Files

```typescript
@UseInterceptors(FileInterceptor('avatar'))
@UploadedFile(FileValidationPipeFactory('IMAGE', { required: false }))
file: Express.Multer.File | null
```

### Custom File Schema

```typescript
import { ValidationService } from 'src/_common/validation/validation.service.js';

const PDF_SCHEMA = z.object({
  filename: z.string().min(1),
  mimetype: z.enum(['application/pdf']),
  size: z.number().max(10 * 1024 * 1024), // 10MB
});

// In service
validateFile(file: Express.Multer.File) {
  return this.validationService.validateFileWithSchema(file, PDF_SCHEMA);
}
```

## Error Handling

Invalid data throws a ZodError which is caught by ErrorFilter:

```json
{
  "message": {
    "username": ["Username must be at least 3 characters"],
    "email": ["Invalid email format"]
  },
  "error": "Validation error",
  "statusCode": 400
}
```

## Best Practices

### 1. Create a Validation Class

```typescript
// src/users/zod/index.ts
export class UsersValidation {
  static CREATE = z.object({
    /* ... */
  });
  static UPDATE = this.CREATE.partial();
  static QUERY = z.object({
    /* ... */
  });
}
```

### 2. Export Inferred Types

```typescript
export type CreateUserPayload = z.infer<typeof UsersValidation.CREATE>;
export type UpdateUserPayload = z.infer<typeof UsersValidation.UPDATE>;
export type QueryUserPayload = z.infer<typeof UsersValidation.QUERY>;
```

### 3. Use Coerce for Query Params

```typescript
// String to number coercion
page: z.coerce.number().min(1),
// String to boolean coercion
active: z.coerce.boolean(),
```

### 4. Validate Environment Variables

```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SERVER_PORT: z.coerce.number().min(1).max(65535),
  JWT_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

### 5. Compose Schemas

```typescript
const Pagination = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

const UserFilter = Pagination.extend({
  search: z.string().optional(),
  role: z.nativeEnum(EUserRole).optional(),
});
```

## Testing Validation

```typescript
describe("ValidationService", () => {
  it("should return validated data when valid", () => {
    const schema = z.object({ name: z.string() });
    const result = service.validate(schema, { name: "John" });
    expect(result).toEqual({ name: "John" });
  });

  it("should throw on invalid data", () => {
    const schema = z.object({ name: z.string() });
    expect(() => service.validate(schema, { name: 123 })).toThrow();
  });
});
```
