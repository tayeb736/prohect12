import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto, UpdateStoreStatusDto } from './dto/store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.storesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER' as any)
  @Get('my-store')
  getMyStore(@Req() req: any) {
    return this.storesService.findMyStore(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER' as any)
  @Post()
  create(@Req() req: any, @Body() dto: CreateStoreDto) {
    return this.storesService.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER' as any)
  @Patch('my-store')
  update(@Req() req: any, @Body() dto: UpdateStoreDto) {
    return this.storesService.update(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN' as any)
  @Patch(':id/verify')
  verify(@Param('id') id: string, @Body() dto: UpdateStoreStatusDto) {
    return this.storesService.verifyStore(id, dto.status as any, dto.reason);
  }
}
