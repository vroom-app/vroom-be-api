import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ACTION_TYPE } from '../entities/service-offering.entity';
import { ActionDetails } from '../interfaces/action-details.interface';
import { ServiceDescription } from '../interfaces/service-description.interface';
import { Transform, Type } from 'class-transformer';

export class CreateServiceOfferingDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsEnum(ACTION_TYPE)
  actionType: ACTION_TYPE;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  @Transform(({ value, obj }) => {
    switch (obj.actionType) {
      case ACTION_TYPE.BOOKING_SYSTEM:
        return Object.assign(value, { type: 'BOOKING_SYSTEM' });
      case ACTION_TYPE.EMBEDDED:
        return Object.assign(value, { type: 'EMBEDDED' });
      case ACTION_TYPE.CTA:
        return Object.assign(value, { type: 'CTA' });
      case ACTION_TYPE.E_COMMERCE:
        return Object.assign(value, { type: 'E_COMMERCE' });
      case ACTION_TYPE.CONTACT_FORM:
        return Object.assign(value, { type: 'CONTACT_FORM' });
      default:
        return value;
    }
  })
  actionDetails: ActionDetails;

  @IsObject()
  description: ServiceDescription;

  @IsOptional()
  @IsNumber()
  capacity?: number;
}