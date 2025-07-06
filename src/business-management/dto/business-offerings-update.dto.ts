import {
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DurationUnit,
  PriceType,
} from 'src/service-offering/entities/service-offering.entity';

export class UpdateServiceOfferingDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  detailedDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedServices?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsOptional()
  price?: number;

  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsEnum(DurationUnit)
  durationUnit?: DurationUnit;

  @IsOptional()
  @IsString()
  durationNote?: string;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateBusinessServicesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateServiceOfferingDto)
  services: UpdateServiceOfferingDto[];
}
