import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Business ID to review' })
  @IsInt()
  @IsNotEmpty()
  businessId: string;

  @ApiPropertyOptional({ description: 'Specific service ID to review (optional)' })
  @IsInt()
  @IsOptional()
  serviceId?: number;

  @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review comment' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}