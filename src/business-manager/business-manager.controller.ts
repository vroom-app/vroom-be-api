import { Controller } from "@nestjs/common";
import { BusinessManagementService } from "./business-manager.service";

@Controller('businesses')
export class BusinessManagementController {
  constructor(
    private readonly businessManagementService: BusinessManagementService
  ) {}
}