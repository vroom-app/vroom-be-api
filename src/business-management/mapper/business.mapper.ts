import {
  BusinessOpeningHourDto,
  BusinessProfileDto,
} from '../dto/business-profile.dto';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { ServiceOfferingDto } from 'src/service-offering/dto/service-offering.dto';
import { Business } from 'src/business/entities/business.entity';
import { BusinessOpeningHours } from 'src/business/entities/business-opening-hours.entity';
import { FullServiceOfferingDto } from 'src/service-offering/dto/full-service-offering.dto';

export class BusinessMapper {
  static toOpeningHourDto(hour: BusinessOpeningHours): BusinessOpeningHourDto {
    return {
      dayOfWeek: hour.dayOfWeek,
      opensAt: hour.opensAt,
      closesAt: hour.closesAt,
    };
  }a

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
      categories: business.categories,
      isSponsored: business.isSponsored,
      acceptBookings: business.acceptBookings,
      location: {
        latitude: business.latitude,
        longitude: business.longitude,
        address: business.address,
        city: business.city,
      },
      contact: {
        email: business.email,
        phone: business.phone,
        website: business.website,
      },
      media: {
        heroPicture: business.photoUrl,
        mapLogo: business.logoMapUrl,
        logo: business.logoUrl,
        photoRefs: business.additionalPhotos,
      },
      socialLinks : {
        facebook: business.facebook,
        instagram: business.instagram,
        youtube: business.youtube,
        linkedin: business.linkedin,
        tiktok: business.tiktok,
      },
      openingHours: business.openingHours?.map(this.toOpeningHourDto),
    };
  }
  static toFullServiceOfferingDto(
    service: ServiceOffering,
  ): FullServiceOfferingDto {
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
