import { BusinessSpecializationDto } from "src/business/dtos/business-specialization.dto";
import { Business } from "src/business/entities/business.entity";
import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";

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