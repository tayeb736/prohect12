import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, ProductQueryDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // PUBLIC - anyone can browse products
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // SELLER ONLY - create product
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER' as any)
  @Post()
  create(@Body() dto: CreateProductDto, @Req() req: any) {
    return this.productsService.create(req.user.sub, dto);
  }

  // SELLER ONLY - update own product
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER' as any)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.productsService.update(id, req.user.sub, dto);
  }

  // SELLER ONLY - delete own product
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER' as any)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productsService.remove(id, req.user.sub);
  }
}
