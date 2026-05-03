const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to DB...');
  const all = await prisma.product.findMany();
  console.log(`Found ${all.length} products. Deleting all...`);
  
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  
  console.log('Database cleared.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
