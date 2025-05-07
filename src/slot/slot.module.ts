import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Slot } from "./entities/slot.entity";
import { UsersModule } from "src/users/users.module";
import { SlotService } from "./slot.service";
import { SlotController } from "./slot.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Slot]),
        UsersModule
    ],
    controllers: [SlotController],
    providers: [SlotService],
    exports: [SlotService]
})
export class SlotModule {}