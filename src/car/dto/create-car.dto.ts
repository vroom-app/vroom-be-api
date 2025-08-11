import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CarFuel, CarType } from '../entities/car.enums';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsEnum(CarType)
  @ApiProperty({ enum: CarType })
  type?: CarType;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  enginePower?: string;

  @IsOptional()
  @IsString()
  engineVolume?: string;

  @IsOptional()
  @IsString()
  euroStandard?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsEnum(CarFuel)
  @ApiProperty({ enum: CarFuel })
  oilType?: CarFuel;

  @IsOptional()
  @IsNumber()
  mileage?: number;

  @IsOptional()
  @IsUrl()
  photo?: string;
}

export class UpdateCarDto extends PartialType(CreateCarDto) {}