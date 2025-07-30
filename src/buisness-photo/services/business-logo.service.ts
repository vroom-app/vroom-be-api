import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BusinessService } from 'src/business/services/business.service';
import { S3Service } from 'src/s3/services/s3.service';
import { SearchClientService } from 'src/search-client/search-client.service';
import { UploadLogoResult } from '../interfaces/business-logo.interface';

@Injectable()
export class BusinessLogoService {
  private readonly logger = new Logger(BusinessLogoService.name);

  constructor(
    private readonly businessService: BusinessService,
    private readonly s3Service: S3Service,
    private readonly searchClientService: SearchClientService,
  ) {}

  async uploadLogo(
    businessId: string,
    userId: number,
    buffer: Buffer,
    originalName: string,
  ): Promise<UploadLogoResult> {
    const business =
      await this.businessService.findBusinessAndValidateOwnership(
        businessId,
        userId,
      );

    if (business.logoUrl) {
      await this.s3Service.deleteFileFromUrl(business.logoUrl);
    }

    const logoUrl = await this.s3Service.uploadFile(
      buffer,
      originalName,
      business.name.replace(' ', '') + '/business-logos',
    );

    let logoMapUrl = business.logoMapUrl;
    if (!business.logoMapUrl) {
      logoMapUrl = logoUrl;
    }

    await this.businessService.updateBusinessPhotos(businessId, {
      logoUrl,
      logoMapUrl,
    });
    await this.searchClientService.upsertBusiness({
      ...business,
      logo_map_url: logoMapUrl,
    });

    this.logger.debug(`Logo uploaded for business ${businessId}`);

    return { logoUrl, logoMapUrl };
  }

  /**
   * Upload a specific logo to be used on maps.
   * This will replace the existing map logo if it exists.
   *
   * @param businessId The ID of the business
   * @param userId The ID of the user uploading the logo
   * @param buffer The file buffer of the logo
   * @param originalName The original name of the file
   * @returns The URL of the uploaded map logo
   */
  async uploadMapLogo(
    businessId: string,
    userId: number,
    buffer: Buffer,
    originalName: string,
  ): Promise<string> {
    const business =
      await this.businessService.findBusinessAndValidateOwnership(
        businessId,
        userId,
      );

    if (business.logoMapUrl) {
      await this.s3Service.deleteFileFromUrl(business.logoMapUrl);
    }

    const logoMapUrl = await this.s3Service.uploadFile(
      buffer,
      originalName,
      business.name.replace(' ', '') + '/business-map-logos',
    );
    await this.businessService.updateBusinessPhotos(businessId, { logoMapUrl });
    await this.searchClientService.upsertBusiness({
      ...business,
      logo_map_url: logoMapUrl,
    });

    this.logger.debug(`Map logo uploaded for business ${businessId}`);

    return logoMapUrl;
  }
}
