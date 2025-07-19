import { BadRequestException, Controller, Delete, Param, ParseIntPipe, ParseUUIDPipe, Post, Request, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BusinessPhotoService } from "../services/business-photo.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";

@ApiTags('Business Photos')
@Controller('businesses/:businessId/photos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessPhotoController {
  constructor(
    private readonly businessPhotoService: BusinessPhotoService,
  ) {}

  @Post('pictures')
  @UseInterceptors(FilesInterceptor('pictures', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload business pictures',
    description: 'Upload one or more pictures for the business. The first picture will be set as the main photo if none exists.',
  })
  @ApiParam({ name: 'businessId', description: 'Business UUID' })
  @ApiResponse({ status: 201, description: 'Pictures uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid files or no files provided' })
  @ApiResponse({ status: 403, description: 'User does not own this business' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async uploadPictures(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ message: string; photoUrl?: string; additionalPhotos: string[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one picture file is required');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 pictures allowed per upload');
    }

    files.forEach(file => this.validateImageFile(file));

    const result = await this.businessPhotoService.uploadPictures(
      businessId,
      req.user.id,
      files.map(file => ({
        buffer: file.buffer,
        originalName: file.originalname,
      })),
    );

    return {
      message: 'Pictures uploaded successfully',
      photoUrl: result.photoUrl,
      additionalPhotos: result.additionalPhotos,
    };
  }

  @Delete('pictures/:photoIndex')
  @ApiOperation({
    summary: 'Delete a specific business picture',
    description: 'Delete a specific picture by its index. Index 0 is the main photo.',
  })
  @ApiParam({ name: 'businessId', description: 'Business UUID' })
  @ApiParam({ name: 'photoIndex', description: 'Photo index (0 for main photo, 1+ for additional photos)' })
  @ApiResponse({ status: 200, description: 'Picture deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid photo index' })
  @ApiResponse({ status: 403, description: 'User does not own this business' })
  @ApiResponse({ status: 404, description: 'Business not found or picture does not exist' })
  async deletePicture(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('photoIndex', ParseIntPipe) photoIndex: number,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.businessPhotoService.deletePicture(businessId, req.user.id, photoIndex);
    return { message: 'Picture deleted successfully' };
  }

  @Delete('pictures')
  @ApiOperation({
    summary: 'Delete all business pictures',
    description: 'Delete all pictures including the main photo and additional photos.',
  })
  @ApiParam({ name: 'businessId', description: 'Business UUID' })
  @ApiResponse({ status: 200, description: 'All pictures deleted successfully' })
  @ApiResponse({ status: 403, description: 'User does not own this business' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async deleteAllPictures(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.businessPhotoService.deleteAllPictures(businessId, req.user.id);
    return { message: 'All pictures deleted successfully' };
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