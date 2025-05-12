import { 
    IsString, 
    IsArray, 
    IsOptional, 
    IsBoolean, 
    IsNumber, 
    ValidateNested,
    IsUrl,
    Min,
    Max,
    IsPhoneNumber,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class OpeningHoursDto {
    @IsNumber()
    @Min(0)
    @Max(6)
    dayOfWeek: number;

    @IsString()
    opensAt: string;

    @IsString()
    closesAt: string;
}

export class CreateBusinessDto {
    @IsString()
    @MaxLength(255)
    name: string;

    @IsString()
    @IsOptional()
    @MaxLength(1000)
    description?: string;

    @IsString()
    googlePlaceId: string;

    @IsString()
    @IsOptional()
    googleCategory?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    additionalPhotos?: string[];

    @IsBoolean()
    @IsOptional()
    isVerified?: boolean;

    @IsUrl()
    @IsOptional()
    website?: string;

    @IsString()
    address: string;

    @IsString()
    city: string;

    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @IsPhoneNumber()
    phone: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OpeningHoursDto)
    @IsOptional()
    openingHours?: OpeningHoursDto[];
}