import { TypeOrmModule } from "@nestjs/typeorm";
import { ExpenseHistoryController } from "./expense-history.controller";
import { ExpenseHistoryService } from "./services/expense-history.service";
import { Module } from "@nestjs/common";
import { ExpenseHistory } from "./entities/expense-history.entity";
import { ExpenseHistoryRepository } from "./repositories/expense-history.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseHistory]),
  ],
  providers: [ExpenseHistoryService, ExpenseHistoryRepository],
  controllers: [ExpenseHistoryController],
})
export class ExpenseHistoryModule {}
