const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to update.`);

  const imageData = {
    'Siemens ACUSON X700 Ultrasound System': 'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&w=600&q=80',
    'Philips IntelliVue MX750 Monitor': 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=600&q=80',
    'GE Healthcare MAC 5500 ECG Machine': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    'Mindray BS-380 Chemistry Analyzer': 'https://images.unsplash.com/photo-1563213126-a4273aed2016?auto=format&fit=crop&w=600&q=80',
    'Drager Evita V800 ICU Ventilator': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    'Stryker 3202 Electric Hospital Bed': 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80',
    'Welch Allyn Spot Vital Signs Monitor': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=600&q=80',
    'Karl Storz HD Laparoscope System': 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=600&q=80',
    'Osstem Dental Implant Kit': 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=600&q=80',
    'Abbott i-STAT Handheld Analyzer': 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?auto=format&fit=crop&w=600&q=80'
  };

  const prices = {
    'Siemens ACUSON X700 Ultrasound System': 3500000,
    'Philips IntelliVue MX750 Monitor': 1850000,
    'GE Healthcare MAC 5500 ECG Machine': 780000,
    'Mindray BS-380 Chemistry Analyzer': 2200000,
    'Drager Evita V800 ICU Ventilator': 4800000,
    'Stryker 3202 Electric Hospital Bed': 320000,
    'Welch Allyn Spot Vital Signs Monitor': 185000,
    'Karl Storz HD Laparoscope System': 5200000,
    'Osstem Dental Implant Kit': 450000,
    'Abbott i-STAT Handheld Analyzer': 680000
  };

  for (const product of products) {
    const imageUrl = imageData[product.name];
    const price = prices[product.name];

    if (imageUrl || price) {
      console.log(`Updating ${product.name}...`);
      await prisma.product.update({
        where: { id: product.id },
        data: {
          salePrice: price || undefined,
          status: 'ACTIVE',
          images: imageUrl ? {
            create: {
              url: imageUrl,
              isPrimary: true
            }
          } : undefined
        }
      });
    }
  }

  console.log('Update complete.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
