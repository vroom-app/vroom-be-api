import { Injectable, Logger } from '@nestjs/common';
import { BusinessService } from 'src/business/services/business.service';
import { S3Service } from 'src/s3/services/s3.service';
import {
  FileUpload,
  UploadPicturesResult,
} from '../interfaces/business-photo.interface';
import { assertFileExists } from 'src/common/utils/assertFile';

@Injectable()
export class BusinessPhotoService {
  private readonly logger = new Logger(BusinessPhotoService.name);

  constructor(
    private readonly businessService: BusinessService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * Upload multiple pictures for a business.
   * The first picture will be set as the main photo, and the rest will be additional photos.
   *
   * @param businessId The ID of the business
   * @param userId The ID of the user uploading the pictures
   * @param files The array of file uploads
   * @returns An object containing the main photo URL and additional photos URLs
   */
  async uploadPictures(
    businessId: string,
    userId: number,
    files: FileUpload[],
  ): Promise<UploadPicturesResult> {
    const business =
      await this.businessService.findBusinessAndValidateOwnership(
        businessId,
        userId,
      );

    assertFileExists(files);

    // Upload all files
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const url = await this.s3Service.uploadFile(
        file.buffer,
        file.originalName,
        business.name.replace(" ", "") + '/business-photos',
      );
      uploadedUrls.push(url);
    }

    let photoUrl = business.photoUrl;
    let additionalPhotos = business.additionalPhotos || [];

    // If no main photo exists, set the first uploaded image as main photo
    if (!business.photoUrl && uploadedUrls.length > 0) {
      photoUrl = uploadedUrls[0];
      additionalPhotos = [...additionalPhotos, ...uploadedUrls.slice(1)];
    } else {
      additionalPhotos = [...additionalPhotos, ...uploadedUrls];
    }

    await this.businessService.updateBusinessPhotos(businessId, {
      photoUrl,
      additionalPhotos,
    });

    this.logger.log(
      `${uploadedUrls.length} pictures uploaded for business ${businessId}`,
    );

    return { photoUrl, additionalPhotos };
  }
}
