import { BusinessCategory } from 'src/business/entities/business.entity';

export interface SearchBusinessPayload {
  id: string;
  name?: string;
  name_en?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  categories?: BusinessCategory[];
  specializations?: string[];
  city?: string;
  logo_map_url?: string | null;
  average_reviews?: string;
  review_count?: number;
}
