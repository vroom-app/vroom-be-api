import { Business } from 'src/business/entities/business.entity';
import { User } from 'src/users/entities/user.entity';
import { ReviewedService } from './review-service.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Business, (business) => business.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  @Index()
  business: Business;

  @Column()
  businessId: string;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  @Index()
  user: User;

  @Column()
  userId: number;

  @Column('integer')
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'jsonb', nullable: true })
  ratings?: {
    communication?: number;
    quality?: number;
    punctuality?: number;
    [key: string]: number | undefined;
  };

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ReviewedService, (rs) => rs.review, { cascade: true })
  reviewServices: ReviewedService[];
}
