import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  nameAr: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
