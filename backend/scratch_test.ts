import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasource: {
    url: 'file:./dev.db'
  }
} as any);
console.log('Prisma initialized');
prisma.$connect().then(() => {
  console.log('Connected');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
