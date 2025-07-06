import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  ValidateNested,
  Min,
  Max,
  IsPhoneNumber,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessCategory } from '../entities/business.entity';

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
  @ApiPropertyOptional({
    description: 'If claiming an existing: the search‐engine UUID',
  })
  searchEngineId?: string;

  @ApiProperty({ example: 'My Shop' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Shop EN' })
  @IsOptional()
  nameEn?: string;

  @ApiPropertyOptional({ example: 'Магазин' })
  @IsOptional()
  nameBg?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Springfield' })
  @IsString()
  city: string;

  @IsNumber()
  @ApiProperty({ example: 42.70 })
  latitude: number;

  @IsNumber()
  @ApiProperty({ example: 42.70 })
  longitude: number;

  @ApiPropertyOptional({ example: 'shop@example.com' })
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+359123456789' })
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://shop.example.com' })
  @IsString()
  website?: string;

  @IsArray()
  @IsEnum(BusinessCategory, { each: true })
  @ApiProperty({ enum: BusinessCategory, isArray: true })
  categories: BusinessCategory[];

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  tags?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDto)
  @IsOptional()
  openingHours?: OpeningHoursDto[];
}
