import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import minimist from 'minimist';
import { Prisma, PrismaClient } from 'src/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const roles: Prisma.RoleCreateInput[] = [
  {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
  },
  {
    name: 'Admin',
    description: 'Admin-level access with limited permissions',
  },
  {
    name: 'User',
    description: 'Member-level access with limited permissions',
  },
];

async function seedRoles() {
  const roleCreateData = roles.map((r) => ({
    name: r.name,
    description: r.description,
  }));
  await prisma.role.createMany({
    data: roleCreateData,
    skipDuplicates: true,
  });
}

async function seedSuperAdminUser() {
  const superAdminRole = await prisma.role.findFirst({
    where: {
      name: 'Super Admin',
    },
  });

  await prisma.user.upsert({
    where: { username: 'root' },
    update: {},
    create: {
      username: 'root',
      password: await bcrypt.hash('password', 10),
      role: {
        connect: {
          id: superAdminRole?.id,
        },
      },
    },
  });
}

async function main() {
  const args = minimist(process.argv.slice(2));

  const runAll = args.all || Object.keys(args).length === 1;
  if (runAll || args.role) await seedRoles();
  if (runAll || args.user) await seedSuperAdminUser();
}

main()
  .catch(() => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
