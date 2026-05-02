import { Controller, Post, Get, Body, UseGuards, Req, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('BUYER' as any)
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.sub, dto);
  }

  @Get('my-orders')
  @Roles('BUYER' as any)
  findMyOrders(@Req() req: any) {
    return this.ordersService.findMyOrders(req.user.sub);
  }

  @Get('store/:storeId')
  @Roles('SELLER' as any, 'ADMIN' as any)
  findStoreOrders(@Param('storeId') storeId: string) {
    return this.ordersService.findStoreOrders(storeId);
  }

  @Post(':subOrderId/confirm-delivery')
  @Roles('BUYER' as any)
  confirmDelivery(@Req() req: any, @Param('subOrderId') subOrderId: string) {
    return this.ordersService.confirmDelivery(req.user.sub, subOrderId);
  }
}

