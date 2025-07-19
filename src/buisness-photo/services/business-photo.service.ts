import { Injectable, Logger } from "@nestjs/common";
import { BusinessService } from "src/business/services/business.service";
import { S3Service } from "src/s3/services/s3.service";
import { SearchClientService } from "src/search-client/search-client.service";

@Injectable()
export class BusinessPhotoService {
  private readonly logger = new Logger(BusinessPhotoService.name);

  constructor(
    private readonly businessService: BusinessService,
    private readonly s3Service: S3Service,
    private readonly searchClientService: SearchClientService
  ) {}
}