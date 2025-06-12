import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingDto {
    @ApiPropertyOptional({
        description: 'Booking status',
        enum: BookingStatus,
        example: BookingStatus.CONFIRMED
    })
    @IsEnum(BookingStatus, { 
        message: 'Status must be a valid booking status' 
    })
    @IsOptional()
    status?: BookingStatus;

    @ApiPropertyOptional({
        description: 'Special requests or notes',
        example: 'Updated requirements',
        maxLength: 500
    })
    @IsString({ 
        message: 'Special requests must be a string' 
    })
    @IsOptional()
    @MaxLength(500, { 
        message: 'Special requests cannot exceed 500 characters' 
    })
    @Transform(({ value }) => value?.trim())
    specialRequests?: string;
}