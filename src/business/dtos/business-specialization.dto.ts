import { IsNumber, IsString } from "class-validator";

export class BusinessSpecializationDto {
    @IsNumber()
    specializationId: number;

    @IsString()
    specializationName: string;
}