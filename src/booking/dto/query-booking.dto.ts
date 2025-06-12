import { IsOptional, IsEnum, IsDateString, IsNumber, Min, Max, ValidateIf } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../entities/booking.entity';

export class QueryBookingDto {
    @ApiPropertyOptional({ description: 'Filter by booking status', enum: BookingStatus })
    @IsEnum(BookingStatus, { message: 'Status must be a valid booking status' })
    @IsOptional()
    status?: BookingStatus;

    @ApiPropertyOptional({ description: 'Filter bookings from this date', example: '2025-06-01T00:00:00.000Z' })
    @IsDateString({}, { message: 'From date must be a valid ISO date string' })
    @IsOptional()
    fromDate?: string;

    @ApiPropertyOptional({ description: 'Filter bookings until this date', example: '2025-06-30T23:59:59.000Z' })
    @IsDateString({}, { message: 'To date must be a valid ISO date string' })
    @IsOptional()
    @ValidateIf(o => o.fromDate && o.toDate)
    toDate?: string;

    @ApiPropertyOptional({ description: 'Sort bookings by field', enum: ['createdAt', 'slotStartTime', 'status'], default: 'createdAt' })
    @IsEnum(['createdAt', 'slotStartTime', 'status'], { message: 'Invalid sort field' })
    @IsOptional()
    sortBy?: 'createdAt' | 'slotStartTime' | 'status' = 'createdAt';

    @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
    @IsEnum(['ASC', 'DESC'])
    @IsOptional()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';

    @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, minimum: 1 })
    @IsNumber({}, { message: 'Page must be a number' })
    @Min(1, { message: 'Page must be greater than 0' })
    @IsOptional()
    @Type(() => Number)
    page: number = 1;

    @ApiPropertyOptional({ description: 'Number of items per page', example: 10, minimum: 1, maximum: 100 })
    @IsNumber({}, { message: 'Limit must be a number' })
    @Min(1, { message: 'Limit must be greater than 0' })
    @Max(100, { message: 'Limit cannot exceed 100' })
    @Transform(({ value }) => Math.min(Number(value) || 10, 100))
    @IsOptional()
    @Type(() => Number)
    limit: number = 10;
}