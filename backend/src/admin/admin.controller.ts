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

  // EMERGENCY: Setup admin role
  @Get('setup-admin-fix')
  async setupAdmin() {
    const user = await this.prisma.user.update({
      where: { email: 'admin@medishop.dz' },
      data: { role: 'SUPER_ADMIN' as any, status: 'ACTIVE' },
    });
    
    await this.prisma.adminProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: 'Admin',
        lastName: 'MediShop'
      }
    });

    return { message: 'admin@medishop.dz is now SUPER_ADMIN' };
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('pending-stores')
  getPendingStores() {
    return this.adminService.getPendingStores();
  }

  @Get('pending-withdrawals')
  getPendingWithdrawals() {
    return this.adminService.getPendingWithdrawals();
  }

  @Post('withdrawals/:transactionId/approve')
  approveWithdrawal(@Param('transactionId') transactionId: string) {
    return this.adminService.approveWithdrawal(transactionId);
  }
}
