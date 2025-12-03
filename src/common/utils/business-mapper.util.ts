import {
  BusinessOpeningHourDto,
  BusinessProfileDto,
} from 'src/business-management/dto/business-profile.dto';
import { BusinessOpeningHours } from 'src/business/entities/business-opening-hours.entity';
import { Business } from 'src/business/entities/business.entity';
import { SearchBusinessPayload } from 'src/search-client/search-client.interface';
import { ServiceOfferingDto } from 'src/service-offering/dto/service-offering.dto';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';

export class BusinessMapper {
  static toSearchPayload(business: Business): SearchBusinessPayload {
    return {
      id: business.id,
      name: business.name,
      name_en: business.name,
      slug: business.slug,
      address: business.address,
      latitude: business.latitude,
      longitude: business.longitude,
      categories: business.categories ?? [],
      specializations: business.specializations ?? [],
      city: business.city,
      logo_map_url: business.logoMapUrl,
      average_reviews: business.averageRating?.toString(),
      review_count: business.reviewCount,
    };
  }

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
      slug: business.slug,
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
      services: business.serviceOfferings?.map(this.toServiceOfferingDto),
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
