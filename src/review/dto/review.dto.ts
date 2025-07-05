import { ApiProperty } from '@nestjs/swagger';

export class ReviewDto {
  @ApiProperty()
  text: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  publishTime: string;

  @ApiProperty()
  authorAttribution: {
    displayName: string;
    photoUri: string;
  };
}
