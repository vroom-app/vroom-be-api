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
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
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
  // ── BASIC INFO ───────────────────────────────────────────────────────
  @ApiPropertyOptional({
    description: 'If claiming an existing: the search‐engine UUID',
  })
  @IsUUID()
  searchEngineId?: string;

  @ApiProperty({ example: 'My Shop' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Shop EN' })
  @IsOptional()
  nameEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  // ── CATEGORIES & SPECIALISATIONS ──────────────────────────────────────────────────────

  @IsArray()
  @IsEnum(BusinessCategory, { each: true })
  @ApiProperty({ enum: BusinessCategory, isArray: true })
  categories: BusinessCategory[];

  @IsArray()
  specializations?: string[];

  // ── CONTACT & WEB ───────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'shop@example.com' })
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+359123456789' })
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://shop.example.com' })
  @IsString()
  website?: string;

  // ── LOCATION ────────────────────────────────────────────────────────

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

  // ── SOCIAL LINKS ─────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsString()
  facebook?: string; 

  @ApiPropertyOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional()
  @IsString()  
  youtube?: string;

  @ApiPropertyOptional()
  @IsString()  
  linkedin?: string;
  
  @ApiPropertyOptional()
  @IsString()  
  tiktok?: string;

  // ── RELATIONS ───────────────────────────────────────────────────────

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDto)
  @IsOptional()
  openingHours?: OpeningHoursDto[];
}

export class UpdateBusinessDto extends PartialType(
  OmitType(CreateBusinessDto, ['searchEngineId'] as const),
) {}