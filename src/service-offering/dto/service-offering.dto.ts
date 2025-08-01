import { ApiProperty } from '@nestjs/swagger';
import { ACTION_TYPE } from '../entities/service-offering.entity';
import { ActionDetails } from '../interfaces/action-details.interface';
import { ServiceDescription } from '../interfaces/service-description.interface';
import { IsEnum } from 'class-validator';

export class ServiceOfferingDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  businessId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  category: string;

  @IsEnum(ACTION_TYPE)
  @ApiProperty()
  actionType: ACTION_TYPE;

  @ApiProperty()
  actionDetails: ActionDetails;

  @ApiProperty()
  description: ServiceDescription;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  createdAt: Date;
}
