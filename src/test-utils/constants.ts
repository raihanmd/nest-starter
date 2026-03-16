export const TEST_CONSTANTS = {
  JWT_SECRET: "test-jwt-secret",
  API_KEY: "test-api-key",
  SERVER_PORT: 3000,
  DATABASE_URL: "postgres://postgres:root@localhost:5432/test",
  USER_ROLES: {
    ADMIN: "Admin",
    USER: "User",
    SUPER_ADMIN: "Super Admin",
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },
  ERROR_MESSAGES: {
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Forbidden",
    NOT_FOUND: "Not Found",
    VALIDATION_ERROR: "Validation error",
    INTERNAL_ERROR: "Internal server error",
  },
};

export const REQUEST_WITH_USER = {
  user: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    role: {
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Admin",
    },
  },
};
