import { ApiProperty } from "@nestjs/swagger";
import { BusinessCategory } from "src/business/entities/business.entity";

export class BusinessSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Service Name' })
  name: string;

  @ApiProperty()
  categories: BusinessCategory[];

  @ApiProperty()
  city?: string;
}
