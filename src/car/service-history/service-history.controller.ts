import { Controller, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ServiceHistoryService } from "./services/service-history.service";

@ApiTags('Service History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cars/:carId/service-history')
export class ServiceHistoryController {
  constructor(private readonly service: ServiceHistoryService) {}
}