import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateCarDto, UpdateCarDto } from './dto/car-management.dto';
import { CarService } from './services/car.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CarResponseDto } from './dto/car-response.dto';

@ApiTags('Cars')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cars for the logged-in user' })
  @ApiOkResponse({
    description: 'List of cars owned by the authenticated user',
    type: CarResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAllUserCars(@Request() req): Promise<CarResponseDto[]> {
    const userId = req.user.id;
    return this.carService.findAllByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new car for the logged-in user' })
  @ApiBody({ type: CreateCarDto, description: 'Car update payload' })
  @ApiCreatedResponse({
    description: 'Car created successfully',
    type: CarResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid car data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(
    @Request() req,
    @Body() createCarDto: CreateCarDto,
  ): Promise<CarResponseDto> {
    const userId = req.user.id;
    return this.carService.createCar(userId, createCarDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a car by ID for the logged-in user' })
  @ApiBody({ type: UpdateCarDto, description: 'Car update payload' })
  @ApiOkResponse({
    description: 'Car updated successfully',
    type: CarResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Car not found' })
  @ApiBadRequestResponse({ description: 'Invalid update data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(
    @Request() req,
    @Param('id') carId: string,
    @Body() updateCarDto: UpdateCarDto,
  ): Promise<CarResponseDto> {
    const userId = req.user.id;
    return this.carService.update(carId, userId, updateCarDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a car by ID for the logged-in user' })
  @ApiOkResponse({ description: 'Car deleted successfully' })
  @ApiNotFoundResponse({ description: 'Car not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteById(@Request() req, @Param('id') carId: string): Promise<void> {
    const userId = req.user.id;
    await this.carService.deleteById(carId, userId);
  }
}
