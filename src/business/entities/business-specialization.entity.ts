import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Business } from "./business.entity";
import { Specialization } from "src/specialization/entities/specialization.entity";

@Entity('business_specialization')
export class BusinessSpecialization {
  @PrimaryColumn()
  businessId: number;

  @PrimaryColumn()
  specializationId: number;

  @ManyToOne(() => Business, business => business.specializations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @ManyToOne(() => Specialization, specialization => specialization.businessSpecializations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'specializationId' })
  specialization: Specialization;
}