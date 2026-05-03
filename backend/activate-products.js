const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.product.updateMany({
    where: { status: 'PENDING_REVIEW' },
    data: { status: 'ACTIVE' }
  });
  console.log('Products activated:', updated.count);

  const stores = await prisma.store.updateMany({
    data: { isVerified: true }
  });
  console.log('Stores approved:', stores.count);

  const prods = await prisma.product.findMany({ select: { name: true, status: true, price: true } });
  prods.forEach(p => console.log(' -', p.name, '|', p.status, '| DZD', p.price));
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); });
