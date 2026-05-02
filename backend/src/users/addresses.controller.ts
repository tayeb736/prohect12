import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users/addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.addressesService.findAll(req.user.sub);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.addressesService.remove(req.user.sub, id);
  }
}
