import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    if (!dto.productId && !dto.storeId) {
      throw new BadRequestException('Review must be linked to a product or a store');
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: { ...dto, userId },
      });

      // Update Product Rating
      if (dto.productId) {
        const stats = await tx.review.aggregate({
          where: { productId: dto.productId },
          _avg: { rating: true },
          _count: { rating: true },
        });
        await tx.product.update({
          where: { id: dto.productId },
          data: { 
            rating: stats._avg.rating || 0,
            totalReviews: stats._count.rating,
          },
        });
      }

      // Update Store Rating
      if (dto.storeId) {
        const stats = await tx.review.aggregate({
          where: { storeId: dto.storeId },
          _avg: { rating: true },
          _count: { rating: true },
        });
        await tx.store.update({
          where: { id: dto.storeId },
          data: { 
            rating: stats._avg.rating || 0,
            totalReviews: stats._count.rating,
          },
        });
      }

      return review;
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: { user: { select: { buyerProfile: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
