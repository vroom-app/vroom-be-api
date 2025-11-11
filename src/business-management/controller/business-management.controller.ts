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
  ApiBody,
  ApiOperation,
  ApiParam,
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
  @ApiParam({
    name: 'businessId',
    description: 'The UUID of the business',
    example: 'eb9a85b0-ae52-4b4a-9d72-9cfc80b3138c',
  })
  @ApiResponse({
    status: 200,
    description: 'Business profile returned',
    type: [BusinessProfileDto],
  })
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
  @ApiBody({
    type: [CreateBusinessDto],
    description: 'Business data to be created',
  })
  @ApiResponse({
    status: 201,
    description: 'Business created successfully',
    type: [BusinessProfileDto],
  })
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
  @ApiParam({
    name: 'businessId',
    description: 'The UUID of the business',
    example: 'eb9a85b0-ae52-4b4a-9d72-9cfc80b3138c',
  })
  @ApiBody({
    type: [UpdateBusinessDto],
    description: 'Business data to be updated',
  })
  @ApiResponse({
    status: 200,
    description: 'Business details updated successfully',
    type: [BusinessProfileDto],
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
  @ApiParam({
    name: 'businessId',
    description: 'The UUID of the business',
    example: 'eb9a85b0-ae52-4b4a-9d72-9cfc80b3138c',
  })
  @ApiResponse({
    status: 204,
    description: 'Business deleted successfully',
  })
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
