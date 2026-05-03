import { Controller, Get, Post, Param, UseGuards, Delete } from '@nestjs/common';
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

  // EMERGENCY: Clear all products
  @Delete('clear-all-products-emergency')
  async clearAll() {
    await this.prisma.productImage.deleteMany();
    await this.prisma.product.deleteMany();
    return { message: 'All products and images deleted.' };
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
