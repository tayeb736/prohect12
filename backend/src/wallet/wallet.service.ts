import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  // Get or Create Wallet for User
  async getOrCreateWallet(userId: string, role: 'BUYER' | 'SELLER') {
    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { buyerProfile: true, sellerProfile: true },
    });

    if (!profile) throw new BadRequestException('User not found');

    const where = role === 'BUYER' 
      ? { buyerProfileId: profile.buyerProfile?.id } 
      : { sellerProfileId: profile.sellerProfile?.id };

    let wallet = await this.prisma.wallet.findFirst({ 
      where,
      include: { transactions: { orderBy: { createdAt: 'desc' } } }
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          ...(role === 'BUYER' ? { buyerProfileId: profile.buyerProfile?.id } : { sellerProfileId: profile.sellerProfile?.id }),
          balance: 0,
        },
        include: { transactions: { orderBy: { createdAt: 'desc' } } }
      });
    }
    return wallet;
  }

  // Add Funds (Simulated for now, would be used after Stripe payment)
  async addFunds(walletId: string, amount: number, description: string) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          walletId,
          amount,
          type: 'SALE', // Default for adding funds
          status: 'PAID',
          description,
        },
      });

      return wallet;
    });
  }

  // Handle Split Payment (The Amazon Logic)
  // When a buyer pays, platform takes commission, seller gets the rest in "pending"
  async processSplitPayment(orderId: string, totalAmount: number, commissionRate: number, sellerWalletId: string) {
    const commissionAmount = (totalAmount * commissionRate) / 100;
    const sellerAmount = totalAmount - commissionAmount;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Seller's Pending Balance
      await tx.wallet.update({
        where: { id: sellerWalletId },
        data: { pendingBalance: { increment: sellerAmount } },
      });

      // 2. Record the transaction
      await tx.transaction.create({
        data: {
          walletId: sellerWalletId,
          orderId,
          amount: sellerAmount,
          commissionAmount,
          type: 'SALE',
          status: 'PENDING',
          description: `Payment for order ${orderId}`,
        },
      });
    });
  }
  // Request Withdrawal (for Sellers)
  async requestWithdrawal(userId: string, amount: number) {
    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true },
    });

    if (!profile || !profile.sellerProfile) {
      throw new BadRequestException('Seller profile not found');
    }

    const wallet = await this.prisma.wallet.findFirst({
      where: { sellerProfileId: profile.sellerProfile.id },
    });

    if (!wallet || wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.prisma.$transaction(async (tx) => {
      // Deduct from balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      // Create withdrawal transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: 'WITHDRAWAL',
          status: 'PENDING',
          description: 'Withdrawal request',
        },
      });

      return tx.wallet.findUnique({
        where: { id: wallet.id },
        include: { transactions: { orderBy: { createdAt: 'desc' } } }
      });
    });
  }
}
