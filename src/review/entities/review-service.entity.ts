import { Review } from './review.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('review_services')
export class ReviewedService {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Review, (review) => review.reviewServices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column()
  reviewId: number;

  @ManyToOne(() => ServiceOffering, (service) => service.reviewServices)
  @JoinColumn({ name: 'serviceId' })
  serviceOffering: ServiceOffering;

  @Column()
  serviceId: number;
}
