import { productService } from './product.service';
import { allProducts } from '../data';

export const seedDatabase = async () => {
  console.log('Starting to seed database...');
  let successCount = 0;
  let failCount = 0;

  for (const product of allProducts) {
    try {
      const payload = {
        name: product.name,
        description: product.name + " - High quality medical equipment.",
        salePrice: product.price,
        comparePrice: product.oldPrice,
        stock: product.stock || 10,
        tags: Array.isArray(product.tags) ? product.tags : [product.tags],
        images: [{ url: product.image }],
        category: product.category,
        status: 'PUBLISHED'
      };

      await productService.create(payload);
      successCount++;
      console.log(`✅ Seeded: ${product.name}`);
    } catch (err) {
      failCount++;
      console.error(`❌ Failed: ${product.name}`, err);
    }
  }

  console.log(`Finished! Success: ${successCount}, Failed: ${failCount}`);
  return { successCount, failCount };
};
