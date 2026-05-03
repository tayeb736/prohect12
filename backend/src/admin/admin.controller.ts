import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN' as any, 'ADMIN' as any)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
