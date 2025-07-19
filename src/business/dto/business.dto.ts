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
  IsUrl,
  IsBoolean,
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

// Base update DTO without photos and flags
export class UpdateBusinessBaseDto extends PartialType(
  OmitType(CreateBusinessDto, ['searchEngineId'] as const),
) {}

// Photo-specific DTO for handling media updates
export class UpdateBusinessPhotosDto {
  @ApiPropertyOptional({ description: 'Main logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Map logo URL' })
  @IsOptional()
  @IsUrl()
  logoMapUrl?: string;

  @ApiPropertyOptional({ description: 'Primary photo URL' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Additional photo URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  additionalPhotos?: string[];
}

// Business flags DTO updates
export class UpdateBusinessFlagsDto {
  @ApiPropertyOptional({ description: 'Verification status' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Sponsored status' })
  @IsOptional()
  @IsBoolean()
  isSponsored?: boolean;

  @ApiPropertyOptional({ description: 'Accept bookings flag' })
  @IsOptional()
  @IsBoolean()
  acceptBookings?: boolean;
}

// Combined update DTO
export class UpdateBusinessDto extends UpdateBusinessBaseDto {
  @ApiPropertyOptional({ description: 'Photo URLs update' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateBusinessPhotosDto)
  photos?: UpdateBusinessPhotosDto;

  @ApiPropertyOptional({ description: 'Business flags update (owner/admin only)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateBusinessFlagsDto)
  flags?: UpdateBusinessFlagsDto;
}