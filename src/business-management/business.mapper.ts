import { BusinessSpecializationDto } from "src/specialization/dto/dto.business-specialization.dto";
import { BusinessOpeningHourDto, BusinessProfileDto } from "./dto/business-profile.dto";
import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";
import { ServiceOfferingDto } from "src/service-offering/dto/service-offering.dto";
import { Business } from "src/business/entities/business.entity";
import { Specialization } from "src/specialization/entities/specialization.entity";
import { BusinessOpeningHours } from "src/business/entities/business-opening-hours.entity";
import { BusinessSpecialization } from "src/business/entities/business-specialization.entity";
import { FullServiceOfferingDto } from "src/service-offering/dto/full-service-offering.dto";

export class BusinessMapper {
    static toOpeningHourDto(hour: BusinessOpeningHours): BusinessOpeningHourDto {
        return {
            dayOfWeek: hour.dayOfWeek,
            opensAt: hour.opensAt,
            closesAt: hour.closesAt,
        };
    }

    static toSpecializationDto(spec: BusinessSpecialization): BusinessSpecializationDto {
        return {
            id: spec.specialization.id,
            name: spec.specialization.name,
        };
    }

    static toServiceOfferingDto(service: ServiceOffering): ServiceOfferingDto {
        return {
            id: service.id,
            name: service.name,
            description: service.description,
            price: Number(service.price),
            priceType: service.priceType,
            durationMinutes: service.durationMinutes,
            category: service.category,
        };
    }

    static toBusinessProfileDto(business: Business): BusinessProfileDto {
        return {
            id: business.id,
            name: business.name,
            description: business.description,
            address: business.address,
            city: business.city,
            phone: business.phone,
            website: business.website,
            isVerified: business.isVerified,

            openingHours: business.openingHours?.map(this.toOpeningHourDto),
            specializations: business.specializations?.map(this.toSpecializationDto),
            services: business.serviceOfferings?.map(this.toServiceOfferingDto),
        };
    }
    static toFullServiceOfferingDto(service: ServiceOffering): FullServiceOfferingDto {
        return {
            id: service.id,
            name: service.name,
            description: service.description,
            detailedDescription: service.detailedDescription,
            includedServices: service.includedServices,
            benefits: service.benefits,
            price: Number(service.price),
            priceType: service.priceType,
            durationMinutes: service.durationMinutes,
            durationUnit: service.durationUnit,
            durationNote: service.durationNote,
            warranty: service.warranty,
            category: service.category,
            capacity: service.capacity,
            createdAt: service.createdAt,
        };
    }
}