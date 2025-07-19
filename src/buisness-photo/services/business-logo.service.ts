import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { BusinessService } from "src/business/services/business.service";
import { S3Service } from "src/s3/services/s3.service";
import { SearchClientService } from "src/search-client/search-client.service";
import { UploadLogoResult } from "../interfaces/business-logo.interface";

@Injectable()
export class BusinessLogoService {
  private readonly logger = new Logger(BusinessLogoService.name);

  constructor(
    private readonly businessService: BusinessService,
    private readonly s3Service: S3Service,
    private readonly searchClientService: SearchClientService
  ) {}

  
  async uploadLogo(
    businessId: string,
    userId: number,
    buffer: Buffer,
    originalName: string,
  ): Promise<UploadLogoResult> {
    const business = await this.businessService.findBusinessAndValidateOwnership(businessId, userId);

    if (business.logoUrl) {
      await this.deleteFileFromUrl(business.logoUrl);
    }

    const logoUrl = await this.s3Service.uploadFile(buffer, originalName, 'business-logos');

    let logoMapUrl = business.logoMapUrl;
    if (!business.logoMapUrl) {
      logoMapUrl = logoUrl;
    }

    // Update business
    await this.businessRepository.update(businessId, {
      logoUrl,
      logoMapUrl,
    });

    // Sync with search engine
    await this.syncWithSearchEngine(businessId, { logo_map_url: logoMapUrl });

    this.logger.log(`Logo uploaded for business ${businessId}`);

    return { logoUrl, logoMapUrl };
  }

  async uploadMapLogo(
    businessId: string,
    userId: number,
    buffer: Buffer,
    originalName: string,
  ): Promise<string> {
    const business = await this.businessService.findBusinessAndValidateOwnership(businessId, userId);

    // Delete existing map logo if it exists
    if (business.logoMapUrl) {
      await this.deleteFileFromUrl(business.logoMapUrl);
    }

    // Upload new map logo
    const logoMapUrl = await this.s3Service.uploadFile(buffer, originalName, 'business-map-logos');

    // Update business
    await this.businessRepository.update(businessId, { logoMapUrl });

    // Sync with search engine
    await this.syncWithSearchEngine(businessId, { logo_map_url: logoMapUrl });

    this.logger.log(`Map logo uploaded for business ${businessId}`);

    return logoMapUrl;
  }

    async deleteLogo(businessId: string, userId: number): Promise<void> {
    const business = await this.businessService.findBusinessAndValidateOwnership(businessId, userId);

    if (!business.logoUrl) {
      throw new NotFoundException('Business logo not found');
    }

    // Delete from S3
    await this.deleteFileFromUrl(business.logoUrl);

    // Update business
    await this.businessRepository.update(businessId, { logoUrl: null });

    this.logger.log(`Logo deleted for business ${businessId}`);
  }

  async deleteMapLogo(businessId: string, userId: number): Promise<void> {
    const business = await this.businessService.findBusinessAndValidateOwnership(businessId, userId);

    if (!business.logoMapUrl) {
      throw new NotFoundException('Business map logo not found');
    }

    await this.s3Service.deleteFileFromUrl(business.logoMapUrl);

    // Update business and sync with search engine
    await this.businessService.updateBusiness(businessId, { logoMapUrl: null });
    await this.searchClientService.upsertBusiness({id: businessId, ...{ logo_map_url: null }});

    this.logger.log(`Map logo deleted for business ${businessId}`);
  }
}