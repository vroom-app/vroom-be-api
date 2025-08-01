import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BusinessProfileDto } from '../dto/business-profile.dto';
import {
  CreateBusinessDto,
  UpdateBusinessDto,
} from 'src/business/dto/business.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BusinessManagementService } from '../services/business-management.service';

@ApiTags('Business Management')
@Controller('businesses')
export class BusinessManagementController {
  constructor(
    private readonly businessManagementService: BusinessManagementService,
  ) {}

  @Get(':businessId')
  @ApiOperation({ summary: 'Get a business profile by ID' })
  @ApiResponse({ status: 200, description: 'Business profile returned' })
  async getBusinessDetails(
    @Param('businessId') businessId: string,
  ): Promise<BusinessProfileDto> {
    return this.businessManagementService.getBusinessProfile(businessId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new business.',
  })
  @ApiResponse({ status: 201, description: 'Business created successfully' })
  async CreateBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
    @Request() req,
  ): Promise<BusinessProfileDto> {
    return this.businessManagementService.createBusiness(
      req.user.id,
      createBusinessDto,
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
    @Body() updateBusinessDto: UpdateBusinessDto,
    @Request() req,
  ): Promise<BusinessProfileDto> {
    return this.businessManagementService.updateBusinessDetails(
      req.user.id,
      businessId,
      updateBusinessDto,
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
    await this.businessManagementService.deleteBusinessAndServices(
      businessId,
      req.user.id,
    );
  }
}
