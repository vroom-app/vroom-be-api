import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './service/booking.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from 'src/auth/guards/jwt-auth.guard';
import { BookingResponseDto } from './dto/booking-response.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { PaginatedBookingResponseDto } from './dto/paginated-booking-response.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('bookings')
@Controller('booking')
@ApiProduces('application/json')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new booking',
    description:
      'Creates a booking for authenticated users or guest users with provided contact information',
  })
  @ApiConsumes('application/json')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Booking created successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid booking data or validation errors',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Booking conflicts with existing reservation',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req?: any,
  ): Promise<BookingResponseDto> {
    this.logger.log('Creating new booking');
    const userId = req?.user?.id;
    return this.bookingService.create(createBookingDto, userId);
  }

  @Get('business/:businessId')
  @ApiOperation({
    summary: 'Get bookings for a specific business',
    description:
      'Retrieves all bookings for a business (business owners and managers only)',
  })
  @ApiParam({ name: 'businessId', description: 'Business ID', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Business bookings retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - business owner/manager role required',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Business not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.BUSINESS_OWNER)
  async findBusinessBookings(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Query() query: QueryBookingDto,
    @Req() req: any,
  ): Promise<PaginatedBookingResponseDto> {
    this.logger.log(
      `Fetching bookings for business: ${businessId} by user: ${req.user.id}`,
    );

    return this.bookingService.findBusinessBookings(
      query,
      businessId,
      req.user.id,
    );
  }

  @Get('user/my-bookings')
  @ApiOperation({
    summary: "Get current user's bookings",
    description:
      'Retrieves all bookings for the authenticated user across all businesses',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User bookings retrieved successfully',
    type: PaginatedBookingResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMyBookings(
    @Query() query: QueryBookingDto,
    @Req() req: any,
  ): Promise<PaginatedBookingResponseDto> {
    this.logger.log(`Fetching bookings for user: ${req.user.id}`);

    return this.bookingService.findUserBookings(query, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a booking',
    description: 'Updates booking details like status or special requests',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', type: 'number' })
  @ApiConsumes('application/json')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking updated successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied or invalid status transition',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
    @Req() req: any,
  ): Promise<BookingResponseDto> {
    this.logger.log(`Updating booking: ${id} for user: ${req.user.id}`);
    const { id: userId, role } = req.user;
    const isBusinessOwner = role === 'business_owner' || role === 'admin';

    return this.bookingService.update(
      id,
      updateBookingDto,
      userId,
      isBusinessOwner,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel a booking',
    description: 'Cancels a booking by setting its status to cancelled',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking cancelled successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - not your booking',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<BookingResponseDto> {
    this.logger.log(`Cancelling booking: ${id} for user: ${req.user.id}`);
    const { id: userId, role } = req.user;
    const isBusinessOwner = role === 'business_owner' || role === 'admin';

    return this.bookingService.cancel(id, userId, isBusinessOwner);
  }

  @Post(':id/confirm')
  @ApiOperation({
    summary: 'Confirm a booking',
    description: 'Confirms a booking (business owners only)',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking confirmed successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - business owner role required',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Booking cannot be confirmed in current status',
  })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, BusinessOwnerGuard)
  // @Roles('business_owner', 'admin')
  async confirm(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<BookingResponseDto> {
    this.logger.log(
      `Confirming booking: ${id} for business: ${req.user.businessId}`,
    );
    const businessId = req.user.businessId;

    if (!businessId) {
      throw new ForbiddenException(
        'Business ID is required to confirm bookings',
      );
    }

    return this.bookingService.confirm(id, businessId);
  }
}
