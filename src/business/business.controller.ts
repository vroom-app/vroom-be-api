import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BusinessService } from './services/business.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Business } from './entities/business.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Businesses')
@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get businesses owned by the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of user-owned businesses returned',
  })
  async getMyBusinesses(@Request() req): Promise<Business[]> {
    return this.businessService.getAllUserBusinesses(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a business owned by the authenticated user',
  })
  @ApiResponse({ status: 204, description: 'Business deleted successfully' })
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<void> {
    await this.businessService.deleteBusinessByIdAndUserId(id, req.user.id);
  }
}
