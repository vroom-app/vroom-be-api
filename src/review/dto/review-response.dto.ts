import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReviewedServiceDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'Premium Car Wash' })
  name: string;
}

export class UserSummaryDto {
  @ApiProperty({ example: 42 })
  id: number;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'https://cdn.app.com/avatar/john.jpg', required: false })
  avatarUrl?: string;
}

export class ReviewResponseDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ example: '3f8a3b5a-4a2e-4c19-95d7-2b41a8f612c4' })
  businessId: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'Excellent quality and communication!' })
  comment: string;

  @ApiProperty({
    example: {
      communication: 5,
      quality: 4,
      punctuality: 5,
    },
    required: false,
  })
  ratings?: Record<string, number>;

  @ApiProperty({ type: [ReviewedServiceDto] })
  @Type(() => ReviewedServiceDto)
  services: ReviewedServiceDto[];

  @ApiProperty({ type: UserSummaryDto })
  @Type(() => UserSummaryDto)
  user: UserSummaryDto;

  @ApiProperty({ example: '2025-11-10T09:30:00.000Z' })
  createdAt: Date;
}

export class PaginatedBusinessReviewsResponseDto {
  @ApiProperty({ type: [ReviewResponseDto] })
  @Type(() => ReviewResponseDto)
  reviews: ReviewResponseDto[];

  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 5 })
  limit: number;
}
