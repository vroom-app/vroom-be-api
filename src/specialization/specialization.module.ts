import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specialization } from './entities/specialization.entity';
import { SpecializationService } from './specialization.service';

@Module({
  imports: [TypeOrmModule.forFeature([Specialization])],
  controllers: [],
  providers: [SpecializationService],
  exports: [SpecializationService],
})
export class SpecializationModule {}
