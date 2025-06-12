import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, Point, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BusinessOpeningHours } from "./business-opening-hours.entity";
import { BusinessSpecialization } from "./business-specialization.entity";
import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";
import { Slot } from "src/slot/entities/slot.entity";
import { Review } from "src/review/entities/review.entity";

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: number;

  @ManyToOne(() => User, user => user.ownedBusinesses)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;;

  @Column({ unique: true })
  googlePlaceId: string;

  @Column({ nullable: true })
  googleCategory: string;

  @Column('simple-array', { nullable: true })
  additionalPhotos: string[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isSponsored: boolean;

  @Column({ default: false })
  acceptBookings: boolean;

  @Column({ type: 'text', nullable: true })
  website: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({type: 'point'})
  coordinates: any;

  @Column()
  phone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BusinessOpeningHours, hours => hours.business)
  openingHours: BusinessOpeningHours[];

  @OneToMany(() => BusinessSpecialization, bs => bs.business)
  specializations: BusinessSpecialization[];

  @OneToMany(() => ServiceOffering, service => service.business)
  serviceOfferings: ServiceOffering[];

  @OneToMany(() => Slot, slot => slot.business)
  slots: Slot[];

  @OneToMany(() => Review, review => review.business)
  reviews: Review[];
}