import { IsString, IsPhoneNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsOptional()
  label?: string; // Home, Clinic, Work...

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsPhoneNumber('DZ')
  phone: string;

  @IsString()
  wilaya: string;

  @IsString()
  commune: string;

  @IsString()
  street: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
