import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateCarDto {
    @IsString()
    brand: string;

    @IsString()
    model: string;

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