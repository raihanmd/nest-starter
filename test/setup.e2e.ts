import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "src/generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export { prisma };

beforeAll(async () => {
  await prisma.$connect();

  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  const adminRole = await prisma.role.create({
    data: { name: "admin", description: "Administrator" },
  });

  await prisma.role.create({
    data: { name: "user", description: "Regular User" },
  });

  await prisma.role.create({
    data: { name: "super_admin", description: "Super Administrator" },
  });

  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      role_id: adminRole.id,
    },
  });
}, 30000);

afterAll(async () => {
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.$disconnect();
}, 30000);
