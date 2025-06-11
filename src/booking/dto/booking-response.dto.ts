import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BookingResponseDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiPropertyOptional({ example: 1 })
    @Expose()
    userId?: number;

    @ApiProperty({ example: 'pending' })
    @Expose()
    status: string;

    @ApiPropertyOptional({ 
        example: 'Please call before arrival' 
    })
    @Expose()
    specialRequests?: string;

    @ApiProperty({ 
        example: '2025-06-11T10:00:00.000Z' 
    })
    @Expose()
    createdAt: string;

    @ApiPropertyOptional({ 
        example: 'John Doe' 
    })
    @Expose()
    guestName?: string;

    @ApiPropertyOptional({ 
        example: 'john.doe@example.com' 
    })
    @Expose()
    guestEmail?: string;

    @ApiPropertyOptional({ 
        example: '+1234567890' 

    })
    @Expose()
    guestPhone?: string;

    @ApiPropertyOptional({
        type: 'object',
        properties: {
            id: { type: 'number', example: 1 },
            startTime: { type: 'string', example: '2025-06-15T10:00:00.000Z' },
            endTime: { type: 'string', example: '2025-06-15T11:00:00.000Z' }
        }
    })
    @Expose()
    slot?: {
        id: number;
        startTime: Date;
        endTime: Date;
    };

    @ApiPropertyOptional({
        type: 'object',
        properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Hair Cut' },
            duration: { type: 'number', example: 60 },
            price: { type: 'number', example: 50.00 }
        }
    })
    @Expose()
    serviceOffering?: {
        id: number;
        name: string;
        duration: number;
        price: number;
    };
}