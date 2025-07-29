import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ReviewService } from './services/review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review for a business or service' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors or duplicate review',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Business or service not found' })
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @Request() req,
  ): Promise<ReviewResponseDto> {
    return this.reviewService.createReview(createReviewDto, req.user.id);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get all reviews for a specific business' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'serviceId',
    required: false,
    description: 'Filter by service ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Business reviews retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        reviews: {
          type: 'array',
          items: { $ref: '#/components/schemas/ReviewResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusinessReviews(
    @Param('businessId') businessId: string,
    @Query() listReviewsDto: ListReviewsDto,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.reviewService.getBusinessReviews(businessId, listReviewsDto);
  }

  @Get('business/:businessId/rating')
  @ApiOperation({
    summary: 'Get average rating and total reviews for a business',
  })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: 200,
    description: 'Business rating retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        averageRating: { type: 'number' },
        totalReviews: { type: 'number' },
      },
    },
  })
  async getBusinessRating(
    @Param('businessId') businessId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    return this.reviewService.getBusinessAverageRating(businessId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-reviews')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews by the authenticated user' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'User reviews retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        reviews: {
          type: 'array',
          items: { $ref: '#/components/schemas/ReviewResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserReviews(
    @Request() req,
    @Query() listReviewsDto: ListReviewsDto,
  ): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.reviewService.getUserReviews(req.user.id, listReviewsDto);
  }
}
