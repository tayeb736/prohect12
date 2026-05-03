import {
  IsString, IsEnum, IsNumber, IsOptional, IsArray,
  IsBoolean, IsInt, Min, IsPositive
} from 'class-validator';
import { ProductType, ProductCondition } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  categoryId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  nameAr?: string;

  @IsString()
  description: string;

  @IsEnum(ProductType)
  type: ProductType;

  @IsEnum(ProductCondition)
  @IsOptional()
  condition?: ProductCondition;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsInt()
  @IsOptional()
  yearOfManufacture?: number;

  // Sale
  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  comparePrice?: number;

  // Rent
  @IsNumber()
  @IsOptional()
  rentPricePerDay?: number;

  @IsNumber()
  @IsOptional()
  rentPricePerMonth?: number;

  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsArray()
  @IsOptional()
  certifications?: string[];

  @IsString()
  @IsOptional()
  warranty?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsOptional()
  dimensions?: any;

  @IsOptional()
  specifications?: any;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class UpdateProductDto extends CreateProductDto {}

export class ProductQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  storeId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @IsEnum(ProductCondition)
  @IsOptional()
  condition?: ProductCondition;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsString()
  @IsOptional()
  sortBy?: string; // price_asc, price_desc, rating, newest

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
