import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RatingDetailsDto {
  @ApiPropertyOptional({
    example: 5,
    description: 'Communication rating (1-5)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  communication?: number;

  @ApiPropertyOptional({ example: 4, description: 'Quality rating (1-5)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  quality?: number;

  @ApiPropertyOptional({ example: 5, description: 'Punctuality rating (1-5)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  punctuality?: number;
}

export class CreateReviewDto {
  @ApiProperty({
    example: '3f8a3b5a-4a2e-4c19-95d7-2b41a8f612c4',
    description: 'Business UUID',
  })
  @IsUUID()
  businessId: string;

  @ApiProperty({ example: 5, description: 'Overall rating (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Great service and communication.',
    description: 'Main review comment',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiPropertyOptional({
    type: RatingDetailsDto,
    description: 'Detailed sub-ratings (optional)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RatingDetailsDto)
  ratings?: RatingDetailsDto;

  @ApiProperty({
    type: [Number],
    example: [1, 3],
    description: 'IDs of the services being reviewed',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  serviceIds: number[];
}
