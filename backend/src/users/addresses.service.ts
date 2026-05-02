import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAddressDto) {
    // If this is the first address, make it default
    const count = await this.prisma.address.count({ where: { userId } });
    const isDefault = count === 0 || dto.isDefault;

    if (isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: { ...dto, userId, isDefault },
    });
  }

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async remove(userId: string, id: string) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) throw new NotFoundException('Address not found');

    return this.prisma.address.delete({ where: { id } });
  }
}
