import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:id')
  findByProduct(@Param('id') id: string) {
    return this.reviewsService.findByProduct(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.sub, dto);
  }
}
