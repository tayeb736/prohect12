import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService,
  ) {}

  // One-time setup: activate all pending products and verify all stores
  @Post('setup-activate-all')
  async setupActivateAll() {
    const products = await this.prisma.product.updateMany({
      where: { status: 'PENDING_REVIEW' },
      data: { status: 'ACTIVE' },
    });
    const stores = await this.prisma.store.updateMany({
      where: { isVerified: false },
      data: { isVerified: true },
    });
    return { activated_products: products.count, verified_stores: stores.count };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN' as any, 'ADMIN' as any)
  getStats() {
    return this.adminService.getStats();
  }

  @Get('pending-stores')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN' as any, 'ADMIN' as any)
  getPendingStores() {
    return this.adminService.getPendingStores();
  }

  @Get('pending-withdrawals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN' as any, 'ADMIN' as any)
  getPendingWithdrawals() {
    return this.adminService.getPendingWithdrawals();
  }

  @Post('withdrawals/:transactionId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN' as any, 'ADMIN' as any)
  approveWithdrawal(@Param('transactionId') transactionId: string) {
    return this.adminService.approveWithdrawal(transactionId);
  }
}
