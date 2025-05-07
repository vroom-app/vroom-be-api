import { Controller } from "@nestjs/common";
import { BusinessService } from "./services/business.service";

@Controller('businesses')
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService
  ) {}
}