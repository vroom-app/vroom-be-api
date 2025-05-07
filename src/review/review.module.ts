import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./entities/review.entity";
import { UsersModule } from "src/users/users.module";
import { ReviewController } from "./review.controller";
import { ReviewService } from "./review.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Review]),
        UsersModule,
    ],
    controllers: [ReviewController],
    providers: [ReviewService],
    exports: [ReviewService]
})
export class ReviewModule {}