import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  businessId: string;

  @ApiPropertyOptional()
  serviceId?: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  createdAt: Date;

  // User information
  @ApiProperty()
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };

  // Business information
  @ApiProperty()
  business: {
    id: string;
    name: string;
  };

  // Service information (if applicable)
  @ApiPropertyOptional()
  serviceOffering?: {
    id: number;
    name: string;
  };
}