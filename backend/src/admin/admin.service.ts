import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [userCount, storeCount, productCount, totalSales] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.prisma.product.count(),
      this.prisma.transaction.aggregate({
        where: { type: 'SALE', status: 'PAID' },
        _sum: { amount: true }
      })
    ]);

    return {
      userCount,
      storeCount,
      productCount,
      totalSales: totalSales._sum.amount || 0,
    };
  }

  async getPendingStores() {
    return this.prisma.store.findMany({
      where: { isVerified: false },
      include: { sellerProfile: { include: { user: true } } }
    });
  }

  async getPendingWithdrawals() {
    return this.prisma.transaction.findMany({
      where: { type: 'WITHDRAWAL', status: 'PENDING' },
      include: { wallet: { include: { sellerProfile: { include: { store: true } } } } }
    });
  }

  async approveWithdrawal(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction || transaction.type !== 'WITHDRAWAL' || transaction.status !== 'PENDING') {
      throw new BadRequestException('Invalid transaction');
    }

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'PAID' }
    });
  }
}
