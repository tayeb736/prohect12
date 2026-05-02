import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/rental.dto';

@Injectable()
export class RentalsService {
  constructor(private prisma: PrismaService) {}

  async create(buyerProfileId: string, dto: CreateRentalDto) {
    const { productId, startDate, endDate, quantity } = dto;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) throw new BadRequestException('Start date must be before end date');

    // 1. Check product existence and type
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || (product.type !== 'RENT' && product.type !== 'BOTH')) {
      throw new BadRequestException('Product is not available for rent');
    }

    // 2. Check availability in RentalCalendar
    const overlapping = await this.prisma.rentalCalendar.findFirst({
      where: {
        productId,
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });
    if (overlapping) throw new BadRequestException('Product is already booked for these dates');

    // 3. Calculate total price
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Simple pricing logic (can be expanded to week/month rates)
    const dailyRate = product.rentPricePerDay || 0;
    const totalRentAmount = totalDays * dailyRate * quantity;
    const depositAmount = (product.depositAmount || 0) * quantity;

    // 4. Create Rental and block calendar
    return this.prisma.$transaction(async (tx) => {
      const rental = await tx.rental.create({
        data: {
          buyerProfileId,
          startDate: start,
          endDate: end,
          totalDays,
          dailyRate,
          totalRentAmount,
          depositAmount,
          shippingAddress: JSON.stringify({}), // Should be fetched from Address table
          status: 'PENDING',
          items: {
            create: {
              productId,
              productName: product.name,
              quantity,
              unitPrice: dailyRate,
              totalPrice: totalRentAmount,
            },
          },
        },
      });

      await tx.rentalCalendar.create({
        data: {
          productId,
          startDate: start,
          endDate: end,
          rentalId: rental.id,
        },
      });

      // Wallet Logic: Seller gets RentAmount - Commission (Pending)
      // Deposit is held by the platform (System Wallet)
      const store = await tx.store.findUnique({
        where: { id: product.storeId },
      });
      
      if (store) {
        const commissionAmount = (totalRentAmount * store.commissionRate) / 100;
        const sellerAmount = totalRentAmount - commissionAmount;

        const sellerWallet = await tx.wallet.findFirst({
          where: { sellerProfileId: store.sellerProfileId },
        });

        if (sellerWallet) {
          await tx.wallet.update({
            where: { id: sellerWallet.id },
            data: { pendingBalance: { increment: sellerAmount } },
          });

          await tx.transaction.create({
            data: {
              walletId: sellerWallet.id,
              orderId: rental.id, // Using orderId for rental ID
              amount: sellerAmount,
              commissionAmount,
              type: 'RENTAL',
              status: 'PENDING',
              description: `Rental payment for ${product.name} (Deposit held: ${depositAmount})`,
            },
          });
        }
      }

      return rental;
    });
  }

  async findMyRentals(buyerProfileId: string) {
    return this.prisma.rental.findMany({
      where: { buyerProfileId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findStoreRentals(storeId: string) {
    return this.prisma.rental.findMany({
      where: { items: { some: { product: { storeId } } } },
      include: { items: true, buyerProfile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async returnRental(rentalId: string, storeOwnerId: string) {
    const rental = await this.prisma.rental.findUnique({
      where: { id: rentalId },
      include: { items: { include: { product: { include: { store: true } } } }, buyerProfile: true },
    });

    if (!rental) throw new NotFoundException('Rental not found');
    const store = rental.items[0].product.store;
    
    // Ensure the user calling this is the store owner (or Admin)
    const user = await this.prisma.user.findUnique({ where: { id: storeOwnerId }, include: { sellerProfile: true } });
    if (!user?.sellerProfile || user.sellerProfile.id !== store.sellerProfileId) {
      throw new BadRequestException('Unauthorized to process return for this rental');
    }

    if (rental.status === 'RETURNED') {
      throw new BadRequestException('Rental is already returned');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark as returned
      const updatedRental = await tx.rental.update({
        where: { id: rentalId },
        data: { status: 'RETURNED' },
      });

      // 2. Move pending rent balance to available for the seller
      const transaction = await tx.transaction.findFirst({
        where: {
          orderId: rental.id,
          walletId: store.sellerProfileId,
          status: 'PENDING',
        },
      });

      if (transaction) {
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: {
            pendingBalance: { decrement: transaction.amount },
            balance: { increment: transaction.amount },
          },
        });

        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'PAID' },
        });
      }

      // 3. Refund deposit to Buyer (simulated by updating buyer wallet)
      const buyerWallet = await tx.wallet.findFirst({
        where: { buyerProfileId: rental.buyerProfileId },
      });

      if (buyerWallet && rental.depositAmount > 0) {
        await tx.wallet.update({
          where: { id: buyerWallet.id },
          data: { balance: { increment: rental.depositAmount } },
        });

        await tx.transaction.create({
          data: {
            walletId: buyerWallet.id,
            orderId: rental.id,
            amount: rental.depositAmount,
            type: 'DEPOSIT_REFUND',
            status: 'PAID',
            description: `Deposit refund for returned rental ${rental.id}`,
          },
        });
      }

      return updatedRental;
    });
  }
}
