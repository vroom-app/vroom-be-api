import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TireHistory } from "./entities/tire-history.entity";
import { TireHistoryService } from "./tire-history.service";
import { TireHistoryController } from "./tire-history.controller";
import { TireHistoryRepository } from "./tire-history.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([TireHistory]),
  ],
  providers: [TireHistoryService, TireHistoryRepository],
  controllers: [TireHistoryController],
})
export class TireHistoryModule {}
