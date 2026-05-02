import { IsString, IsEmail, IsOptional, IsUrl, IsPhoneNumber } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  wilaya: string;

  @IsString()
  address: string;

  @IsPhoneNumber('DZ')
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  website?: string;

  @IsString()
  taxId: string; // الرقم الجبائي NIF
}

export class UpdateStoreDto extends (CreateStoreDto) {}

export class UpdateStoreStatusDto {
  @IsString()
  status: 'APPROVED' | 'REJECTED';

  @IsString()
  @IsOptional()
  reason?: string;
}
