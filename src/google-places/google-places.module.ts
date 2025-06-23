import { Module } from "@nestjs/common";
import { GooglePlacesService } from "./service/google-places.service";

@Module({
  imports: [],
  controllers: [],
  providers: [GooglePlacesService],
  exports: [GooglePlacesService],
})
export class GooglePlacesModule {}
