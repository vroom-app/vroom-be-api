import { ApiProperty } from "@nestjs/swagger";

export class BusinessSpecializationDto {
    @ApiProperty({ example: 3 })
    id: number;
    @ApiProperty({ example: 'Mercedes' })
    name: string;
}
