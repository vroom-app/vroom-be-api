import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BusinessLogoService } from '../services/business-logo.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { assertValidImageFile } from 'src/common/utils/assertFile';

@ApiTags('Business Photos')
@Controller('businesses/:businessId/logo')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessLogoController {
  constructor(private readonly businessLogoService: BusinessLogoService) {}

  @Post('logo')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload or update business logo',
    description:
      'Upload a logo for the business. If no map logo exists, this will also be used as the map logo.',
  })
  @ApiParam({ name: 'businessId', description: 'Business UUID' })
  @ApiResponse({ status: 201, description: 'Logo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or missing file' })
  @ApiResponse({ status: 403, description: 'User does not own this business' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async uploadLogo(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; logoUrl: string; logoMapUrl?: string }> {
    if (!file) {
      throw new BadRequestException('Logo file is required');
    }

    assertValidImageFile(file);

    const result = await this.businessLogoService.uploadLogo(
      businessId,
      req.user.id,
      file.buffer,
      file.originalname,
    );

    return {
      message: 'Logo uploaded successfully',
      logoUrl: result.logoUrl,
      logoMapUrl: result.logoMapUrl,
    };
  }

  @Post('map-logo')
  @UseInterceptors(FileInterceptor('mapLogo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload or update business map logo',
    description: 'Upload a specific logo to be used on maps.',
  })
  @ApiParam({ name: 'businessId', description: 'Business UUID' })
  @ApiResponse({ status: 201, description: 'Map logo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or missing file' })
  @ApiResponse({ status: 403, description: 'User does not own this business' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async uploadMapLogo(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; logoMapUrl: string }> {
    if (!file) {
      throw new BadRequestException('Map logo file is required');
    }

    assertValidImageFile(file);

    const logoMapUrl = await this.businessLogoService.uploadMapLogo(
      businessId,
      req.user.id,
      file.buffer,
      file.originalname,
    );

    return {
      message: 'Map logo uploaded successfully',
      logoMapUrl,
    };
  }
}
