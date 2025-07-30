import {
  BusinessOpeningHourDto,
  BusinessProfileDto,
} from '../dto/business-profile.dto';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { Business } from 'src/business/entities/business.entity';
import { BusinessOpeningHours } from 'src/business/entities/business-opening-hours.entity';
import { ServiceOfferingDto } from 'src/service-offering/dto/service-offering.dto';

export class BusinessMapper {
  static toOpeningHourDto(hour: BusinessOpeningHours): BusinessOpeningHourDto {
    return {
      dayOfWeek: hour.dayOfWeek,
      opensAt: hour.opensAt,
      closesAt: hour.closesAt,
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
      specializations: business.specializations,
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
      socialLinks: {
        facebook: business.facebook,
        instagram: business.instagram,
        youtube: business.youtube,
        linkedin: business.linkedin,
        tiktok: business.tiktok,
      },
      openingHours: business.openingHours?.map(this.toOpeningHourDto),
      services: business.serviceOfferings?.map(this.toServiceOfferingDto)
    };
  }

  static toServiceOfferingDto(service: ServiceOffering): ServiceOfferingDto {
    return {
      id: service.id,
      businessId: service.businessId,
      name: service.name,
      category: service.category,
      actionType: service.actionType,
      actionDetails: service.actionDetails,
      description: service.description,
      capacity: service.capacity,
      createdAt: service.createdAt,
    };
  }
}
