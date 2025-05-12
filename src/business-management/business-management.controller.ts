import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Request, UseGuards } from "@nestjs/common";
import { BusinessManagementService } from "./business-management.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { BusinessProfileDto } from "./dtos/business-profile.dto";
import { CreateServiceOfferingDto } from "src/service-offering/dtos/create-service-offering.dto";
import { ServiceOffering } from "src/service-offering/entities/service-offering.entity";
import { UpdateBusinessServicesDto } from "./dtos/business-offerings-update.dto";
import { UpdateBusinessDetailsDto } from "./dtos/business-details-update.dto";

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
    return this.businessManagementService.getBusinessProfile(businessId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':businessId')
  async addServices(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() createServiceOfferingDto: CreateServiceOfferingDto[],
    @Request() req
  ): Promise<ServiceOffering[]> {
    return this.businessManagementService.addBusinessServiceOfferings(req.user.id, businessId, createServiceOfferingDto);
  }

  @Put(':businessId/details')
  async updateBusinessDetails(
    @Param('businessId') businessId: number,
    @Body() updateBusinessDetailsDto: UpdateBusinessDetailsDto,
    @Request() req
  ) {
    return this.businessManagementService.updateBusinessDetails(
        req.user.id, 
        businessId, 
        updateBusinessDetailsDto
    );
  }

  @Put(':businessId/services')
  async updateBusinessServices(
    @Param('businessId') businessId: number,
    @Body() updateBusinessServicesDto: UpdateBusinessServicesDto,
    @Request() req
  ) {
    return this.businessManagementService.updateBusinessServices(
      req.user.id, 
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
    await this.businessManagementService.deleteBusinessAndServices(
      businessId, 
      req.user.id
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
      await this.businessManagementService.deleteServiceOffering(businessId, serviceId, req.user.id);
  }
}