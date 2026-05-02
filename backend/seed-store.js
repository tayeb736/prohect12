const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find the seller user
  const user = await prisma.user.findUnique({ 
    where: { email: "seller@test.dz" },
    include: { sellerProfile: { include: { store: true } } }
  });
  
  if (!user) { console.log("Seller not found"); return; }
  console.log("Seller:", user.id, "Profile:", user.sellerProfile?.id);
  
  if (user.sellerProfile?.store) {
    console.log("Store already exists:", user.sellerProfile.store.name);
    return;
  }
  
  if (!user.sellerProfile) {
    console.log("No seller profile, creating...");
    return;
  }
  
  const store = await prisma.store.create({
    data: {
      sellerProfileId: user.sellerProfile.id,
      name: "MedTech DZ Store",
      slug: "medtech-dz",
      wilaya: "Algiers",
      address: "Rue Didouche Mourad, Algiers",
      phone: "0551234567",
      email: "medtech@dz.com",
      taxId: "123456789",
      isVerified: true,
    }
  });
  
  console.log("Store created:", store.id, store.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
