import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        buyerProfile: true,
        sellerProfile: { include: { store: true } },
        adminProfile: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getProfile(id: string) {
    const user = await this.findOne(id);
    let profile: any = null;
    if (user.role === 'BUYER') profile = user.buyerProfile;
    else if (user.role === 'SELLER') profile = user.sellerProfile;
    else if (user.role === 'SUPER_ADMIN') profile = user.adminProfile;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile,
    };
  }

  async updateProfile(userId: string, dto: any) {
    const user = await this.findOne(userId);
    
    if (user.role === 'BUYER') {
      await this.prisma.buyerProfile.update({
        where: { userId },
        data: dto,
      });
    } else if (user.role === 'SELLER') {
      await this.prisma.sellerProfile.update({
        where: { userId },
        data: dto,
      });
    } else if (user.role === 'SUPER_ADMIN') {
      await this.prisma.adminProfile.update({
        where: { userId },
        data: dto,
      });
    }

    return this.getProfile(userId);
  }
}
