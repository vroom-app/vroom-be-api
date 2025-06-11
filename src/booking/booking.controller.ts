import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Logger, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiProduces, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard, OptionalJwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { BookingResponseDto } from "./dto/booking-response.dto";
import { QueryBookingDto } from "./dto/query-booking.dto";
import { PaginatedBookingResponseDto } from "./dto/paginated-booking-response.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { CreateBookingDto } from "./dto/create-booking.dto";

@ApiTags('bookings')
@Controller('booking')
@ApiProduces('application/json')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(
    private readonly bookingService: BookingService
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new booking',
    description: 'Creates a booking for authenticated users or guest users with provided contact information'
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
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Guest information is required for unauthenticated bookings' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Booking conflicts with existing reservation',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Time slot is no longer available' },
        error: { type: 'string', example: 'Conflict' }
      }
    }
  })
  @UseGuards(OptionalJwtAuthGuard)
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req?: any
  ): Promise<BookingResponseDto> {
    this.logger.log('Creating new booking');
    const userId = req?.user?.id;
    return this.bookingService.create(createBookingDto, userId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get bookings with filtering and pagination',
    description: 'Retrieves bookings based on user role and applied filters'
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by booking status' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter bookings from this date (ISO format)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter bookings until this date (ISO format)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'businessId', required: false, description: 'Filter by business ID (for business owners)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bookings retrieved successfully',
    type: PaginatedBookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() query: QueryBookingDto,
    @Req() req: any
  ): Promise<PaginatedBookingResponseDto> {
    this.logger.log(`Fetching bookings for user: ${req.user.id}`);
    const { id: userId, role } = req.user;
    const isBusinessOwner = role === 'business_owner' || role === 'admin';
    const businessId = req.user.businessId; // Assuming business owners have businessId in JWT
    
    return this.bookingService.findAll(query, userId, isBusinessOwner, businessId);
  }

  @Get('business/:businessId')
  @ApiOperation({ 
    summary: 'Get bookings for a specific business',
    description: 'Retrieves all bookings for a business (business owners and admins only)'
  })
  @ApiParam({ name: 'businessId', description: 'Business ID', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Business bookings retrieved successfully',
    type: PaginatedBookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - business owner role required',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  // @Roles('business_owner')
  async findBusinessBookings(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Query() query: QueryBookingDto,
    @Req() req: any
  ): Promise<PaginatedBookingResponseDto> {
    this.logger.log(`Fetching bookings for business: ${businessId}`);
    
    // Additional authorization check if user's business doesn't match requested business
    if (req.user.businessId && req.user.businessId !== businessId && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only access bookings for your own business');
    }
    
    return this.bookingService.findAll(query, req.user.id, true, businessId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a booking by ID',
    description: 'Retrieves a specific booking by its ID'
  })
  @ApiParam({ name: 'id', description: 'Booking ID', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking retrieved successfully',
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
  // @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any
  ): Promise<BookingResponseDto> {
    this.logger.log(`Fetching booking: ${id} for user: ${req.user.id}`);
    const { id: userId, role } = req.user;
    const isBusinessOwner = role === 'business_owner' || role === 'admin';
    
    return this.bookingService.findOne(id, userId, isBusinessOwner);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a booking',
    description: 'Updates booking details like status or special requests'
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
    @Req() req: any
  ): Promise<BookingResponseDto> {
    this.logger.log(`Updating booking: ${id} for user: ${req.user.id}`);
    const { id: userId, role } = req.user;
    const isBusinessOwner = role === 'business_owner' || role === 'admin';
    
    return this.bookingService.update(id, updateBookingDto, userId, isBusinessOwner);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Cancel a booking',
    description: 'Cancels a booking by setting its status to cancelled'
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
  // @UseGuards(JwtAuthGuard)
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any
  ): Promise<BookingResponseDto> {
    this.logger.log(`Cancelling booking: ${id} for user: ${req.user.id}`);
    const { id: userId, role } = req.user;
    const isBusinessOwner = role === 'business_owner' || role === 'admin';
    
    return this.bookingService.cancel(id, userId, isBusinessOwner);
  }

  @Post(':id/confirm')
  @ApiOperation({ 
    summary: 'Confirm a booking',
    description: 'Confirms a booking (business owners only)'
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
    @Req() req: any
  ): Promise<BookingResponseDto> {
    this.logger.log(`Confirming booking: ${id} for business: ${req.user.businessId}`);
    const businessId = req.user.businessId;
    
    if (!businessId) {
      throw new ForbiddenException('Business ID is required to confirm bookings');
    }
    
    return this.bookingService.confirm(id, businessId);
  }

  @Get('user/my-bookings')
  @ApiOperation({ 
    summary: 'Get current user\'s bookings',
    description: 'Retrieves all bookings for the authenticated user'
  })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by booking status' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter bookings from this date' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter bookings until this date' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User bookings retrieved successfully',
    type: PaginatedBookingResponseDto,
  })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  async getMyBookings(
    @Query() query: QueryBookingDto,
    @Req() req: any
  ): Promise<PaginatedBookingResponseDto> {
    this.logger.log(`Fetching bookings for user: ${req.user.id}`);
    return this.bookingService.findAll(query, req.user.id, false);
  }

  @Get('stats/summary')
  @ApiOperation({ 
    summary: 'Get booking statistics',
    description: 'Retrieves booking statistics for business owners'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalBookings: { type: 'number', example: 150 },
        pendingBookings: { type: 'number', example: 12 },
        confirmedBookings: { type: 'number', example: 45 },
        completedBookings: { type: 'number', example: 78 },
        cancelledBookings: { type: 'number', example: 15 },
        todayBookings: { type: 'number', example: 8 },
        thisWeekBookings: { type: 'number', example: 32 },
        thisMonthBookings: { type: 'number', example: 89 }
      }
    }
  })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, BusinessOwnerGuard)
  // @Roles('business_owner', 'admin')
  async getBookingStats(@Req() req: any) {
    this.logger.log(`Fetching booking statistics for business: ${req.user.businessId}`);
    
    // This would typically call a method like bookingService.getStats(businessId)
    // For now, returning a placeholder response
    return {
      message: 'Booking statistics endpoint - implementation depends on your specific requirements',
      businessId: req.user.businessId,
      note: 'This endpoint would typically aggregate booking data for dashboard display'
    };
  }
}