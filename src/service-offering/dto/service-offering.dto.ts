import { ApiProperty } from "@nestjs/swagger";
import { PriceType } from "../entities/service-offering.entity";

export class ServiceOfferingDto {
    @ApiProperty({ example: 101 })
    id: number;
    @ApiProperty({ example: 'Deep Cleaning' })
    name: string;
    @ApiProperty({ example: 'Deep cleaning of the entire car', required: false })
    description?: string;
    @ApiProperty({ example: 150.0 })
    price: number;
    @ApiProperty({ enum: PriceType, example: PriceType.FIXED })
    priceType: PriceType;
    @ApiProperty({ example: 90 })
    durationMinutes: number;
    @ApiProperty({ example: 'Cleaning', required: false })
    category?: string;
}