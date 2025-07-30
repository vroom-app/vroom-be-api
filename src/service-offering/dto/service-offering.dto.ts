import { ACTION_TYPE } from '../entities/service-offering.entity';
import { ActionDetails } from '../interfaces/action-details.interface';
import { ServiceDescription } from '../interfaces/service-description.interface';

export class ServiceOfferingDto {
  id: number;
  businessId: string;
  name: string;
  category: string;
  actionType: ACTION_TYPE;
  actionDetails?: ActionDetails;
  description: ServiceDescription;
  capacity: number;
  createdAt: Date;
}