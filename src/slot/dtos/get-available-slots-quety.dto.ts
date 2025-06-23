import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAvailableSlotsQueryDto {
  @ApiPropertyOptional({
    description:
      'Start date in yyyy-MM-dd format. Defaults to tomorrow if not provided.',
    example: '2025-06-09',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate must be in yyyy-MM-dd format',
  })
  startDate?: string;

  @ApiPropertyOptional({
    description:
      'Number of days to search for available slots. Defaults to days until Sunday.',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'days must be an integer' })
  days?: number;
}
