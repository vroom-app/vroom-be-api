import { ApiProperty } from "@nestjs/swagger";
import { ServiceOfferingDto } from "src/service-offering/dto/service-offering.dto";
import { BusinessSpecializationDto } from "src/specialization/dto/dto.business-specialization.dto";

export class BusinessProfileDto {
    @ApiProperty({ example: 1 })
    id: number;
    @ApiProperty({ example: 'Mobile Cleaning Services' })
    name: string;
    @ApiProperty({ example: 'We offer top-notch residential cleaning.', required: false })
    description?: string;
    @ApiProperty({ example: '123 Main St, Springfield' })
    address: string;
    @ApiProperty({ example: 'Springfield' })
    city: string;
    @ApiProperty({ example: '+1234567890' })
    phone: string;
    @ApiProperty({ example: 'https://awesomecleaning.com', required: false })
    website?: string;
    @ApiProperty({ example: true })
    isVerified: boolean;

    @ApiProperty({
        type: () => [BusinessOpeningHourDto],
        description: 'List of opening hours per day of week',
    })
    openingHours: BusinessOpeningHourDto[];
    @ApiProperty({
        type: () => [BusinessSpecializationDto],
        description: 'List of business specializations',
    })
    specializations: BusinessSpecializationDto[];
    @ApiProperty({
        type: () => [ServiceOfferingDto],
        description: 'List of service offerings provided by the business',
    })
    services: ServiceOfferingDto[];
}
export class BusinessOpeningHourDto {
  @ApiProperty({ example: 1, description: 'Day of week (0 = Sunday, 1 = Monday, ...)' })
  dayOfWeek: number;

  @ApiProperty({ example: '08:00' })
  opensAt: string;

  @ApiProperty({ example: '17:00' })
  closesAt: string;
}
