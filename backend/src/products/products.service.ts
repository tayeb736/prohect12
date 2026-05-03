import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, ProductQueryDto } from './dto/product.dto';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Public: Get all active products (for the storefront)
  async findAll(query: ProductQueryDto) {
    try {
      const { search, storeId, categoryId, type, condition, minPrice, maxPrice, sortBy, page = 1, limit = 20 } = query;
      const skip = (page - 1) * limit;

      const where: any = {
        ...(storeId ? { storeId } : { status: ProductStatus.ACTIVE }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
            { brand: { contains: search } },
          ],
        }),
        ...(categoryId && { categoryId }),
        ...(type && { type }),
        ...(condition && { condition }),
        ...(minPrice || maxPrice) && {
          salePrice: {
            ...(minPrice && { gte: Number(minPrice) }),
            ...(maxPrice && { lte: Number(maxPrice) }),
          },
        },
      };

      const orderBy: any = (() => {
        switch (sortBy) {
          case 'price_asc': return { salePrice: 'asc' };
          case 'price_desc': return { salePrice: 'desc' };
          case 'rating': return { rating: 'desc' };
          case 'newest': return { createdAt: 'desc' };
          default: return { createdAt: 'desc' };
        }
      })();

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: true,
            store: { select: { name: true, slug: true, isVerified: true, rating: true } },
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        data: products,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error('ERROR in ProductsService.findAll:', error);
      throw error;
    }
  }

  // Public: Get single product
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, status: ProductStatus.ACTIVE },
      include: {
        images: true,
        documents: true,
        category: true,
        store: { select: { id: true, name: true, slug: true, logo: true, isVerified: true, rating: true, totalReviews: true } },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { buyerProfile: { select: { firstName: true, lastName: true } } } } },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    // Increment view count
    await this.prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    return product;
  }

  // Seller: Create product
  async create(userId: string, dto: CreateProductDto) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new ForbiddenException('Seller profile not found');

    const store = await this.prisma.store.findUnique({
      where: { sellerProfileId: sellerProfile.id },
    });
    if (!store) throw new ForbiddenException('You must create a store first');
    // if (!store.isVerified) throw new ForbiddenException('Your store must be verified by admin first');

    // Create slug from name
    const slug = `${dto.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const { certifications, tags, dimensions, specifications, ...rest } = dto;

    return this.prisma.product.create({
      data: {
        ...rest,
        certifications: certifications ? JSON.stringify(certifications) : undefined,
        tags: tags ? JSON.stringify(tags) : undefined,
        dimensions: dimensions ? JSON.stringify(dimensions) : undefined,
        specifications: specifications ? JSON.stringify(specifications) : undefined,
        storeId: store.id,
        slug,
        status: ProductStatus.ACTIVE,
      },
    });
  }

  // Seller: Update their own product
  async update(productId: string, sellerId: string, dto: any) {
    const product = await this.prisma.product.findUnique({ where: { id: productId }, include: { store: true } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.store.sellerProfileId !== sellerId) throw new ForbiddenException('Not your product');

    return this.prisma.product.update({ where: { id: productId }, data: dto });
  }

  // Seller: Delete their own product
  async remove(productId: string, sellerId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId }, include: { store: true } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.store.sellerProfileId !== sellerId) throw new ForbiddenException('Not your product');

    return this.prisma.product.delete({ where: { id: productId } });
  }

  // Admin: Approve / Reject product
  async updateStatus(productId: string, status: ProductStatus, rejectionReason?: string) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { status },
    });
  }
}
