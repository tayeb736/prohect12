import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/rental.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('rentals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  @Roles('BUYER' as any)
  create(@Req() req: any, @Body() dto: CreateRentalDto) {
    return this.rentalsService.create(req.user.sub, dto);
  }

  @Get('my-rentals')
  @Roles('BUYER' as any)
  findMyRentals(@Req() req: any) {
    return this.rentalsService.findMyRentals(req.user.sub);
  }

  @Get('store/:storeId')
  @Roles('SELLER' as any, 'ADMIN' as any)
  findStoreRentals(@Param('storeId') storeId: string) {
    return this.rentalsService.findStoreRentals(storeId);
  }

  @Post(':id/return')
  @Roles('SELLER' as any)
  returnRental(@Req() req: any, @Param('id') id: string) {
    return this.rentalsService.returnRental(id, req.user.sub);
  }
}
