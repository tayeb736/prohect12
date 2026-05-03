const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findUnique({ where: { id: 'cmop2qktw000ri52b5wanm4vi' }, include: { store: true } });
  if (p) {
    console.log('Product Name:', p.name);
    console.log('Product Store SellerProfileId:', p.store.sellerProfileId);
  } else {
    console.log('Product not found');
  }

  const sp = await prisma.sellerProfile.findUnique({ where: { userId: 'cmop2kspi0004ga2cnnofgj3h' } });
  if (sp) {
    console.log('My SellerProfile ID:', sp.id);
  } else {
    console.log('SellerProfile not found');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); });
