import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserService } from './user.service';
import { UserRole } from './entities/user.entity';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UserService
    ) {}

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findOne(+id);
        const { passwordHash, ...result } = user;
        return { user: result };
    }
}