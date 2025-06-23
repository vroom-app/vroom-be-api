import { ApiProperty } from '@nestjs/swagger';

export class FullServiceOfferingDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Premium Car Cleaning' })
  name: string;

  @ApiProperty({ example: 'Top-to-bottom car cleaning', required: false })
  description?: string;

  @ApiProperty({ example: 'Includes every part of your car', required: false })
  detailedDescription?: string;

  @ApiProperty({
    example: ['Deep cleaning', 'Wax'],
    required: false,
    type: [String],
  })
  includedServices?: string[];

  @ApiProperty({
    example: ['Time-saving', 'Professional service'],
    required: false,
    type: [String],
  })
  benefits?: string[];

  @ApiProperty({ example: 199.99 })
  price: number;

  @ApiProperty({
    example: 'FIXED',
    description: 'Pricing type (e.g. FIXED, HOURLY)',
  })
  priceType: string;

  @ApiProperty({ example: 120 })
  durationMinutes: number;

  @ApiProperty({
    example: 'MINUTES',
    required: false,
    description: 'Unit of duration',
  })
  durationUnit?: string;

  @ApiProperty({ example: 'May vary depending on car size', required: false })
  durationNote?: string;

  @ApiProperty({ example: '2-year warranty included', required: false })
  warranty?: string;

  @ApiProperty({ example: 'Cleaning', required: false })
  category?: string;

  @ApiProperty({
    example: 3,
    description: 'Number of Cars the service can handle at once',
  })
  capacity: number;

  @ApiProperty({
    example: new Date().toISOString(),
    description: 'Service creation timestamp',
  })
  createdAt: Date;
}
