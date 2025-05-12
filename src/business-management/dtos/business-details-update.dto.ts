import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BusinessOpeningHourDto {
    @IsNumber()
    dayOfWeek: number;

    @IsString()
    opensAt: string;

    @IsString()
    closesAt: string;
}

export class UpdateBusinessDetailsDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BusinessOpeningHourDto)
    openingHours?: BusinessOpeningHourDto[];
}