import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetBusinessReviewsDto } from './dto/get-business-reviews.dto';
import { ReviewService } from './services/review.service';
import { PaginatedBusinessReviewsResponseDto, ReviewResponseDto } from './dto/review-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ 
    status: 201, 
    type: ReviewResponseDto,
    description: 'Review created successfully' 
  })
  async createReview(
    @Body() dto: CreateReviewDto,
    @Request() req
  ): Promise<ReviewResponseDto> {
    return this.reviewService.createReview(dto, req.user.id);
  }

  @Get('/business/:businessId')
  @ApiOperation({ summary: 'Get paginated reviews for a business' })
  @ApiResponse({
    status: 200,
    type: PaginatedBusinessReviewsResponseDto,
    description: 'Paginated list of business reviews',
  })
  async getBusinessReviews(
    @Param('businessId') businessId: string,
    @Query() query: GetBusinessReviewsDto,
  ): Promise<PaginatedBusinessReviewsResponseDto> {
    return this.reviewService.getBusinessReviews(businessId, query.page, query.limit);
  }
}
