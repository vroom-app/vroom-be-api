import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { CreateCarDto } from "./dto/create-car.dto";
import { Car } from "./entities/car.entity";
import { CarService } from "./services/car.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('Cars')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cars')
export class CarController {
    constructor(
        private readonly carService: CarService
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new car for the logged-in user' })
    @ApiResponse({ status: 201, description: 'Car created successfully', type: Car })
    async create(
        @Request() req,
        @Body() createCarDto: CreateCarDto,
    ): Promise<Car> {
        const userId: number = req.user.id;
        return this.carService.create(createCarDto, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all cars for the logged-in user' })
    @ApiResponse({ status: 200, description: 'List of user cars', type: [Car] })
    async findAllUserCars(
        @Request() req
    ): Promise<Car[]> {
        const userId = req.user.id;
        return this.carService.findAllByUser(userId);
    }
}