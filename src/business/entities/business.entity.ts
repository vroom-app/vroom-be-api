import { User } from '../../users/entities/user.entity';
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
import { ServiceOffering } from '../../service-offering/entities/service-offering.entity';
import { Slot } from '../../slot/entities/slot.entity';
import { Review } from '../../review/entities/review.entity';

export enum BusinessCategory {
  CarWash = 'CarWash',
  Mobile = 'Mobile',
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

  // ── BASIC INFO ──────────────────────────────────────────────────────

  @Column({ name: 'owner_id' })
  ownerId: number;

  @ManyToOne(() => User, (user) => user.ownedBusinesses)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  // ── CATEGORIES & SPECIALISATIONS ────────────────────────────────────

  @Column({
    type: 'enum',
    enum: BusinessCategory,
    array: true,
    default: [],
  })
  categories: BusinessCategory[];

  @Column({
    type: 'text',
    array: true,
    default: () => 'ARRAY[]::text[]',
  })
  specializations: string[];

  // ── CONTACT & WEB ───────────────────────────────────────────────────

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  website?: string;

  @Column({ nullable: true })
  phone?: string;

  // ── Rating ──────────────────────────────────────────────────────────

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

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

  // ── SOCIAL LINKS ────────────────────────────────────────────────────

  @Column({ nullable: true })
  facebook?: string;

  @Column({ nullable: true })
  instagram?: string;

  @Column({ nullable: true })
  youtube?: string;

  @Column({ nullable: true })
  linkedin?: string;

  @Column({ nullable: true })
  tiktok?: string;

  // ── FLAGS ───────────────────────────────────────────────────────────

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_sponsored', default: false })
  isSponsored: boolean;

  @Column({ name: 'accept_bookings', default: false })
  acceptBookings: boolean;

  // ── RELATIONS ───────────────────────────────────────────────────────

  @OneToMany(() => BusinessOpeningHours, (hours) => hours.business)
  openingHours: BusinessOpeningHours[];

  @OneToMany(() => ServiceOffering, (service) => service.business)
  serviceOfferings: ServiceOffering[];

  @OneToMany(() => Slot, (slot) => slot.business)
  slots: Slot[];

  @OneToMany(() => Review, (review) => review.business)
  reviews: Review[];

  // ── AUDIT ───────────────────────────────────────────────────────────

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
