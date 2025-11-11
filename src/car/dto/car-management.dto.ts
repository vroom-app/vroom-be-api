import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarFuel, CarType } from '../entities/car.enums';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCarDto {
  @ApiProperty({
    description: 'License plate of the car',
    example: 'CA1234AB',
  })
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @ApiProperty({
    description: 'Model of the car',
    example: '320d',
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    description: 'Brand of the car',
    example: 'BMW',
  })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiPropertyOptional({
    description: 'Manufacturing year of the car',
    example: 2019,
  })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({
    enum: CarType,
    description: 'Type of the car',
    example: CarType.Sedan,
  })
  @IsOptional()
  @IsEnum(CarType)
  type?: CarType;

  @ApiPropertyOptional({
    description: 'Vehicle Identification Number (VIN)',
    example: 'WBA8E91030K123456',
  })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({
    description: 'Engine power specification',
    example: '190hp',
  })
  @IsOptional()
  @IsString()
  enginePower?: string;

  @ApiPropertyOptional({
    description: 'Engine volume specification',
    example: '2.0L',
  })
  @IsOptional()
  @IsString()
  engineVolume?: string;

  @ApiPropertyOptional({
    description: 'Euro emissions standard',
    example: 'Euro 6',
  })
  @IsOptional()
  @IsString()
  euroStandard?: string;

  @ApiPropertyOptional({
    description: 'Color of the car',
    example: 'Син',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    enum: CarFuel,
    description: 'Fuel type of the car',
    example: CarFuel.DIESEL,
  })
  @IsOptional()
  @IsEnum(CarFuel)
  oilType?: CarFuel;

  @ApiPropertyOptional({
    description: 'Current mileage of the car in kilometers',
    example: 120000,
  })
  @IsOptional()
  @IsNumber()
  mileage?: number;

  @ApiPropertyOptional({
    description: 'URL to the car photo',
    example: 'https://example.com/car-photo.png',
  })
  @IsOptional()
  @IsUrl()
  photo?: string;
}

/**
 * DTO for updating an existing car record.
 * Inherits all properties from CreateCarDto but makes them optional.
 */
export class UpdateCarDto extends PartialType(CreateCarDto) {}
