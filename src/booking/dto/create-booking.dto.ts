import { 
    IsEmail, 
    IsNotEmpty, 
    IsNumber, 
    IsOptional, 
    IsString, 
    ValidateIf, 
    IsDateString,
    MaxLength,
    MinLength,
    IsPhoneNumber,
    Min
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
    @ApiProperty({
        description: 'Service offering ID',
        example: 1,
        minimum: 1
    })
    @IsNumber({}, { 
        message: 'Service offering ID must be a number' 
    })
    @Min(1, { 
        message: 'Service offering ID must be greater than 0' 
    })
    @Type(() => Number)
    serviceOfferingId: number;

    @ApiProperty({
        description: 'Start date and time in ISO format',
        example: '2025-06-15T10:00:00.000Z'
    })
    @IsDateString({}, { 
        message: 'Start date time must be a valid ISO date string' 
    })
    @IsNotEmpty({ 
        message: 'Start date time is required' 
    })
    startDateTime: string;

    @ApiPropertyOptional({
        description: 'Special requests or notes',
        example: 'Please call before arrival',
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

    // Guest user information (required if not authenticated)
    @ApiPropertyOptional({
        description: 'Guest name (required for unauthenticated bookings)',
        example: 'John Doe',
        minLength: 2,
        maxLength: 100
    })
    @ValidateIf(o => !o.userId)
    @IsString({ 
        message: 'Guest name must be a string' 
    })
    @IsNotEmpty({ 
        message: 'Guest name is required for unauthenticated bookings' 
    })
    @MinLength(2, { 
        message: 'Guest name must be at least 2 characters' 
    })
    @MaxLength(100, {
        message: 'Guest name cannot exceed 100 characters' 
    })
    @Transform(({ value }) => value?.trim())
    guestName?: string;

    @ApiPropertyOptional({
        description: 'Guest email (required for unauthenticated bookings)',
        example: 'john.doe@example.com'
    })
    @ValidateIf(o => !o.userId)
    @IsEmail({}, { 
        message: 'Guest email must be a valid email address' 
    })
    @IsNotEmpty({ 
        message: 'Guest email is required for unauthenticated bookings' 
    })
    @Transform(({ value }) => value?.toLowerCase().trim())
    guestEmail?: string;

    @ApiPropertyOptional({
        description: 'Guest phone number (required for unauthenticated bookings)',
        example: '+1234567890'
    })
    @ValidateIf(o => !o.userId)
    @IsPhoneNumber(undefined, { message: 'Guest phone must be a valid phone number' })
    @IsNotEmpty({ message: 'Guest phone is required for unauthenticated bookings' })
    @Transform(({ value }) => value?.trim())
    guestPhone?: string;
}
