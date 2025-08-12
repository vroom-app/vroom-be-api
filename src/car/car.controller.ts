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
import { CreateCarDto, UpdateCarDto } from './dto/create-car.dto';
import { Car } from './entities/car.entity';
import { CarService } from './services/car.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CarResponseDto } from './dto/car.dto';

@ApiTags('Cars')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cars for the logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'List of user cars',
    type: [CarResponseDto],
  })
  async findAllUserCars(@Request() req): Promise<CarResponseDto[]> {
    const userId = req.user.id;
    return this.carService.findAllByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new car for the logged-in user' })
  @ApiResponse({
    status: 201,
    description: 'Car created successfully',
    type: Car,
  })
  async create(
    @Request() req,
    @Body() createCarDto: CreateCarDto,
  ): Promise<CarResponseDto> {
    const userId = req.user.id;
    return this.carService.createCar(userId, createCarDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a car by ID for the logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'Car updated successfully',
    type: CarResponseDto,
  })
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
  @ApiResponse({ status: 200, description: 'Car deleted successfully' })
  async deleteById(@Request() req, @Param('id') carId: string): Promise<void> {
    const userId = req.user.id;
    await this.carService.deleteById(carId, userId);
  }
}
