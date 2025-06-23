import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CarFuel } from '../entities/car-fuel';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCarDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @ApiPropertyOptional({
    enum: CarFuel,
    description: "If not provided, fuel type defaults to 'OTHER'",
  })
  @IsEnum(CarFuel)
  @IsOptional()
  fuel?: CarFuel;

  @IsInt()
  @Min(1886)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  plateNumber: string;

  @IsOptional()
  @IsString()
  color?: string;
}
