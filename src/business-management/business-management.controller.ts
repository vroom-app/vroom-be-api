import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BusinessManagementService } from './business-management.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BusinessProfileDto } from './dto/business-profile.dto';
import { CreateServiceOfferingDto } from 'src/service-offering/dto/create-service-offering.dto';
import { ServiceOffering } from 'src/service-offering/entities/service-offering.entity';
import { UpdateBusinessServicesDto } from './dto/business-offerings-update.dto';
import { UpdateBusinessDetailsDto } from './dto/business-details-update.dto';
import { CreateBusinessDto } from 'src/business/dto/create-business.dto';
import { Business } from 'src/business/entities/business.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FullServiceOfferingDto } from 'src/service-offering/dto/full-service-offering.dto';

@ApiTags('Business Management')
@Controller('businesses')
export class BusinessManagementController {
  constructor(
    private readonly businessManagementService: BusinessManagementService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  // @Get(':businessId')
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get a business profile by ID (if owned)' })
  // @ApiResponse({ status: 200, description: 'Business profile returned' })
  // async getBusinesses(
  //   @Param('businessId', ParseIntPipe) businessId: string,
  //   @Request() req,
  // ): Promise<BusinessProfileDto> { //TODO return list of businesses if user is admin
  //   console.log('Fetching business profile for business ID:', businessId);
  //   return this.businessManagementService.getBusinessProfile(
  //     businessId,
  //     req.user.id,
  //   );
  // }


  @Get(':businessId')
  @ApiOperation({ summary: 'Get a business profile by ID' })
  @ApiResponse({ status: 200, description: 'Business profile returned' })
  async getBusinessDetails(
    @Param('businessId') businessId: string,
  ): Promise<BusinessProfileDto> {
    return this.businessManagementService.getBusinessDetails(
      businessId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Create a new business. TODO remove this when integration with google is done',
  })
  @ApiResponse({ status: 201, description: 'Business created successfully' })
  async CreateBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
    @Request() req,
  ): Promise<BusinessProfileDto> {
    // TODO remove this when integration with google is done
    console.log('Creating business for user ID:', req.user.id);
    return this.businessManagementService.createBusiness(
      req.user.id,
      createBusinessDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':businessId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add service offerings to a business' })
  @ApiResponse({
    status: 201,
    description: 'Service offerings added successfully',
  })
  async addServices(
    @Param('businessId') businessId: string,
    @Body() createServiceOfferingDto: CreateServiceOfferingDto[],
    @Request() req,
  ): Promise<FullServiceOfferingDto[]> {
    console.log('Adding service offerings for business ID:', businessId);
    return this.businessManagementService.addBusinessServiceOfferings(
      req.user.id,
      businessId,
      createServiceOfferingDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':businessId/details')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update business details' })
  @ApiResponse({
    status: 200,
    description: 'Business details updated successfully',
  })
  async updateBusinessDetails(
    @Param('businessId') businessId: string,
    @Body() updateBusinessDetailsDto: UpdateBusinessDetailsDto,
    @Request() req,
  ): Promise<BusinessProfileDto> {
    console.log('Updating business details for business ID:', businessId);
    return this.businessManagementService.updateBusinessDetails(
      req.user.id,
      businessId,
      updateBusinessDetailsDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':businessId/services')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service offerings for a business' })
  @ApiResponse({ status: 200, description: 'Services updated successfully' })
  async updateBusinessServices(
    @Param('businessId') businessId: string,
    @Body() updateBusinessServicesDto: UpdateBusinessServicesDto,
    @Request() req,
  ): Promise<FullServiceOfferingDto[]> {
    console.log('Updating business services for business ID:', businessId);
    return this.businessManagementService.updateBusinessServices(
      req.user.id,
      businessId,
      updateBusinessServicesDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':businessId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a business and its services' })
  @ApiResponse({ status: 204, description: 'Business deleted successfully' })
  async deleteBusiness(
    @Param('businessId') businessId: string,
    @Request() req,
  ): Promise<void> {
    console.log('Deleting business with ID:', businessId);
    await this.businessManagementService.deleteBusinessAndServices(
      businessId,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':businessId/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a specific service offering from a business',
  })
  @ApiResponse({
    status: 204,
    description: 'Service offering deleted successfully',
  })
  async deleteService(
    @Param('businessId') businessId: string,
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Request() req,
  ): Promise<void> {
    console.log('Deleting service with ID:', serviceId);
    await this.businessManagementService.deleteServiceOffering(
      req.user.id,
      businessId,
      serviceId,
    );
  }
}
