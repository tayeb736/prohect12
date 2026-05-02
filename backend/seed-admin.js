const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  const password = await bcrypt.hash('Password123!', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.dz',
      password: password,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      adminProfile: {
        create: {
          firstName: 'Admin',
          lastName: 'User'
        }
      }
    }
  });
  console.log('Admin created:', admin.id);
}
seed().catch(console.error).finally(() => prisma.$disconnect());
