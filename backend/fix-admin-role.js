const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating admin@medishop.dz to SUPER_ADMIN...');
  const user = await prisma.user.upsert({
    where: { email: 'admin@medishop.dz' },
    update: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
    create: {
      email: 'admin@medishop.dz',
      password: '...', // This won't be used since it exists, but needed for create
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  // Ensure AdminProfile exists
  await prisma.adminProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      firstName: 'Admin',
      lastName: 'MediShop'
    }
  });

  console.log('Admin account fixed.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); });
