import { Controller, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ExpenseHistoryService } from "./expense-history.service";

@ApiTags('Expense History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cars/:carId/expense-history')
export class ExpenseHistoryController {
  constructor(private readonly service: ExpenseHistoryService) {}
}