import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserService } from './user.service';
import { UserRole } from './entities/user.entity';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UserSummaryDto } from './dto/user-summary.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(+id);
    const { passwordHash, ...result } = user;
    return { user: result };
  }

    @Get()
    @ApiOperation({ summary: 'Get paginated list of users. Hard cap at 50 items per page' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiResponse({
      status: 200,
      description: 'Paginated list of users',
      type: [UserSummaryDto],
    })
    async getUsers(
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ): Promise<UserSummaryDto[]> {
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(50, Math.max(1, Number(limit)));

      return await this.usersService.getUsersPaginated(pageNum, limitNum);
    }
}
