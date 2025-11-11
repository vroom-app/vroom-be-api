import { Injectable, Logger } from '@nestjs/common';
import { BusinessRepository } from '../repositories/business.repository';
import { SearchClientService } from 'src/search-client/search-client.service';
import { assertEntityPresent } from 'src/common/utils/assertEntity';
import { BusinessMapper } from 'src/common/utils/business-mapper.util';
import { Business } from '../entities/business.entity';

@Injectable()
export class BusinessReviewService {
  private readonly logger = new Logger(BusinessReviewService.name);

  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly searchClient: SearchClientService,
  ) {}

  async updateBusinessRating(businessId: string) {
    await this.businessRepository.updateBusinessRating(businessId);
    const business = assertEntityPresent(
      await this.businessRepository.findBusinessWithOpeningHoursAndServiceOfferingsById(
        businessId,
      ),
      `Business with ID ${businessId} not found after rating update`,
    );

    this.syncBusinessWithSearchEngine(business);

    this.logger.log(
      `Business rating updated for business ID: ${businessId}, new average rating: ${business.averageRating}, review count: ${business.reviewCount}`,
    );
  }

  private async syncBusinessWithSearchEngine(savedBusiness: Business) {
    this.logger.log(
      `Syncing business ratings with search engine ${savedBusiness}`,
    );
    await this.searchClient.upsertBusiness(
      BusinessMapper.toSearchPayload(savedBusiness),
    );
  }
}
