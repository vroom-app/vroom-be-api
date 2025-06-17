import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';

@Entity('business_opening_hours')
export class BusinessOpeningHours {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  businessId: number;

  @ManyToOne(() => Business, (business) => business.openingHours, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column('smallint')
  dayOfWeek: number;

  @Column('time')
  opensAt: string;

  @Column('time')
  closesAt: string;
}
