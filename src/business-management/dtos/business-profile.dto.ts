export interface BusinessProfileDto {
    id: number;
    name: string;
    description?: string;
    address: string;
    city: string;
    phone: string;
    website?: string;
    isVerified: boolean;
    
    openingHours: {
        dayOfWeek: number;
        opensAt: string;
        closesAt: string;
    }[];
    
    specializations: {
        id: number;
        name: string;
    }[];
    
    services: {
        id: number;
        name: string;
        description?: string;
        price: number;
        priceType: string;
        durationMinutes: number;
        category?: string;
    }[];
}