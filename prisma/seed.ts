import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create default permissions
  const permissions = [
    // User management
    {
      name: "user:read",
      description: "Read user information",
      resource: "user",
      action: "read",
    },
    {
      name: "user:create",
      description: "Create new users",
      resource: "user",
      action: "create",
    },
    {
      name: "user:update",
      description: "Update user information",
      resource: "user",
      action: "update",
    },
    {
      name: "user:delete",
      description: "Delete users",
      resource: "user",
      action: "delete",
    },

    // Student management
    {
      name: "student:read",
      description: "Read student information",
      resource: "student",
      action: "read",
    },
    {
      name: "student:create",
      description: "Create new students",
      resource: "student",
      action: "create",
    },
    {
      name: "student:update",
      description: "Update student information",
      resource: "student",
      action: "update",
    },
    {
      name: "student:delete",
      description: "Delete students",
      resource: "student",
      action: "delete",
    },

    // Teacher management
    {
      name: "teacher:read",
      description: "Read teacher information",
      resource: "teacher",
      action: "read",
    },
    {
      name: "teacher:create",
      description: "Create new teachers",
      resource: "teacher",
      action: "create",
    },
    {
      name: "teacher:update",
      description: "Update teacher information",
      resource: "teacher",
      action: "update",
    },
    {
      name: "teacher:delete",
      description: "Delete teachers",
      resource: "teacher",
      action: "delete",
    },

    // Payment management
    {
      name: "payment:read",
      description: "Read payment information",
      resource: "payment",
      action: "read",
    },
    {
      name: "payment:create",
      description: "Create new payments",
      resource: "payment",
      action: "create",
    },
    {
      name: "payment:update",
      description: "Update payment information",
      resource: "payment",
      action: "update",
    },
    {
      name: "payment:delete",
      description: "Delete payments",
      resource: "payment",
      action: "delete",
    },

    // Attendance management
    {
      name: "attendance:read",
      description: "Read attendance records",
      resource: "attendance",
      action: "read",
    },
    {
      name: "attendance:create",
      description: "Create attendance records",
      resource: "attendance",
      action: "create",
    },
    {
      name: "attendance:update",
      description: "Update attendance records",
      resource: "attendance",
      action: "update",
    },
    {
      name: "attendance:delete",
      description: "Delete attendance records",
      resource: "attendance",
      action: "delete",
    },

    // Assignment management
    {
      name: "assignment:read",
      description: "Read assignments",
      resource: "assignment",
      action: "read",
    },
    {
      name: "assignment:create",
      description: "Create assignments",
      resource: "assignment",
      action: "create",
    },
    {
      name: "assignment:update",
      description: "Update assignments",
      resource: "assignment",
      action: "update",
    },
    {
      name: "assignment:delete",
      description: "Delete assignments",
      resource: "assignment",
      action: "delete",
    },

    // School management
    {
      name: "school:read",
      description: "Read school information",
      resource: "school",
      action: "read",
    },
    {
      name: "school:create",
      description: "Create schools",
      resource: "school",
      action: "create",
    },
    {
      name: "school:update",
      description: "Update school information",
      resource: "school",
      action: "update",
    },
    {
      name: "school:delete",
      description: "Delete schools",
      resource: "school",
      action: "delete",
    },

    // Organization management
    {
      name: "organization:read",
      description: "Read organization information",
      resource: "organization",
      action: "read",
    },
    {
      name: "organization:create",
      description: "Create organizations",
      resource: "organization",
      action: "create",
    },
    {
      name: "organization:update",
      description: "Update organization information",
      resource: "organization",
      action: "update",
    },
    {
      name: "organization:delete",
      description: "Delete organizations",
      resource: "organization",
      action: "delete",
    },

    // Role management
    {
      name: "role:read",
      description: "Read roles",
      resource: "role",
      action: "read",
    },
    {
      name: "role:create",
      description: "Create roles",
      resource: "role",
      action: "create",
    },
    {
      name: "role:update",
      description: "Update roles",
      resource: "role",
      action: "update",
    },
    {
      name: "role:delete",
      description: "Delete roles",
      resource: "role",
      action: "delete",
    },

    // Article management
    {
      name: "article:read",
      description: "Read articles",
      resource: "article",
      action: "read",
    },
    {
      name: "article:create",
      description: "Create articles",
      resource: "article",
      action: "create",
    },
    {
      name: "article:update",
      description: "Update articles",
      resource: "article",
      action: "update",
    },
    {
      name: "article:delete",
      description: "Delete articles",
      resource: "article",
      action: "delete",
    },
    {
      name: "article:publish",
      description: "Publish articles",
      resource: "article",
      action: "publish",
    },
  ];

  console.log("📝 Creating permissions...");
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Create default roles
  console.log("👥 Creating default roles...");
  const roles = [
    {
      name: "Super Admin",
      description: "Full system access with all permissions",
      is_system: true,
      permissions: permissions.map((p) => p.name), // All permissions
    },
    {
      name: "Member",
      description: "Member-level access with limited permissions",
      is_system: true,
      permissions: ["user:read", "user:create", "user:update"],
    },
    {
      name: "Organization Admin",
      description: "Organization-level administrator",
      is_system: false,
      permissions: [
        "user:read",
        "user:create",
        "user:update",
        "student:read",
        "student:create",
        "student:update",
        "teacher:read",
        "teacher:create",
        "teacher:update",
        "school:read",
        "school:create",
        "school:update",
        "role:read",
        "role:create",
        "role:update",
        "payment:read",
        "payment:create",
        "payment:update",
        "attendance:read",
        "attendance:create",
        "attendance:update",
        "assignment:read",
        "assignment:create",
        "assignment:update",
        "article:read",
        "article:create",
        "article:update",
        "article:publish",
      ],
    },
    {
      name: "School Principal",
      description: "School-level administrator",
      is_system: false,
      permissions: [
        "user:read",
        "user:create",
        "user:update",
        "student:read",
        "student:create",
        "student:update",
        "teacher:read",
        "teacher:create",
        "teacher:update",
        "payment:read",
        "payment:create",
        "payment:update",
        "attendance:read",
        "attendance:create",
        "attendance:update",
        "assignment:read",
        "assignment:create",
        "assignment:update",
        "article:read",
        "article:create",
        "article:update",
        "article:publish",
      ],
    },
    {
      name: "Teacher",
      description: "Subject teacher with limited permissions",
      is_system: false,
      permissions: [
        "student:read",
        "attendance:read",
        "attendance:create",
        "assignment:read",
        "assignment:create",
        "assignment:update",
        "article:read",
        "article:create",
      ],
    },
    {
      name: "Student",
      description: "Student with basic access",
      is_system: false,
      permissions: ["assignment:read", "article:read"],
    },
  ];

  for (const roleData of roles) {
    const role = await prisma.role.create({
      data: {
        name: roleData.name,
        description: roleData.description,
        is_system: roleData.is_system,
      },
    });

    // Assign permissions to role
    for (const permissionName of roleData.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            role_id_permission_id: {
              role_id: role.id,
              permission_id: permission.id,
            },
          },
          update: {},
          create: {
            role_id: role.id,
            permission_id: permission.id,
          },
        });
      }
    }
  }

  // Create a default plan
  console.log("📦 Creating default plans...");
  const plans = await prisma.plan.createMany({
    data: [
      {
        name: "FREE",
        price: 0,
      },
      {
        name: "SILVER",
        price: 100_000,
      },
    ],
  });

  // Create a default modules
  console.log("📦 Creating default modules...");
  const modules = await prisma.module.createMany({
    data: [
      {
        name: "ATTENDANCE",
        description: "Attendance management module",
      },
      {
        name: "PAYMENT",
        description: "Payment management module",
      },
      {
        name: "ASSIGNMENT",
        description: "Assignment management module",
      },
      {
        name: "ARTICLE",
        description: "Article management module",
      },
      {
        name: "ENROLLMENT",
        description: "Enrollment management module",
      },
    ],
  });

  // Create a default super admin user
  console.log("👤 Creating default super admin user...");
  const superAdminUser = await prisma.user.upsert({
    where: { phone: "admin@letsschool.com" },
    update: {},
    create: {
      phone: "admin@letsschool.com",
      password: await bcrypt.hash("password", 10), // Change this in production
      status: "ACTIVE",
      profile: {
        create: {
          first_name: "Super",
          last_name: "Admin",
          phone: "+6281234567890",
        },
      },
    },
  });

  // Assign super admin role to the user
  const superAdminRole = await prisma.role.findFirst({
    where: {
      name: "Super Admin",
    },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        user_id_role_id: {
          user_id: superAdminUser.id,
          role_id: superAdminRole.id,
        },
      },
      update: {},
      create: {
        user_id: superAdminUser.id,
        role_id: superAdminRole.id,
      },
    });
  }

  console.log("✅ Database seeding completed successfully!");
  console.log("📧 Default admin phone: admin@letsschool.com");
  console.log(
    "🔑 Default admin password: password (change this in production!)",
  );
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
