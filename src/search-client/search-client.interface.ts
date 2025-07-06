export interface SearchBusinessPayload {
  id: string;
  name?: string;
  name_en?: string;
  name_bg?: string;
  address?: string;
  latitude: number;
  longitude: number;
  email?: string;
  phone?: string;
  website?: string;
  categories: string[];
  tags: Record<string, any>;
  city?: string;
  is_registered: boolean;
}

export interface SearchClient {
  upsertBusiness(payload: SearchBusinessPayload): Promise<void>;
}