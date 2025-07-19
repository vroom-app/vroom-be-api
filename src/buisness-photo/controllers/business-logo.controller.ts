import { BadRequestException, Controller, Delete, Param, ParseUUIDPipe, Post, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { BusinessLogoService } from "../services/business-logo.service";
import { FileInterceptor } from "@nestjs/platform-express";

@ApiTags('Business Photos')
@Controller('businesses/:businessId/logo')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessLogoController {
  constructor(
    private readonly businessLogoController: BusinessLogoService,
  ) {}

  @Post('logo')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload or update business logo',
    description: 'Upload a logo for the business. If no map logo exists, this will also be used as the map logo.',
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

    this.validateImageFile(file);

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

    this.validateImageFile(file);

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

  @Delete('logo')
  @ApiOperation({
    summary: 'Delete business logo',
    description: 'Delete the business logo. This will not affect the map logo.',
  })
  @ApiParam({ name: 'businessId', description: 'Business UUID' })
  @ApiResponse({ status: 200, description: 'Logo deleted successfully' })
  @ApiResponse({ status: 403, description: 'User does not own this business' })
  @ApiResponse({ status: 404, description: 'Business not found or logo does not exist' })
  async deleteLogo(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.businessLogoService.deleteLogo(businessId, req.user.id);
    return { message: 'Logo deleted successfully' };
  }

  @Delete('map-logo')
  @ApiOperation({
    summary: 'Delete business map logo',
    description: 'Delete the business map logo.',
  })
  @ApiParam({ name: 'businessId', description: 'Business UUID' })
  @ApiResponse({ status: 200, description: 'Map logo deleted successfully' })
  @ApiResponse({ status: 403, description: 'User does not own this business' })
  @ApiResponse({ status: 404, description: 'Business not found or map logo does not exist' })
  async deleteMapLogo(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.businessLogoService.deleteMapLogo(businessId, req.user.id);
    return { message: 'Map logo deleted successfully' };
  }

  private validateImageFile(
    file: Express.Multer.File
): void {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB.');
    }
  }
}