import { BusinessCategory, BusinessSpecialization } from "src/business/entities/business.entity";

export interface SearchBusinessPayload {
  id: string;
  name?: string;
  name_en?: string;
  address?: string;
  latitude: number;
  longitude: number;
  categories: BusinessCategory[];
  specializations?: string[];
  city?: string;
}

export interface SearchClient {
  upsertBusiness(payload: SearchBusinessPayload): Promise<void>;
}