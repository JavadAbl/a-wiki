import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from 'src/generated/prisma/client';
import { Role } from 'src/generated/prisma/enums';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

async function createSuperAdmin() {
  const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME!;
  const SUPER_ADMIN_MOBILE = process.env.SUPER_ADMIN_MOBILE!;
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD!;

  // Hash password outside of the DB operation for clarity
  const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: SUPER_ADMIN_USERNAME },
    update: {
      // Only update role and active status if user already exists
      // Avoid overwriting password or personal details on re-seed
      role: Role.SuperAdmin,
      isActive: true,
    },
    create: {
      username: SUPER_ADMIN_USERNAME,
      mobile: SUPER_ADMIN_MOBILE,
      firstName: 'Super',
      lastName: 'Admin',
      password: hashedPassword,
      role: Role.SuperAdmin,
      isActive: true,
    },
  });

  console.log(`✅ SuperAdmin ensured: ${superAdmin.username} (ID: ${superAdmin.id})`);
  return superAdmin;
}

async function main() {
  try {
    await createSuperAdmin();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
