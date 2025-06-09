import { Booking } from "src/booking/entities/booking.entity";
import { Business } from "src/business/entities/business.entity";
import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  businessId: number;

  @ManyToOne(() => Business, business => business.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  offeringId: number;

  @ManyToOne(() => ServiceOffering, offering => offering.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offeringId' })
  serviceOffering: ServiceOffering;

  @Column('date')
  date: string;

  @Column('time')
  startTime: string;

  @Column('time')
  endTime: string;

  @Column('integer', { default: 0 })
  bookingsCount: number;

  @Column('boolean', { default: false })
  isBlocked: boolean;

  @OneToMany(() => Booking, booking => booking.slot)
  bookings: Booking[];
}