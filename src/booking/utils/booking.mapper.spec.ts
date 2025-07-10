import { BookingMapper } from './booking.mapper';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { BookingResponseDto } from '../dto/booking-response.dto';
import { Slot } from 'src/slot/entities/slot.entity';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';

describe('BookingMapper', () => {
  it('should map Booking entity to BookingResponseDto correctly', () => {
    const DATE_STRING = '2025-06-10T12:00:00.000Z';

    const mockSlot = new Slot();
    mockSlot.id = 10;
    mockSlot.startTime = '10:00';
    mockSlot.endTime = '11:00';
    mockSlot.businessId = '100';
    mockSlot.date = '2025-06-11';

    const mockServiceOffering = new ServiceOffering();
    mockServiceOffering.id = 5;
    mockServiceOffering.name = 'Haircut';
    mockServiceOffering.durationMinutes = 60;
    mockServiceOffering.price = 30.5;
    mockServiceOffering.businessId = '100';

    const booking = new Booking();
    booking.id = 99;
    booking.userId = 1;
    booking.status = BookingStatus.CONFIRMED;
    booking.specialRequests = 'Please be gentle';
    booking.createdAt = new Date(DATE_STRING);
    booking.guestName = 'Jane Guest';
    booking.guestEmail = 'jane.guest@example.com';
    booking.guestPhone = '+1234567890';
    booking.slot = mockSlot;
    booking.serviceOffering = mockServiceOffering;

    // Act
    const result: BookingResponseDto = BookingMapper.toResponseDto(booking);

    // Assert
    expect(result).toMatchObject({
      id: 99,
      userId: 1,
      status: 'confirmed',
      specialRequests: 'Please be gentle',
      createdAt: DATE_STRING,
      guestName: 'Jane Guest',
      guestEmail: 'jane.guest@example.com',
      guestPhone: '+1234567890',
      slot: {
        id: 10,
        startTime: '10:00',
        endTime: '11:00',
        businessId: "100",
        date: '2025-06-11',
      },
      serviceOffering: {
        id: 5,
        name: 'Haircut',
        duration: 60,
        price: 30.5,
        businessId: "100",
      },
    });
  });

  it('should handle missing nested entities gracefully', () => {
    const booking = new Booking();
    booking.id = 1;
    booking.userId = 2;
    booking.status = BookingStatus.PENDING;
    booking.createdAt = new Date();
    booking.guestName = 'Guest';
    booking.guestEmail = 'guest@example.com';
    booking.guestPhone = '123456';
    booking.specialRequests = '';

    const result = BookingMapper.toResponseDto(booking);

    expect(result.slot).toBeUndefined();
    expect(result.serviceOffering).toBeUndefined();
  });
});
