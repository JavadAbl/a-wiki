// seed.ts
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function createAdminUser() {
  const nationalCode = 'admin';
  const password = '123456';

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { nationalCode },
    update: { password: hashedPassword, role: 'Admin' },
    create: {
      nationalCode,
      password: hashedPassword,
      role: 'Admin',
      firstName: 'Admin',
      lastName: 'Admin',
    },
  });

  console.log(`✅ Ensured admin user "${nationalCode}" exists.`);
}

async function main() {
  try {
    await createAdminUser();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
