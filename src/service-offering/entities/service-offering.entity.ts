import { Booking } from 'src/booking/entities/booking.entity';
import { Business } from 'src/business/entities/business.entity';
import { Review } from 'src/review/entities/review.entity';
import { Slot } from 'src/slot/entities/slot.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ServiceDescription } from '../interfaces/service-description.interface';
import { ActionDetails } from '../interfaces/action-details.interface';

export enum ACTION_TYPE {
  BOOKING_SYSTEM = 'BOOKING_SYSTEM',
  EMBEDDED = 'EMBEDDED',
  CTA = 'CTA',
  E_COMMERCE = 'E_COMMERCE',
  CONTACT_FORM = 'CONTACT_FORM',
  NONE = "NONE"
}

@Entity('service_offerings')
export class ServiceOffering {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, (business) => business.serviceOfferings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column({ type: 'enum', enum: ACTION_TYPE })
  actionType: ACTION_TYPE;

  @Column({ type: 'jsonb' })
  actionDetails: ActionDetails;

  @Column({ type: 'jsonb' })
  description: ServiceDescription;

  @Column('integer', { default: 1 })
  capacity: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Slot, (slot) => slot.serviceOffering)
  slots: Slot[];

  @OneToMany(() => Review, (review) => review.serviceOffering)
  reviews: Review[];

  @OneToMany(() => Booking, (booking) => booking.serviceOffering)
  bookings: Booking[];

  @BeforeInsert()
  @BeforeUpdate()
  validateActionDetails() {
    if (this.actionDetails && this.actionDetails.type !== this.actionType) {
      throw new Error(
        `ActionDetails type "${this.actionDetails.type}" does not match actionType "${this.actionType}"`,
      );
    }
  }
}
