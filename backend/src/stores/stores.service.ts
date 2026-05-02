import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  // Get all stores (Admin or Public listing)
  async findAll() {
    return this.prisma.store.findMany({
      include: {
        sellerProfile: { select: { firstName: true, lastName: true } },
        _count: { select: { products: true } },
      },
    });
  }

  // Get store by slug (Public)
  async findBySlug(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: {
        products: { where: { status: 'ACTIVE' } },
        reviews: true,
      },
    });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  // Get my store (Seller) - accepts userId from JWT
  async findMyStore(userId: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    const store = await this.prisma.store.findUnique({
      where: { sellerProfileId: sellerProfile.id },
      include: { documents: true },
    });
    if (!store) throw new NotFoundException('You do not have a store yet');
    return store;
  }

  // Create store (Seller) - accepts userId from JWT
  async create(userId: string, dto: CreateStoreDto) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    const existing = await this.prisma.store.findUnique({ where: { sellerProfileId: sellerProfile.id } });
    if (existing) throw new ConflictException('You already have a store');

    const slug = dto.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    return this.prisma.store.create({
      data: {
        ...dto,
        sellerProfileId: sellerProfile.id,
        slug,
      },
    });
  }

  // Update store (Seller) - accepts userId from JWT
  async update(userId: string, dto: UpdateStoreDto) {
    const store = await this.findMyStore(userId);
    return this.prisma.store.update({
      where: { id: store.id },
      data: dto,
    });
  }

  // Add Verification Document (Seller)
  async addDocument(sellerProfileId: string, type: string, name: string, fileUrl: string) {
    const store = await this.findMyStore(sellerProfileId);
    return this.prisma.storeDocument.create({
      data: {
        storeId: store.id,
        type,
        name,
        fileUrl,
      },
    });
  }

  // Admin: Verify Store
  async verifyStore(storeId: string, status: VerificationStatus, reason?: string) {
    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        isVerified: status === 'APPROVED',
        sellerProfile: {
          update: {
            verificationStatus: status,
            rejectionReason: reason,
          },
        },
      },
    });
  }
}
