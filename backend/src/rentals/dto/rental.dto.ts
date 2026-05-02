import { IsString, IsDateString, IsInt, Min, IsArray } from 'class-validator';

export class CreateRentalDto {
  @IsString()
  productId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  shippingAddressId: string;
}

export class UpdateRentalStatusDto {
  @IsString()
  status: 'CONFIRMED' | 'ACTIVE' | 'RETURNED' | 'CANCELLED';
}
