import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceOfferingManagementService } from '../services/service-offering-management.service';
import { CreateServiceOfferingDto } from 'src/service-offering/dto/create-service-offering.dto';
import { ServiceOfferingDto } from 'src/service-offering/dto/service-offering.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Service Offering Management')
@Controller('service')
export class ServiceOfferingManagementController {
  constructor(
    private readonly serviceOfferingManagementService: ServiceOfferingManagementService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':businessId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add service offerings to a business' })
  @ApiResponse({
    status: 201,
    description: 'Service offerings added successfully',
  })
  async addServiceOfferings(
    @Param('businessId') businessId: string,
    @Body() createServiceOfferingDto: CreateServiceOfferingDto[],
    @Request() req,
  ): Promise<ServiceOfferingDto[]> {
    return this.serviceOfferingManagementService.createServiceOfferingsForBusiness(
      req.user.id,
      businessId,
      createServiceOfferingDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':businessId/:serviceId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service offerings for a business' })
  @ApiResponse({ status: 200, description: 'Services updated successfully' })
  async updateServiceOfferings(
    @Param('businessId') businessId: string,
    @Param('serviceId') serviceId: number,
    @Body() updateData: Partial<CreateServiceOfferingDto>,
    @Request() req,
  ): Promise<ServiceOfferingDto> {
    return this.serviceOfferingManagementService.updateBusinessService(
      req.user.id,
      businessId,
      serviceId,
      updateData,
    );
  }
}
