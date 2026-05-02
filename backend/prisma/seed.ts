import { PrismaClient, ProductStatus, ProductType, ProductCondition, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medishop.dz' },
    update: {},
    create: {
      email: 'admin@medishop.dz',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      status: 'ACTIVE' as any,
      emailVerified: true,
      adminProfile: {
        create: {
          firstName: 'Admin',
          lastName: 'MediShop',
        }
      }
    }
  });

  // 2. Create Seller User
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@vendor.dz' },
    update: {},
    create: {
      email: 'seller@vendor.dz',
      password: sellerPassword,
      role: Role.SELLER,
      status: 'ACTIVE' as any,
      emailVerified: true,
      sellerProfile: {
        create: {
          firstName: 'Mohamed',
          lastName: 'HealthTech',
        }
      }
    },
    include: { sellerProfile: true }
  });

  // 3. Create Store
  const store = await prisma.store.upsert({
    where: { slug: 'healthtech-official' },
    update: {},
    create: {
      sellerProfileId: seller.sellerProfile!.id,
      name: 'HealthTech Official Store',
      slug: 'healthtech-official',
      description: 'Premium medical equipment supplier in Algiers.',
      wilaya: 'Algiers',
      address: 'Industrial Zone, Rouiba',
      phone: '021 00 00 00',
      email: 'sales@healthtech.dz',
      taxId: '123456789',
      isVerified: true,
      rating: 4.8,
    }
  });

  // 4. Create Categories
  const categories = [
    { name: 'Radiology & Imaging', nameAr: 'الأشعة والتصوير الطبي', slug: 'radiology-imaging', icon: 'fas fa-x-ray' },
    { name: 'Surgical Instruments', nameAr: 'الأدوات الجراحية', slug: 'surgical-instruments', icon: 'fas fa-tools' },
    { name: 'Dental Equipment', nameAr: 'معدات طب الأسنان', slug: 'dental-equipment', icon: 'fas fa-tooth' },
    { name: 'Laboratory Gear', nameAr: 'معدات المختبرات', slug: 'laboratory-gear', icon: 'fas fa-flask' },
    { name: 'Patient Care & Monitoring', nameAr: 'عناية ومراقبة المرضى', slug: 'patient-care', icon: 'fas fa-heartbeat' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
  }

  const radiologyCat = await prisma.category.findUnique({ where: { slug: 'radiology-imaging' } });
  const patientCareCat = await prisma.category.findUnique({ where: { slug: 'patient-care' } });

  // 5. Create Products
  const productsData = [
    {
      name: 'Portable Ultrasound Machine Z60',
      description: 'High-resolution portable ultrasound for cardiovascular and general imaging.',
      salePrice: 850000,
      comparePrice: 920000,
      categoryId: radiologyCat!.id,
      type: ProductType.BOTH,
      condition: ProductCondition.NEW,
      status: ProductStatus.ACTIVE,
      brand: 'Mindray',
      stock: 5,
      rating: 4.5,
      totalReviews: 12,
      tags: JSON.stringify(['promo', 'bestseller']),
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400', isPrimary: true }
        ]
      }
    },
    {
      name: 'Patient Monitor BeneVision N12',
      description: 'Advanced bedside patient monitor with multi-parameter tracking.',
      salePrice: 120000,
      categoryId: patientCareCat!.id,
      type: ProductType.SALE,
      condition: ProductCondition.NEW,
      status: ProductStatus.ACTIVE,
      brand: 'Mindray',
      stock: 15,
      rating: 4.8,
      totalReviews: 8,
      tags: JSON.stringify(['nouveau']),
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400', isPrimary: true }
        ]
      }
    },
    {
      name: 'Standard Wheelchair - Lightweight',
      description: 'Durable and lightweight wheelchair for hospital and home use.',
      salePrice: 4500,
      categoryId: patientCareCat!.id,
      type: ProductType.BOTH,
      rentPricePerDay: 200,
      condition: ProductCondition.NEW,
      status: ProductStatus.ACTIVE,
      brand: 'Drive Medical',
      stock: 50,
      rating: 4.2,
      totalReviews: 45,
      tags: JSON.stringify(['under5000']),
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1598129273151-24953c809181?auto=format&fit=crop&q=80&w=400', isPrimary: true }
        ]
      }
    }
  ];

  for (const pData of productsData) {
    const { images, ...rest } = pData;
    await prisma.product.create({
      data: {
        ...rest,
        storeId: store.id,
        slug: rest.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        images
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
