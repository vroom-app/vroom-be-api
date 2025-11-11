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
  ApiBody,
  ApiOperation,
  ApiParam,
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
  @ApiParam({
    name: 'businessId',
    description: 'The UUID of the business to which the services belong',
    example: 'eb9a85b0-ae52-4b4a-9d72-9cfc80b3138c',
  })
  @ApiBody({
    type: [CreateServiceOfferingDto],
    description: 'List of services to be added to a business',
  })
  @ApiResponse({
    status: 201,
    description: 'Service offerings added successfully',
    type: [ServiceOfferingDto],
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
  @ApiOperation({
    summary: 'Update service offerings for a business',
  })
  @ApiParam({
    name: 'businessId',
    description: 'The UUID of the business to which the services belong',
    example: 'eb9a85b0-ae52-4b4a-9d72-9cfc80b3138c',
  })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service offering to update',
    example: 123,
  })
  @ApiBody({
    type: [CreateServiceOfferingDto],
    description: 'Service which should be updated',
  })
  @ApiResponse({
    status: 201,
    description: 'Service updated successfully',
    type: [ServiceOfferingDto],
  })
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
