import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Request,
  UploadedFiles,
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
import { BusinessPhotoService } from '../services/business-photo.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { assertValidImageFile } from 'src/common/utils/assertFile';

@ApiTags('Business Photos')
@Controller('businesses/:businessId/photos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessPhotoController {
  constructor(private readonly businessPhotoService: BusinessPhotoService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('pictures', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload business pictures',
    description:
      'Upload one or more pictures for the business. The first picture will be set as the main photo if none exists.',
  })
  @ApiParam({ name: 'businessId', description: 'Business UUID' })
  @ApiResponse({ status: 201, description: 'Pictures uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid files or no files provided',
  })
  @ApiResponse({ status: 403, description: 'User does not own this business' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async uploadPictures(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{
    message: string;
    photoUrl?: string;
    additionalPhotos: string[];
  }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one picture file is required');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 pictures allowed per upload');
    }

    files.forEach((file) => assertValidImageFile(file));

    const result = await this.businessPhotoService.uploadPictures(
      businessId,
      req.user.id,
      files.map((file) => ({
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
}
