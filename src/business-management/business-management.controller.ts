import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, Request, UseGuards } from "@nestjs/common";
import { BusinessManagementService } from "./business-management.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { BusinessProfileDto } from "./dtos/business-profile.dto";
import { CreateServiceOfferingDto } from "src/service-offering/dtos/create-service-offering.dto";
import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";
import { UpdateBusinessServicesDto } from "./dtos/business-offerings-update.dto";
import { UpdateBusinessDetailsDto } from "./dtos/business-details-update.dto";
import { CreateBusinessDto } from "src/business/dtos/create-business.dto";
import { Business } from "src/business/entities/business.entity";

@Controller('businesses')
export class BusinessManagementController {
  constructor(
    private readonly businessManagementService: BusinessManagementService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get(':businessId')
  async getMyBusinesses(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Request() req
  ): Promise<BusinessProfileDto> {
    console.log('Fetching business profile for business ID:', businessId);
    return this.businessManagementService.getBusinessProfile(businessId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async CreateBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
    @Request() req
  ): Promise<Business> { // TODO remove this when integration with google is done
    console.log('Creating business for user ID:', req.user.userId);
    return this.businessManagementService.createBusiness(req.user.userId, createBusinessDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':businessId')
  async addServices(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() createServiceOfferingDto: CreateServiceOfferingDto[],
    @Request() req
  ): Promise<ServiceOffering[]> {
    console.log('Adding service offerings for business ID:', businessId);
    return this.businessManagementService.addBusinessServiceOfferings(req.user.userId, businessId, createServiceOfferingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':businessId/details')
  async updateBusinessDetails(
    @Param('businessId') businessId: number,
    @Body() updateBusinessDetailsDto: UpdateBusinessDetailsDto,
    @Request() req
  ) {
    console.log('Updating business details for business ID:', businessId);
    return this.businessManagementService.updateBusinessDetails(
        req.user.userId, 
        businessId, 
        updateBusinessDetailsDto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':businessId/services')
  async updateBusinessServices(
    @Param('businessId') businessId: number,
    @Body() updateBusinessServicesDto: UpdateBusinessServicesDto,
    @Request() req
  ) {
    console.log('Updating business services for business ID:', businessId);
    return this.businessManagementService.updateBusinessServices(
      req.user.userId, 
      businessId, 
      updateBusinessServicesDto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':businessId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBusiness(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Request() req
  ): Promise<void> {
    console.log('Deleting business with ID:', businessId);
    await this.businessManagementService.deleteBusinessAndServices(
      businessId, 
      req.user.userId
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':businessId/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteService(
      @Param('businessId', ParseIntPipe) businessId: number,
      @Param('serviceId', ParseIntPipe) serviceId: number,
      @Request() req
  ): Promise<void> {
    console.log('Deleting service with ID:', serviceId);
    await this.businessManagementService.deleteServiceOffering(businessId, serviceId, req.user.userId);
  }
}