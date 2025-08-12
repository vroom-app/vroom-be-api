import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceHistory } from "./entities/service-history.entity";
import { ServiceHistoryService } from "./service-history.service";
import { ServiceHistoryController } from "./service-history.controller";
import { ServiceHistoryRepository } from "./service-history.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceHistory]),
  ],
  providers: [ServiceHistoryService, ServiceHistoryRepository],
  controllers: [ServiceHistoryController],
})
export class ServiceHistoryModule {}
