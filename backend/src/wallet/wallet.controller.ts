import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('my-wallet')
  @Roles('SELLER' as any, 'BUYER' as any)
  async getMyWallet(@Req() req: any) {
    const role = req.user.role;
    if (role !== 'SELLER' && role !== 'BUYER') {
      throw new BadRequestException('Role must be BUYER or SELLER');
    }
    return this.walletService.getOrCreateWallet(req.user.sub, role);
  }

  // Seller requests withdrawal
  @Post('withdraw')
  @Roles('SELLER' as any)
  async withdraw(@Req() req: any, @Body('amount') amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }
    // Simplistic implementation for withdrawal logic
    const wallet = await this.walletService.getOrCreateWallet(req.user.sub, 'SELLER');
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }
    
    // Process withdrawal via WalletService
    return this.walletService.requestWithdrawal(req.user.sub, amount);
  }
}
