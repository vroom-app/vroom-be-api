import { ApiProperty } from '@nestjs/swagger';
import { BusinessCategory, BusinessSpecialization } from 'src/business/entities/business.entity';
import { ServiceOfferingDto } from 'src/service-offering/dto/service-offering.dto';

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

  @ApiProperty()
  categories: BusinessCategory[];

  @ApiProperty()
  specializations?: BusinessSpecialization[ ];

  @ApiProperty({ example: true })
  isSponsored: boolean;

  @ApiProperty({ example: true })
  acceptBookings: boolean;

  @ApiProperty()
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
  };

  @ApiProperty()
  contact: {
    email?: string;
    phone?: string;
    website?: string;
  };

  @ApiProperty()
  media: {
    heroPicture?: string;
    mapLogo?: string;
    logo?: string;
    photoRefs?: string[];
  };

  @ApiProperty()
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
  }

  @ApiProperty({
    type: () => [BusinessOpeningHourDto],
    description: 'List of opening hours per day of week',
  })
  openingHours?: BusinessOpeningHourDto[];
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
