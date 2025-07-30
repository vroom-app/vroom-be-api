import { BookingResponseDto } from '../dto/booking-response.dto';
import { Booking } from '../entities/booking.entity';
import { plainToClass } from 'class-transformer';

export class BookingMapper {
  static toResponseDto(booking: Booking): BookingResponseDto {
    return plainToClass(
      BookingResponseDto,
      {
        id: booking.id,
        userId: booking.userId,
        status: booking.status,
        specialRequests: booking.specialRequests,
        createdAt: booking.createdAt?.toISOString(),
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        slot: booking.slot
          ? {
              id: booking.slot.id,
              startTime: booking.slot.startTime,
              endTime: booking.slot.endTime,
              businessId: booking.slot.businessId,
              date: booking.slot.date,
            }
          : undefined,
        serviceOffering: booking.serviceOffering
          ? {
              id: booking.serviceOffering.id,
              name: booking.serviceOffering.name,
              duration: undefined, //TODO 
              price: undefined, //TODO 
              businessId: booking.serviceOffering.businessId,
            }
          : undefined,
      },
      { excludeExtraneousValues: true },
    );
  }
}
