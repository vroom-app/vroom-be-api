import { ApiProperty } from '@nestjs/swagger';
import { ReviewDto } from 'src/review/dto/review.dto';
import { ServiceOfferingDto } from 'src/service-offering/dto/service-offering.dto';
import { BusinessSpecializationDto } from 'src/specialization/dto/dto.business-specialization.dto';
export class CurrentBusinessOpeningHourDto {
  @ApiProperty({ example: true })
  openNow: boolean;

  @ApiProperty({
    type: [Object],
    description: 'List of opening and closing periods for each day',
  })
  periods: Array<{
    open: { day: number; time: string };
    close: { day: number; time: string };
  }>;
  @ApiProperty({
    type: [String],
    description: 'Descriptions of opening hours for each day of the week',
  })
  weekdayDescriptions: string[];
}

export class BusinessProfileDto {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ example: 'Service Name' })
  name: string;

  @ApiProperty({
    example: 'We offer top-notch residential cleaning.',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: '123 Main St, Springfield' })
  formattedAddress: string;

  @ApiProperty({ example: 'Springfield' })
  city?: string;

  @ApiProperty({ example: '+1234567890' })
  nationalPhoneNumber?: string;

  @ApiProperty({ example: 'https://awesomecleaning.com', required: false })
  websiteUri?: string;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: true })
  isSponsored: boolean;

  @ApiProperty({ example: true })
  acceptBookings: boolean;

  @ApiProperty({
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
    type: [String],
    required: false,
  })
  photoUrls?: string[];

  @ApiProperty()
  location: {
    latitude?: number;
    longitude?: number;
  };

  @ApiProperty({
    type: () => [BusinessOpeningHourDto],
    description: 'List of opening hours per day of week',
  })
  openingHours?: BusinessOpeningHourDto[];

  @ApiProperty({
    type: () => [CurrentBusinessOpeningHourDto],
    description: 'Current opening hours status',
  })
  currentOpeningHours?: CurrentBusinessOpeningHourDto;

  @ApiProperty({
    type: () => [BusinessSpecializationDto],
    description: 'List of business specializations',
  })
  specializations?: BusinessSpecializationDto[];

  @ApiProperty({
    type: () => [ServiceOfferingDto],
    description: 'List of service offerings provided by the business',
  })
  services?: ServiceOfferingDto[];

  @ApiProperty({ required: false })
  rating?: number;

  @ApiProperty({ required: false })
  userRatingCount?: number;

  @ApiProperty({ type: [ReviewDto], required: false })
  reviews?: ReviewDto[];

  @ApiProperty({ type: [String], required: false })
  types?: string[];

  @ApiProperty({ type: [String], required: false })
  photoRefs?: string[];
}

export class BusinessOpeningHourDto {
  @ApiProperty({
    example: 1,
    description: 'Day of week (0 = Sunday, 1 = Monday, ...)',
  })
  dayOfWeek: number;

  @ApiProperty({ example: '08:00' })
  opensAt: string;

  @ApiProperty({ example: '17:00' })
  closesAt: string;
}
