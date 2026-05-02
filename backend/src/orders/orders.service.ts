import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/order.dto';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { buyerProfile: true },
    });
    
    if (!user || !user.buyerProfile) {
      throw new BadRequestException('Only buyers with profiles can place orders');
    }

    // 1. Group items by Store (The Multi-Vendor Logic)
    const storeItemsMap = new Map<string, any[]>();
    let totalOrderAmount = 0;

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { store: true },
      });

      if (!product || !product.salePrice || product.stock < item.quantity) {
        throw new BadRequestException(`Product ${product?.name || 'Unknown'} is unavailable or has no price`);
      }

      const storeId = product.storeId;
      const itemList = storeItemsMap.get(storeId) || [];
      
      const itemTotal = product.salePrice * item.quantity;
      totalOrderAmount += itemTotal;

      itemList.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.salePrice,
        totalPrice: itemTotal,
        commissionRate: product.store.commissionRate,
        sellerWalletId: product.store.sellerProfileId,
      });
      storeItemsMap.set(storeId, itemList);
    }

    // 2. Create Order and SubOrders in a Transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyerProfileId: user.buyerProfile!.id,
          totalAmount: totalOrderAmount,
          shippingAddress: JSON.stringify({}), // Should use shippingAddressId
          status: 'PENDING',
        },
      });

      for (const [storeId, items] of storeItemsMap) {
        const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
        const avgCommissionRate = items[0].commissionRate;
        const commissionAmount = (subtotal * avgCommissionRate) / 100;
        const sellerAmount = subtotal - commissionAmount;

        await tx.subOrder.create({
          data: {
            orderId: order.id,
            storeId,
            status: 'PENDING',
            subtotal,
            commissionAmount,
            sellerAmount,
            items: {
              create: items.map(i => ({
                productId: i.productId,
                productName: i.productName,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
              })),
            },
          },
        });

        // Create Wallet Transaction and Update Pending Balance
        const sellerWallet = await tx.wallet.findFirst({
          where: { sellerProfileId: items[0].sellerWalletId }
        });

        if (sellerWallet) {
          await tx.wallet.update({
            where: { id: sellerWallet.id },
            data: { pendingBalance: { increment: sellerAmount } },
          });

          await tx.transaction.create({
            data: {
              walletId: sellerWallet.id,
              orderId: order.id,
              amount: sellerAmount,
              commissionAmount,
              type: 'SALE',
              status: 'PENDING',
              description: `Payment for sub-order under ${order.id}`,
            },
          });
        }

        // Update Stock
        for (const i of items) {
          await tx.product.update({
            where: { id: i.productId },
            data: { 
              stock: { decrement: i.quantity },
              soldCount: { increment: i.quantity }
            },
          });
        }
      }

      // Return order with subOrders
      return tx.order.findUnique({
        where: { id: order.id },
        include: { subOrders: { include: { items: true } } },
      });
    });
  }

  async findMyOrders(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { buyerProfile: true },
    });

    if (!user || !user.buyerProfile) {
      throw new BadRequestException('Buyer profile not found');
    }

    return this.prisma.order.findMany({
      where: { buyerProfileId: user.buyerProfile.id },
      include: { subOrders: { include: { items: true, store: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findStoreOrders(storeId: string) {
    return this.prisma.subOrder.findMany({
      where: { storeId },
      include: { items: true, order: { include: { buyerProfile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirmDelivery(userId: string, subOrderId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { buyerProfile: true },
    });

    if (!user || !user.buyerProfile) {
      throw new BadRequestException('Buyer profile not found');
    }

    const subOrder = await this.prisma.subOrder.findUnique({
      where: { id: subOrderId },
      include: { order: true, store: true },
    });

    if (!subOrder || subOrder.order.buyerProfileId !== user.buyerProfile.id) {
      throw new BadRequestException('Invalid sub-order or unauthorized');
    }

    if (subOrder.status === 'DELIVERED') {
      throw new BadRequestException('Order is already delivered');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update SubOrder Status
      const updatedSubOrder = await tx.subOrder.update({
        where: { id: subOrderId },
        data: { status: 'DELIVERED' },
      });

      // 2. Find seller's wallet via sellerProfile
      const sellerWallet = await tx.wallet.findFirst({
        where: { sellerProfileId: subOrder.store.sellerProfileId },
      });

      // 3. Find associated PENDING transaction for this seller
      const transaction = sellerWallet ? await tx.transaction.findFirst({
        where: {
          orderId: subOrder.orderId,
          walletId: sellerWallet.id,
          status: 'PENDING',
        },
      }) : null;

      if (transaction && sellerWallet) {
        // Move funds from Pending to Available in Seller's Wallet
        await tx.wallet.update({
          where: { id: sellerWallet.id },
          data: {
            pendingBalance: { decrement: transaction.amount },
            balance: { increment: transaction.amount },
          },
        });

        // Mark transaction as PAID
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'PAID' },
        });
      }

      return updatedSubOrder;
    });
  }
}

