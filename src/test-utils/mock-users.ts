import { EUserRole } from "../types/index";

export const mockUsers = {
  admin: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    username: "admin",
    password: "$2b$10$hashedpassword1234567890abcdefghijklmnopqrstuvwxyz",
    role_id: "550e8400-e29b-41d4-a716-446655440010",
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    updated_at: new Date("2024-01-01T00:00:00.000Z"),
    role: {
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: EUserRole.ADMIN,
      description: "Administrator",
      created_at: new Date("2024-01-01T00:00:00.000Z"),
      updated_at: new Date("2024-01-01T00:00:00.000Z"),
    },
  },
  user: {
    id: "550e8400-e29b-41d4-a716-446655440002",
    username: "testuser",
    password: "$2b$10$hashedpassword0987654321zyxwvutsrqponmlkjihgfedcba",
    role_id: "550e8400-e29b-41d4-a716-446655440011",
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    updated_at: new Date("2024-01-01T00:00:00.000Z"),
    role: {
      id: "550e8400-e29b-41d4-a716-446655440011",
      name: EUserRole.USER,
      description: "Regular User",
      created_at: new Date("2024-01-01T00:00:00.000Z"),
      updated_at: new Date("2024-01-01T00:00:00.000Z"),
    },
  },
  superAdmin: {
    id: "550e8400-e29b-41d4-a716-446655440003",
    username: "superadmin",
    password: "$2b$10$hashedsuperadminpassword1234567890abcdefghijklmnop",
    role_id: "550e8400-e29b-41d4-a716-446655440012",
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    updated_at: new Date("2024-01-01T00:00:00.000Z"),
    role: {
      id: "550e8400-e29b-41d4-a716-446655440012",
      name: EUserRole.SUPER_ADMIN,
      description: "Super Administrator",
      created_at: new Date("2024-01-01T00:00:00.000Z"),
      updated_at: new Date("2024-01-01T00:00:00.000Z"),
    },
  },
};

export const mockRoles = {
  admin: {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: EUserRole.ADMIN,
    description: "Administrator",
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    updated_at: new Date("2024-01-01T00:00:00.000Z"),
  },
  user: {
    id: "550e8400-e29b-41d4-a716-446655440011",
    name: EUserRole.USER,
    description: "Regular User",
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    updated_at: new Date("2024-01-01T00:00:00.000Z"),
  },
  superAdmin: {
    id: "550e8400-e29b-41d4-a716-446655440012",
    name: EUserRole.SUPER_ADMIN,
    description: "Super Administrator",
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    updated_at: new Date("2024-01-01T00:00:00.000Z"),
  },
};

export const createMockUser = (
  overrides: Partial<typeof mockUsers.user> = {},
) => ({
  ...mockUsers.user,
  ...overrides,
});

export const createMockRole = (
  overrides: Partial<typeof mockRoles.user> = {},
) => ({
  ...mockRoles.user,
  ...overrides,
});
