export class BookingNotFoundException extends Error {
  constructor(id: number) {
    super(`Booking with ID ${id} not found`);
    this.name = 'BookingNotFoundException';
  }
}

export class BookingConflictException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingConflictException';
  }
}

export class BookingValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingValidationException';
  }
}
