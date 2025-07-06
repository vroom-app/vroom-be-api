import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessOpeningHours } from './business-opening-hours.entity';
import { BusinessSpecialization } from './business-specialization.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { Slot } from 'src/slot/entities/slot.entity';
import { Review } from 'src/review/entities/review.entity';

export enum BusinessCategory {
  CarWash = 'CarWash',
  CarRepair = 'CarRepair',
  Parking = 'Parking',
  GasStation = 'GasStation',
  ElectricVehicleChargingStation = 'ElectricVehicleChargingStation',
  CarDealer = 'CarDealer',
  CarRental = 'CarRental',
  DetailingStudio = 'DetailingStudio',
  RimsShop = 'RimsShop',
  Tuning = 'Tuning',
  TireShop = 'TireShop',
  CarInspectionStation = 'CarInspectionStation',
}

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── BASIC INFO ───────────────────────────────────────────────────────
  
  @Column()
  ownerId: number;

  @ManyToOne(() => User, (user) => user.ownedBusinesses)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  name: string;
  
  @Column({ nullable: true })
  description?: string;

  // ── CATEGORIES ──────────────────────────────────────────────────────

  @Column({
    type: 'enum',
    enum: BusinessCategory,
    array: true,
    default: [],
  })
  categories: BusinessCategory[];

  // ── CONTACT & WEB ───────────────────────────────────────────────────

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  website: string;

  @Column({ nullable: true })
  phone: string;

  // ── LOCATION ────────────────────────────────────────────────────────

  @Column()
  address: string;

  @Column()
  city: string;

  @Column('double precision')
  latitude: number;

  @Column('double precision')
  longitude: number;

  // ── MEDIUMS & VISUALS ───────────────────────────────────────────────

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({ name: 'logo_map_url', nullable: true })
  logoMapUrl?: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl?: string;

  @Column('simple-array', { name: 'additional_photos', nullable: true })
  additionalPhotos?: string[];

  // ── FLAGS ────────────────────────────────────────────────────────────

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_sponsored', default: false })
  isSponsored: boolean;

  @Column({ name: 'accept_bookings', default: false })
  acceptBookings: boolean;

  // ── RELATIONS ───────────────────────────────────────────────────────
  
  @OneToMany(() => BusinessOpeningHours, (hours) => hours.business)
  openingHours: BusinessOpeningHours[];

  @OneToMany(() => BusinessSpecialization, (bs) => bs.business)
  specializations: BusinessSpecialization[];

  @OneToMany(() => ServiceOffering, (service) => service.business)
  serviceOfferings: ServiceOffering[];

  @OneToMany(() => Slot, (slot) => slot.business)
  slots: Slot[];

  @OneToMany(() => Review, (review) => review.business)
  reviews: Review[];

  // ── AUDIT ────────────────────────────────────────────────────────────
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
