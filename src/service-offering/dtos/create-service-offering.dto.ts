import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsArray, IsDecimal, Min, MaxLength } from 'class-validator';
import { DurationUnit, PriceType } from '../entities/service-offering.entity';

export class CreateServiceOfferingDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @IsString()
    @IsOptional()
    detailedDescription?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    includedServices?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    benefits?: string[];

    @IsNumber()
    @IsPositive()
    price: number;

    @IsEnum(PriceType)
    @IsOptional()
    priceType?: PriceType = PriceType.FIXED;

    @IsNumber()
    @Min(1)
    durationMinutes: number;

    @IsEnum(DurationUnit)
    @IsOptional()
    durationUnit?: DurationUnit = DurationUnit.MINUTES;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    durationNote?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    warranty?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    category?: string;
}