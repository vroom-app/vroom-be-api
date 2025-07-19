import { Module } from "@nestjs/common";
import { BusinessModule } from "src/business/business.module";
import { S3Module } from "src/s3/s3.module";
import { BusinessPhotoController } from "./controllers/business-photo.controller";
import { BusinessPhotoService } from "./services/business-photo.service";
import { BusinessLogoService } from "./services/business-logo.service";
import { BusinessLogoController } from "./controllers/business-logo.controller";

@Module({
  imports: [
    BusinessModule, 
    S3Module
],
  controllers: [
    BusinessPhotoController, 
    BusinessLogoController
],
  providers: [
    BusinessPhotoService, 
    BusinessLogoService
],
  exports: [],
})
export class BusinessManagementModule {}
