import { BusinessSpecialization } from 'src/business/entities/business-specialization.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('specializations')
export class Specialization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => BusinessSpecialization, (bs) => bs.specialization)
  businessSpecializations: BusinessSpecialization[];
}
