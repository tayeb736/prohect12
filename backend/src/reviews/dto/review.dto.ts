import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  storeId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  comment: string;
}
